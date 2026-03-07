const OrderState = require('../OrderState');
const { STATUS_KEYS } = require('../statusConstants');

class Deferred extends OrderState {
  allowedTransitions() {
    return [STATUS_KEYS.IN_TRANSIT, STATUS_KEYS.CANCELLED];
  }

  async onEnter(meta = {}) {
    this.order.lastModified = meta.actorId ? `${meta.actorId};${new Date().toISOString()}` : `system;${new Date().toISOString()}`;
  }
}

module.exports = Deferred;
