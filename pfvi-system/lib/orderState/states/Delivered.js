const OrderState = require('../OrderState');
const { STATUS_KEYS } = require('../statusConstants');

class Delivered extends OrderState {
  allowedTransitions() {
    // allow domain-specific follow-ups if necessary
    return [STATUS_KEYS.DEFERRED, STATUS_KEYS.CANCELLED];
  }

  async onEnter(meta = {}) {
    this.order.dateDelivered = new Date();
    if (meta.receivedBy) this.order.deliveryReceivedBy = meta.receivedBy;
    if (meta.paymentReceived != null) this.order.paymentReceived = meta.paymentReceived;
    if (meta.paymentReceivedBy) this.order.paymentReceivedBy = meta.paymentReceivedBy;
    this.order.lastModified = meta.actorId ? `${meta.actorId};${new Date().toISOString()}` : `system;${new Date().toISOString()}`;
  }
}

module.exports = Delivered;
