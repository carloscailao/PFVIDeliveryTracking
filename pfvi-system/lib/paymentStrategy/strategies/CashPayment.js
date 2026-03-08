const PaymentStrategy = require('../PaymentStrategy');

/**
 * Cash Payment Strategy
 * Handles cash payment processing with immediate settlement
 */
class CashPayment extends PaymentStrategy {
  getMethodName() {
    return 'Cash';
  }

  /**
   * Validate cash payment details
   * Cash payments require exact amount validation
   */
  validatePayment(order, paymentData) {
    // Run base validation first
    const baseValidation = super.validatePayment(order, paymentData);
    if (!baseValidation.valid) {
      return baseValidation;
    }

    // Cash-specific validation
    const amount = Number(paymentData.amount);
    const expectedAmount = Number(order.paymentAmt) || 0;

    // Cash is immediate settlement: if there's an amount due, full amount is required.
    if (expectedAmount > 0 && (paymentData.amount === null || paymentData.amount === undefined || Number.isNaN(amount))) {
      return {
        valid: false,
        error: "Cash orders require full payment at delivery.",
      };
    }

    if (paymentData.amount !== null && paymentData.amount !== undefined) {
      if (amount < 0) {
        return {
          valid: false,
          error: "Cash payment amount cannot be negative"
        };
      }

      if (expectedAmount > 0 && amount !== expectedAmount) {
        return {
          valid: false,
          error: `Cash payment must exactly match amount due (${expectedAmount}).`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Process cash payment
   * Cash is recorded immediately upon receipt
   */
  processPayment(order, paymentData) {
    const validation = this.validatePayment(order, paymentData);
    if (!validation.valid) {
      throw new Error(`Cash payment validation failed: ${validation.error}`);
    }

    // Record cash payment
    if (paymentData.amount !== null && paymentData.amount !== undefined) {
      order.paymentReceived = Number(paymentData.amount);
    }

    if (paymentData.receivedBy) {
      order.paymentReceivedBy = paymentData.receivedBy;
    }

    // Add timestamp for cash receipt
    if (!order.paymentReceivedDate && order.paymentReceived > 0) {
      order.paymentReceivedDate = new Date();
    }

    return order;
  }

  /**
   * Get cash-specific payment details
   */
  getPaymentDetails(order) {
    const baseDetails = super.getPaymentDetails(order);
    
    return {
      ...baseDetails,
      methodType: 'Cash',
      requiresClearing: false, // Cash doesn't need bank clearing
      isImmediate: true,
    };
  }
}

module.exports = CashPayment;
