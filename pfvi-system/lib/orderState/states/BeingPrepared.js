const OrderState = require('../OrderState');
const { STATUS_KEYS } = require('../statusConstants');

class BeingPrepared extends OrderState {
  allowedTransitions() {
    return [STATUS_KEYS.PICKED_UP, STATUS_KEYS.DEFERRED, STATUS_KEYS.CANCELLED];
  }

  async onEnter(meta = {}) {
    this.order.lastModified = meta.actorId ? `${meta.actorId};${new Date().toISOString()}` : `system;${new Date().toISOString()}`;
  }
}

module.exports = BeingPrepared;
