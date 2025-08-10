import mongoose from 'mongoose';

const TaxRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
    maxlength: [100, 'User name cannot exceed 100 characters']
  },
  income: {
    type: Number,
    required: [true, 'Income amount is required'],
    min: [0, 'Income cannot be negative']
  },
  taxRegime: {
    type: String,
    enum: ['old', 'new'],
    required: [true, 'Tax regime must be specified'],
    default: 'new'
  },
  deductions: {
    type: Number,
    default: 0,
    min: [0, 'Deductions cannot be negative']
  },
  taxableIncome: {
    type: Number,
    required: true,
    min: [0, 'Taxable income cannot be negative']
  },
  taxAmount: {
    type: Number,
    required: true,
    min: [0, 'Tax amount cannot be negative']
  },
  effectiveTaxRate: {
    type: Number,
    required: true,
    min: [0, 'Effective tax rate cannot be negative']
  },
  calculationDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
TaxRecordSchema.index({ userName: 1, date: -1 });
TaxRecordSchema.index({ taxRegime: 1, date: -1 });

// Virtual for formatted date
TaxRecordSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Ensure virtual fields are serialized
TaxRecordSchema.set('toJSON', { virtuals: true });
TaxRecordSchema.set('toObject', { virtuals: true });

export default mongoose.model('TaxRecord', TaxRecordSchema);
