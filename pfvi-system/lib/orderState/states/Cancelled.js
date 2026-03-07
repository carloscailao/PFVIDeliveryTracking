const OrderState = require('../OrderState');
const { STATUS_KEYS } = require('../statusConstants');

class Cancelled extends OrderState {
  allowedTransitions() {
    return [];
  }

  async onEnter(meta = {}) {
    this.order.lastModified = meta.actorId ? `${meta.actorId};${new Date().toISOString()}` : `system;${new Date().toISOString()}`;
  }
}

module.exports = Cancelled;
