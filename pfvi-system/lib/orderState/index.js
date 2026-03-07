const { STATUS_KEYS, STATUSES } = require('./statusConstants');
const OrderState = require('./OrderState');
const BeingPrepared = require('./states/BeingPrepared');
const PickedUp = require('./states/PickedUp');
const InTransit = require('./states/InTransit');
const Delivered = require('./states/Delivered');
const Deferred = require('./states/Deferred');
const Cancelled = require('./states/Cancelled');

function getState(order) {
  switch (order.orderStatus) {
    case STATUS_KEYS.BEING_PREPARED: return new BeingPrepared(order);
    case STATUS_KEYS.PICKED_UP: return new PickedUp(order);
    case STATUS_KEYS.IN_TRANSIT: return new InTransit(order);
    case STATUS_KEYS.DELIVERED: return new Delivered(order);
    case STATUS_KEYS.DEFERRED: return new Deferred(order);
    case STATUS_KEYS.CANCELLED: return new Cancelled(order);
    default: return new OrderState(order);
  }
}

module.exports = { getState, STATUS_KEYS, STATUSES };
