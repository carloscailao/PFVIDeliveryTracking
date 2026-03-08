const OrderState = require('../OrderState');
const { STATUS_KEYS } = require('../statusConstants');
const { processPayment } = require('../../paymentStrategy');

class Delivered extends OrderState {
  allowedTransitions() {
    // allow domain-specific follow-ups if necessary
    return [STATUS_KEYS.DEFERRED, STATUS_KEYS.CANCELLED];
  }

  async onEnter(meta = {}) {
    this.order.dateDelivered = new Date();
    if (meta.receivedBy) this.order.deliveryReceivedBy = meta.receivedBy;
    
    // Save cheque details if provided
    if (meta.chequeNumber) this.order.chequeNumber = meta.chequeNumber;
    if (meta.bankName) this.order.bankName = meta.bankName;
    
    const isCashOrder = this.order.paymentMethod === 'Cash';
    const hasAmountDue = Number(this.order.paymentAmt) > 0;
    const shouldProcessPayment = (meta.paymentReceived != null || meta.paymentReceivedBy) || (isCashOrder && hasAmountDue);

    // Use payment strategy to process payment when payment data is provided,
    // or when cash immediate-settlement rules require it.
    if (shouldProcessPayment) {
      const paymentData = {
        amount: meta.paymentReceived,
        receivedBy: meta.paymentReceivedBy,
      };

      // Process payment using strategy pattern
      const result = processPayment(this.order, paymentData);
      
      if (!result.success) {
        const err = new Error(result.error || 'Payment validation failed.');
        err.code = 'PAYMENT_VALIDATION_FAILED';
        throw err;
      }
    }
    
    this.order.lastModified = meta.actorId ? `${meta.actorId};${new Date().toISOString()}` : `system;${new Date().toISOString()}`;
  }
}

module.exports = Delivered;
