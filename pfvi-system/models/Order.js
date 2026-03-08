const mongoose = require('mongoose');
const { STATUSES } = require('../lib/orderState/statusConstants');

const orderSchema = new mongoose.Schema({
  salesmanID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  invoice: {
    type: String,
    required: false,
    default: null,
  },
  paymentAmt: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Cheque'],
    required: true,
  },
  dateMade: {
    type: Date,
    required: true,
  },
  contactNumber: {
    type: String,
    default: null,
  },
  assignmentStatus: { 
    type: String, 
    enum: ['No Driver Assigned', 'Driver Assigned'], default: 'No Driver Assigned', 
    required: true 
  },
  driverAssignedID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null,
  },
  orderStatus: { 
    type: String, 
    enum: STATUSES, 
    default: STATUSES[0], 
    required: true 
  },
  dateDelivered: {
    type: Date,
    default: null,
  },
  deliveryReceivedBy: {
    type: String,
    default: null,
  },
  paymentReceived: {
    type: Number,
    default: null,
  },
  paymentReceivedBy: {
    type: String,
    default: null,
  },
  paymentReceivedDate: {
    type: Date,
    default: null,
  },
  // Cheque-specific fields for payment strategy
  chequeNumber: {
    type: String,
    default: null,
  },
  bankName: {
    type: String,
    default: null,
  },
  chequeClearingStatus: {
    type: String,
    enum: ['Pending', 'Cleared', 'Bounced'],
    default: null,
  },
  chequeClearedDate: {
    type: Date,
    default: null,
  },
  chequeBouncedDate: {
    type: Date,
    default: null,
  },
  salesmanNotes: {
    type: String,
    default: null,
  },
  driverNotes: {
    type: String,
    default: null,
  },
  secretaryNotes: {
    type: String,
    default: null,
  },
  orderNumber: {
    type: Number,
    unique: true,
    required: true,
  },
  statusTimestamps: {
    type: Map,
    of: Date,
    default: {},
  },
  lastModified: { 
    type: String,
    default: null 
  },

}, { timestamps: true });

// Helper method to process payment using strategy pattern
orderSchema.methods.processPaymentWithStrategy = function(paymentData) {
  const { processPayment } = require('../lib/paymentStrategy');
  return processPayment(this, paymentData);
};

// Helper method to get payment details using strategy pattern
orderSchema.methods.getPaymentDetailsWithStrategy = function() {
  const { getPaymentDetails } = require('../lib/paymentStrategy');
  return getPaymentDetails(this);
};

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
module.exports = Order;