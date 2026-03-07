const OrderState = require('../OrderState');
const { STATUS_KEYS } = require('../statusConstants');

class PickedUp extends OrderState {
  allowedTransitions() {
    return [STATUS_KEYS.IN_TRANSIT, STATUS_KEYS.DEFERRED, STATUS_KEYS.CANCELLED];
  }

  async onEnter(meta = {}) {
    if (this.order.driverAssignedID) {
      this.order.assignmentStatus = 'Driver Assigned';
    }
    this.order.lastModified = meta.actorId ? `${meta.actorId};${new Date().toISOString()}` : `system;${new Date().toISOString()}`;
  }
}

module.exports = PickedUp;
