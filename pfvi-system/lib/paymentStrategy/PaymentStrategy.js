/**
 * Base PaymentStrategy class
 * Defines the interface for payment processing strategies
 */
class PaymentStrategy {
  constructor() {
    if (this.constructor === PaymentStrategy) {
      throw new Error("PaymentStrategy is an abstract class and cannot be instantiated directly.");
    }
  }

  /**
   * Get the payment method name
   * @returns {string}
   */
  getMethodName() {
    throw new Error("getMethodName() must be implemented by subclass");
  }

  /**
   * Validate payment details before processing
   * @param {Object} order - The order object
   * @param {Object} paymentData - Payment details to validate
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.receivedBy - Who received the payment
   * @returns {Object} { valid: boolean, error?: string }
   */
  validatePayment(order, paymentData) {
    // Base validation - check required fields
    if (!order) {
      return { valid: false, error: "Order is required" };
    }

    if (!paymentData) {
      return { valid: false, error: "Payment data is required" };
    }

    if (paymentData.amount !== null && paymentData.amount !== undefined) {
      const amount = Number(paymentData.amount);
      if (isNaN(amount) || amount < 0) {
        return { valid: false, error: "Payment amount must be a valid non-negative number" };
      }
    }

    return { valid: true };
  }

  /**
   * Process the payment and update order
   * @param {Object} order - The order object to update
   * @param {Object} paymentData - Payment details
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.receivedBy - Who received the payment
   * @returns {Object} Updated order object
   */
  processPayment(order, paymentData) {
    throw new Error("processPayment() must be implemented by subclass");
  }

  /**
   * Get payment status and details
   * @param {Object} order - The order object
   * @returns {Object} Payment status information
   */
  getPaymentDetails(order) {
    if (!order) return null;

    const expectedAmount = Number(order.paymentAmt) || 0;
    const receivedAmount = Number(order.paymentReceived) || 0;
    const isPaid = receivedAmount > 0 && receivedAmount >= expectedAmount;
    const isPartiallyPaid = receivedAmount > 0 && receivedAmount < expectedAmount;

    return {
      method: order.paymentMethod,
      expectedAmount,
      receivedAmount,
      balance: expectedAmount - receivedAmount,
      isPaid,
      isPartiallyPaid,
      isPending: receivedAmount === 0,
      receivedBy: order.paymentReceivedBy || null,
    };
  }

  /**
   * Check if payment is complete
   * @param {Object} order - The order object
   * @returns {boolean}
   */
  isPaymentComplete(order) {
    const details = this.getPaymentDetails(order);
    return details ? details.isPaid : false;
  }
}

module.exports = PaymentStrategy;
