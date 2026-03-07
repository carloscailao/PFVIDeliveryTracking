import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import Order from '@/models/Order';


// --- POST: Update order status ---
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.name) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const userName = session.user.name;

        const { 
            orderId,
            newStatus,
            deliveryDate,
            deliveryReceivedBy,
            paymentReceived,
            paymentReceivedBy,
        } = await request.json();

        if (!orderId || !newStatus) {
            return new Response(JSON.stringify({ error: 'Missing orderID or newStatus.' }), 
            {status: 400,});
        }

        await connectToDatabase();

        // Load the order and use the state machine to validate and apply transitions
        const order = await Order.findById(orderId);
        if (!order) {
            return new Response(JSON.stringify({ error: 'Order not found.' }), { status: 404 });
        }

        // Dynamically import the state factory (keeps ESM style)
        const orderStateModule = await import('@/lib/orderState');
        const orderState = orderStateModule.default || orderStateModule;
        const { getState } = orderState;
        const state = getState(order);

        const meta = {
            actorId: userName,
            receivedBy: deliveryReceivedBy || null,
            paymentReceived: paymentReceived ?? null,
            paymentReceivedBy: paymentReceivedBy || null,
            deliveryDate: deliveryDate || null,
        };

        try {
            await state.transitionTo(newStatus, meta);
        } catch (err) {
            if (err && err.code === 'INVALID_TRANSITION') {
                return new Response(JSON.stringify({ error: err.message }), { status: 400 });
            }
            throw err;
        }

        // Allow route-level override of the delivery date if provided
        if (deliveryDate) {
            order.dateDelivered = deliveryDate;
        }

        await order.save();
        await order.populate('salesmanID', 'firstName lastName').populate('driverAssignedID', 'firstName lastName');

        return new Response(JSON.stringify({ success: true, updatedOrder: order }), {
            status: 200,
        });


    } catch (err) {
        console.error('Order status update error:', err);
        return new Response(JSON.stringify({ error: 'Failed to update order status.' }), {
            status: 500,
        });
    }
}