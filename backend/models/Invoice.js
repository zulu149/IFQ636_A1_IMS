
const mongoose = require('mongoose');
const Counter = require('./Counter');

const INVOICE_STATUSES = ['draft', 'issued', 'payment_submitted', 'paid', 'void'];

const round2 = (value) => Math.round(value * 100) / 100;

const lineItemSchema = new mongoose.Schema({
    description: { type: String, required: true, trim: true, maxlength: 200 },
    quantity: { type: Number, required: true, min: 0.01 },
    unitPrice: { type: Number, required: true, min: 0 },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: {
        type: [lineItemSchema],
        validate: { validator: (items) => items.length > 0, message: 'At least one line item is required' },
    },
    taxRate: { type: Number, default: 10, min: 0, max: 100 },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    issueDate: { type: Date },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: INVOICE_STATUSES, default: 'draft' },
    notes: { type: String, trim: true, maxlength: 1000 },
}, { timestamps: true, toJSON: { virtuals: true } });

invoiceSchema.virtual('isOverdue').get(function () {
    return this.status === 'issued' && this.dueDate < new Date();
});

invoiceSchema.statics.nextInvoiceNumber = async function () {
    const counter = await Counter.findByIdAndUpdate('invoice', { $inc: { seq: 1 } }, { new: true, upsert: true });
    return `INV-${String(counter.seq).padStart(4, '0')}`;
};

invoiceSchema.pre('validate', function () {
    this.subtotal = round2(this.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0));
    this.tax = round2((this.subtotal * this.taxRate) / 100);
    this.total = round2(this.subtotal + this.tax);
});

invoiceSchema.pre('save', async function () {
    if (!this.invoiceNumber) this.invoiceNumber = await this.constructor.nextInvoiceNumber();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
module.exports.INVOICE_STATUSES = INVOICE_STATUSES;
