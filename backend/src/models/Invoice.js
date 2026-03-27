const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  // Reference
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },
  
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  
  // Amount
  amount: {
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  
  currency: {
    type: String,
    default: 'USD'
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Dates
  issueDate: {
    type: Date,
    default: Date.now
  },
  
  dueDate: {
    type: Date,
    required: true
  },
  
  paidAt: Date,
  
  // Period
  billingPeriod: {
    start: Date,
    end: Date
  },
  
  // Line Items
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    amount: Number
  }],
  
  // Payment
  paymentMethod: String,
  transactionId: String,
  stripeInvoiceId: String,
  
  // PDF
  pdfUrl: String,
  
  // Notes
  notes: String
}, {
  timestamps: true
});

// Generate invoice number
invoiceSchema.pre('save', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const count = await mongoose.model('Invoice').countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), 1),
        $lt: new Date(year, date.getMonth() + 1, 1)
      }
    });
    
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
