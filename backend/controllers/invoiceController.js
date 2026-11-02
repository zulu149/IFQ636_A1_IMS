
const Invoice = require('../models/Invoice');
const User = require('../models/User');

const EDITABLE_FIELDS = ['customer', 'items', 'taxRate', 'dueDate', 'notes'];
const STATUS_TRANSITIONS = { draft: ['issued'], issued: ['void'] };
const CUSTOMER_FIELDS = 'name email';

const pickEditableFields = (body) => EDITABLE_FIELDS.reduce((fields, key) => {
    if (body[key] !== undefined) fields[key] = body[key];
    return fields;
}, {});

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isOwner = (invoice, user) => String(invoice.customer?._id) === String(user._id);

const isVisibleTo = (invoice, user) =>
    user.role === 'admin' || (isOwner(invoice, user) && invoice.status !== 'draft');

const customerExists = async (id) => Boolean(await User.findOne({ _id: id, role: 'customer' }));

const notFound = (res) => res.status(404).json({ message: 'Invoice not found' });

const invalidCustomer = (res) => res.status(400).json({
    message: 'Validation failed',
    errors: { customer: 'Select a valid customer' },
});

const sendError = (res, error) => {
    if (error.name === 'ValidationError') {
        const errors = Object.fromEntries(Object.entries(error.errors).map(([path, err]) => [path, err.message]));
        return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: error.message });
};

const buildFilter = (user, { status, search }) => {
    const filter = {};
    const statusFilter = typeof status === 'string' && status ? status : undefined;

    if (statusFilter) filter.status = statusFilter;
    if (typeof search === 'string' && search.trim()) {
        filter.invoiceNumber = new RegExp(escapeRegex(search.trim()), 'i');
    }
    if (user.role === 'customer') {
        filter.customer = user._id;
        filter.status = statusFilter ? { $eq: statusFilter, $ne: 'draft' } : { $ne: 'draft' };
    }
    return filter;
};

const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find(buildFilter(req.user, req.query))
            .populate('customer', CUSTOMER_FIELDS)
            .sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        sendError(res, error);
    }
};

const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id).populate('customer', CUSTOMER_FIELDS);
        if (!invoice || !isVisibleTo(invoice, req.user)) return notFound(res);
        res.json(invoice);
    } catch (error) {
        sendError(res, error);
    }
};

const createInvoice = async (req, res) => {
    try {
        if (!(await customerExists(req.body.customer))) return invalidCustomer(res);

        const invoice = await Invoice.create({ ...pickEditableFields(req.body), createdBy: req.user._id });
        await invoice.populate('customer', CUSTOMER_FIELDS);
        res.status(201).json(invoice);
    } catch (error) {
        sendError(res, error);
    }
};

const updateInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return notFound(res);
        if (invoice.status !== 'draft') {
            return res.status(409).json({ message: 'Only draft invoices can be edited' });
        }
        if (!(await customerExists(req.body.customer))) return invalidCustomer(res);

        invoice.set(pickEditableFields(req.body));
        await invoice.save();
        await invoice.populate('customer', CUSTOMER_FIELDS);
        res.json(invoice);
    } catch (error) {
        sendError(res, error);
    }
};

const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return notFound(res);
        if (invoice.status !== 'draft') {
            return res.status(409).json({ message: 'Only draft invoices can be deleted; void issued invoices instead' });
        }

        await invoice.deleteOne();
        res.json({ message: 'Invoice deleted', id: invoice._id });
    } catch (error) {
        sendError(res, error);
    }
};

const updateInvoiceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return notFound(res);

        const allowed = STATUS_TRANSITIONS[invoice.status] || [];
        if (!allowed.includes(status)) {
            return res.status(409).json({ message: `Cannot change status from ${invoice.status} to ${status}` });
        }

        invoice.status = status;
        if (status === 'issued') invoice.issueDate = new Date();
        await invoice.save();
        await invoice.populate('customer', CUSTOMER_FIELDS);
        res.json(invoice);
    } catch (error) {
        sendError(res, error);
    }
};

const submitPayment = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice || !isVisibleTo(invoice, req.user)) return notFound(res);
        if (invoice.status === 'payment_submitted') {
            return res.status(409).json({ message: 'A payment for this invoice is already awaiting review' });
        }
        if (invoice.status !== 'issued') {
            return res.status(409).json({ message: 'Only issued invoices can be paid' });
        }

        const { method, reference, paidOn } = req.body;
        invoice.payment = { amount: invoice.total, method, reference, paidOn, submittedAt: new Date() };
        invoice.status = 'payment_submitted';
        await invoice.save();
        await invoice.populate('customer', CUSTOMER_FIELDS);
        res.json(invoice);
    } catch (error) {
        sendError(res, error);
    }
};

const reviewPayment = async (req, res) => {
    try {
        const { decision, reason } = req.body;
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return notFound(res);
        if (invoice.status !== 'payment_submitted') {
            return res.status(409).json({ message: 'There is no payment awaiting review for this invoice' });
        }

        invoice.payment.reviewedAt = new Date();
        if (decision === 'confirm') {
            invoice.status = 'paid';
            invoice.payment.rejectionReason = undefined;
        } else {
            invoice.status = 'issued';
            invoice.payment.rejectionReason = reason.trim();
        }
        await invoice.save();
        await invoice.populate('customer', CUSTOMER_FIELDS);
        res.json(invoice);
    } catch (error) {
        sendError(res, error);
    }
};

module.exports = {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    submitPayment,
    reviewPayment,
};
