const { STATUS_KEYS } = require('./statusConstants');

class OrderState {
  constructor(order) {
    this.order = order;
  }

  name() {
    return this.order.orderStatus;
  }

  allowedTransitions() {
    return [];
  }

  canTransitionTo(newStatus) {
    return this.allowedTransitions().includes(newStatus);
  }

  async transitionTo(newStatus, meta = {}) {
    if (!this.canTransitionTo(newStatus)) {
      const err = new Error(`Invalid transition: ${this.name()} -> ${newStatus}`);
      err.code = 'INVALID_TRANSITION';
      throw err;
    }

    // update the status and record timestamp
    this.order.orderStatus = newStatus;
    if (!this.order.statusTimestamps) this.order.statusTimestamps = {};
    if (typeof this.order.statusTimestamps.set === 'function') {
      this.order.statusTimestamps.set(newStatus, new Date());
    } else {
      this.order.statusTimestamps[newStatus] = new Date();
    }

    // call onEnter hook of the new state (if present)
    const { getState } = require('./index');
    const newState = getState(this.order);
    if (typeof newState.onEnter === 'function') {
      await newState.onEnter(meta);
    }

    return this.order;
  }
}

module.exports = OrderState;
