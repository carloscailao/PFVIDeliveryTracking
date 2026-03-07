(async () => {
  try {
    const { getState, STATUS_KEYS, STATUSES } = require('../lib/orderState');

    function makeOrder(status) {
      return {
        orderStatus: status,
        statusTimestamps: {},
        driverAssignedID: null,
        assignmentStatus: 'No Driver Assigned',
        dateDelivered: null,
        deliveryReceivedBy: null,
        paymentReceived: null,
        paymentReceivedBy: null,
        lastModified: null,
      };
    }

    console.log('All statuses:', STATUSES);

    // Start with Being Prepared
    const order = makeOrder(STATUS_KEYS.BEING_PREPARED);
    const state = getState(order);
    console.log('Current status:', state.name());
    console.log('Allowed from Being Prepared:', state.allowedTransitions());

    // Valid transition: Being Prepared -> Picked Up
    console.log('\nTrying valid transition: Being Prepared -> Picked Up');
    await state.transitionTo(STATUS_KEYS.PICKED_UP, { actorId: 'tester' });
    console.log('After transition, orderStatus =', order.orderStatus);
    console.log('Timestamps:', order.statusTimestamps);
    console.log('Last modified:', order.lastModified);

    // Now transition Picked Up -> In Transit
    const state2 = getState(order);
    console.log('\nCurrent status:', state2.name());
    console.log('Allowed from Picked Up:', state2.allowedTransitions());
    console.log('Trying Picked Up -> In Transit');
    await state2.transitionTo(STATUS_KEYS.IN_TRANSIT, { actorId: 'tester' });
    console.log('After transition, orderStatus =', order.orderStatus);
    console.log('Timestamps:', order.statusTimestamps);

    // Invalid transition: try to go back to Being Prepared
    const state3 = getState(order);
    console.log('\nAttempt invalid transition: In Transit -> Being Prepared');
    try {
      await state3.transitionTo(STATUS_KEYS.BEING_PREPARED, { actorId: 'tester' });
      console.log('ERROR: invalid transition succeeded unexpectedly');
    } catch (err) {
      console.log('Caught expected error:', err.message);
    }

    // Delivered flow: In Transit -> Delivered with meta
    console.log('\nTrying In Transit -> Delivered with meta');
    await state3.transitionTo(STATUS_KEYS.DELIVERED, { actorId: 'tester', receivedBy: 'Customer', paymentReceived: 100, paymentReceivedBy: 'Driver' });
    console.log('After transition, orderStatus =', order.orderStatus);
    console.log('dateDelivered:', order.dateDelivered);
    console.log('deliveryReceivedBy:', order.deliveryReceivedBy);
    console.log('paymentReceived:', order.paymentReceived);
    console.log('paymentReceivedBy:', order.paymentReceivedBy);

    console.log('\nAll tests completed successfully');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
})();
