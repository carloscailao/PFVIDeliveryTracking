const PaymentStrategy = require('../PaymentStrategy');

/**
 * Cheque Payment Strategy
 * Handles cheque payment processing with clearing considerations
 */
class ChequePayment extends PaymentStrategy {
  getMethodName() {
    return 'Cheque';
  }

  /**
   * Validate cheque payment details
   * Cheques require additional validation for clearing
   */
  validatePayment(order, paymentData) {
    // Run base validation first
    const baseValidation = super.validatePayment(order, paymentData);
    if (!baseValidation.valid) {
      return baseValidation;
    }

    // Cheque-specific validation
    const amount = Number(paymentData.amount);
    const expectedAmount = Number(order.paymentAmt) || 0;

    if (paymentData.amount !== null && paymentData.amount !== undefined) {
      if (amount <= 0) {
        return { 
          valid: false, 
          error: "Cheque payment amount must be greater than zero" 
        };
      }

      // Cheque payments must match the billed amount exactly.
      if (expectedAmount > 0 && amount !== expectedAmount) {
        return {
          valid: false,
          error: `Cheque payment must exactly match amount due (${expectedAmount}).`,
        };
      }
    }

    // Optional: validate cheque-specific fields if added in future
    // (cheque number, bank name, clearing date, etc.)
    if (paymentData.chequeNumber && typeof paymentData.chequeNumber !== 'string') {
      return {
        valid: false,
        error: "Cheque number must be a string"
      };
    }

    return { valid: true };
  }

  /**
   * Process cheque payment
   * Cheques are recorded but marked as subject to clearing
   */
  processPayment(order, paymentData) {
    const validation = this.validatePayment(order, paymentData);
    if (!validation.valid) {
      throw new Error(`Cheque payment validation failed: ${validation.error}`);
    }

    // Record cheque payment
    if (paymentData.amount !== null && paymentData.amount !== undefined) {
      order.paymentReceived = Number(paymentData.amount);
    }

    if (paymentData.receivedBy) {
      order.paymentReceivedBy = paymentData.receivedBy;
    }

    // Record cheque-specific details if provided
    if (paymentData.chequeNumber) {
      order.chequeNumber = paymentData.chequeNumber;
    }

    if (paymentData.bankName) {
      order.bankName = paymentData.bankName;
    }

    // Add timestamp for cheque receipt
    if (!order.paymentReceivedDate && order.paymentReceived > 0) {
      order.paymentReceivedDate = new Date();
    }

    // Add clearing status (for future enhancement)
    if (!order.chequeClearingStatus) {
      order.chequeClearingStatus = 'Pending'; // Could be: Pending, Cleared, Bounced
    }

    return order;
  }

  /**
   * Get cheque-specific payment details
   */
  getPaymentDetails(order) {
    const baseDetails = super.getPaymentDetails(order);
    
    return {
      ...baseDetails,
      methodType: 'Cheque',
      requiresClearing: true, // Cheques need bank clearing
      isImmediate: false,
      chequeNumber: order.chequeNumber || null,
      bankName: order.bankName || null,
      clearingStatus: order.chequeClearingStatus || 'Pending',
    };
  }

  /**
   * Check if cheque has cleared
   * @param {Object} order - The order object
   * @returns {boolean}
   */
  hasChequeCleared(order) {
    return order.chequeClearingStatus === 'Cleared';
  }

  /**
   * Mark cheque as cleared
   * @param {Object} order - The order object
   * @returns {Object} Updated order
   */
  markAsCleared(order) {
    order.chequeClearingStatus = 'Cleared';
    order.chequeClearedDate = new Date();
    return order;
  }

  /**
   * Mark cheque as bounced
   * @param {Object} order - The order object
   * @returns {Object} Updated order
   */
  markAsBounced(order) {
    order.chequeClearingStatus = 'Bounced';
    order.paymentReceived = null; // Reset payment since cheque bounced
    order.chequeBouncedDate = new Date();
    return order;
  }
}

module.exports = ChequePayment;
