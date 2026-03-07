import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import Order from '@/models/Order';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();

    const { orderId } = params || {};
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Missing orderId' }), { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found.' }), { status: 404 });
    }

    // Dynamic import with default fallback to support both CJS and ESM exports
    const orderStateModule = await import('@/lib/orderState');
    const orderState = orderStateModule.default || orderStateModule;
    const { getState, STATUSES } = orderState;

    const state = getState(order);
    const allowed = typeof state.allowedTransitions === 'function' ? state.allowedTransitions() : [];

    return new Response(JSON.stringify({
      currentStatus: order.orderStatus,
      allowedTransitions: allowed,
      allStatuses: STATUSES,
    }), { status: 200 });

  } catch (err) {
    console.error('Failed to fetch allowed actions:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch allowed actions.' }), { status: 500 });
  }
}
