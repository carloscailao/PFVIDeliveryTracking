const CashPayment = require('./strategies/CashPayment');
const ChequePayment = require('./strategies/ChequePayment');

/**
 * Payment Strategy Factory
 * Returns the appropriate payment strategy based on payment method
 */

// Strategy registry
const strategies = {
  'Cash': CashPayment,
  'Cheque': ChequePayment,
};

/**
 * Get payment strategy instance for a payment method
 * @param {string} paymentMethod - The payment method ('Cash' or 'Cheque')
 * @returns {PaymentStrategy} Payment strategy instance
 * @throws {Error} If payment method is not supported
 */
function getPaymentStrategy(paymentMethod) {
  if (!paymentMethod) {
    throw new Error('Payment method is required');
  }

  const StrategyClass = strategies[paymentMethod];
  
  if (!StrategyClass) {
    throw new Error(`Unsupported payment method: ${paymentMethod}. Supported methods: ${Object.keys(strategies).join(', ')}`);
  }

  return new StrategyClass();
}

/**
 * Get all supported payment methods
 * @returns {string[]} Array of supported payment method names
 */
function getSupportedPaymentMethods() {
  return Object.keys(strategies);
}

/**
 * Validate and process payment using the appropriate strategy
 * @param {Object} order - The order object
 * @param {Object} paymentData - Payment details
 * @returns {Object} { success: boolean, order?: Object, error?: string }
 */
function processPayment(order, paymentData) {
  try {
    const strategy = getPaymentStrategy(order.paymentMethod);
    
    // Validate first
    const validation = strategy.validatePayment(order, paymentData);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Process payment
    const updatedOrder = strategy.processPayment(order, paymentData);
    
    return {
      success: true,
      order: updatedOrder,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get payment details using the appropriate strategy
 * @param {Object} order - The order object
 * @returns {Object} Payment details
 */
function getPaymentDetails(order) {
  try {
    const strategy = getPaymentStrategy(order.paymentMethod);
    return strategy.getPaymentDetails(order);
  } catch (error) {
    console.error('Error getting payment details:', error);
    return null;
  }
}

module.exports = {
  getPaymentStrategy,
  getSupportedPaymentMethods,
  processPayment,
  getPaymentDetails,
};
