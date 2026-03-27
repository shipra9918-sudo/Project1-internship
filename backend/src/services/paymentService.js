// Mock Payment Gateway Service
class PaymentService {
  constructor() {
    this.transactions = new Map();
  }

  /**
   * Process payment (Mock implementation)
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} Transaction result
   */
  async processPayment(paymentData) {
    const { amount, method, cardNumber, orderId } = paymentData;

    // Simulate payment processing delay
    await this.delay(1500);

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Mock validation
    if (amount <= 0) {
      return {
        success: false,
        message: 'Invalid amount',
        transactionId: null
      };
    }

    // Simulate random failures (5% failure rate for testing)
    const shouldFail = Math.random() < 0.05;

    if (shouldFail) {
      return {
        success: false,
        message: 'Payment declined by bank',
        transactionId: null,
        errorCode: 'PAYMENT_DECLINED'
      };
    }

    // Store transaction
    this.transactions.set(transactionId, {
      orderId,
      amount,
      method,
      status: 'completed',
      timestamp: new Date(),
      cardLast4: cardNumber ? cardNumber.slice(-4) : null
    });

    return {
      success: true,
      message: 'Payment processed successfully',
      transactionId,
      amount,
      method,
      timestamp: new Date()
    };
  }

  /**
   * Verify transaction
   * @param {string} transactionId - Transaction ID to verify
   * @returns {Object} Transaction details
   */
  verifyTransaction(transactionId) {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      return {
        success: false,
        message: 'Transaction not found'
      };
    }

    return {
      success: true,
      transaction
    };
  }

  /**
   * Refund payment
   * @param {string} transactionId - Transaction ID to refund
   * @returns {Promise<Object>} Refund result
   */
  async refundPayment(transactionId) {
    await this.delay(1000);

    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      return {
        success: false,
        message: 'Transaction not found'
      };
    }

    if (transaction.status === 'refunded') {
      return {
        success: false,
        message: 'Transaction already refunded'
      };
    }

    transaction.status = 'refunded';
    transaction.refundedAt = new Date();

    const refundId = `REF-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    return {
      success: true,
      message: 'Refund processed successfully',
      refundId,
      amount: transaction.amount,
      timestamp: new Date()
    };
  }

  /**
   * Simulate processing delay
   * @param {number} ms - Milliseconds to delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new PaymentService();
