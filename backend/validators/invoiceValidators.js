const mongoose = require('mongoose');
const { isBlank, respond } = require('./validationHelpers');

const MAX_ITEMS = 50;
const MAX_DESCRIPTION_LENGTH = 200;
const MAX_NOTES_LENGTH = 1000;
const ADMIN_STATUS_CHANGES = ['issued', 'void'];

const toNumber = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '') return Number(value);
    return NaN;
};

const startOfTodayUtc = () => {
    const now = new Date();
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
};

const checkItems = (items, errors) => {
    if (!Array.isArray(items) || items.length === 0) {
        errors.items = 'Add at least one line item';
        return;
    }
    if (items.length > MAX_ITEMS) {
        errors.items = `An invoice can have at most ${MAX_ITEMS} line items`;
        return;
    }

    items.forEach((item, index) => {
        const prefix = `items.${index}`;
        if (isBlank(item?.description)) errors[`${prefix}.description`] = 'Description is required';
        else if (item.description.trim().length > MAX_DESCRIPTION_LENGTH) errors[`${prefix}.description`] = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`;
        if (!(toNumber(item?.quantity) > 0)) errors[`${prefix}.quantity`] = 'Quantity must be greater than 0';
        if (!(toNumber(item?.unitPrice) >= 0)) errors[`${prefix}.unitPrice`] = 'Unit price must be 0 or more';
    });
};

const checkDueDate = (dueDate, errors) => {
    if (dueDate === undefined || dueDate === null || dueDate === '') errors.dueDate = 'Due date is required';
    else if (Number.isNaN(Date.parse(dueDate))) errors.dueDate = 'Enter a valid due date';
    else if (Date.parse(dueDate) < startOfTodayUtc()) errors.dueDate = 'Due date cannot be in the past';
};

const validateInvoice = (req, res, next) => {
    const { customer, items, taxRate, dueDate, notes } = req.body;
    const errors = {};

    if (!customer) errors.customer = 'Customer is required';
    else if (!mongoose.isValidObjectId(customer)) errors.customer = 'Select a valid customer';
    checkItems(items, errors);
    if (taxRate !== undefined) {
        const rate = toNumber(taxRate);
        if (!(rate >= 0 && rate <= 100)) errors.taxRate = 'Tax rate must be between 0 and 100';
    }
    checkDueDate(dueDate, errors);
    if (notes !== undefined && notes !== null) {
        if (typeof notes !== 'string') errors.notes = 'Notes must be text';
        else if (notes.length > MAX_NOTES_LENGTH) errors.notes = `Notes must be ${MAX_NOTES_LENGTH} characters or fewer`;
    }

    respond(res, next, errors);
};

const validateStatusChange = (req, res, next) => {
    const errors = {};
    if (!ADMIN_STATUS_CHANGES.includes(req.body.status)) {
        errors.status = `Status must be one of: ${ADMIN_STATUS_CHANGES.join(', ')}`;
    }
    respond(res, next, errors);
};

const validateInvoiceId = (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({ message: 'Invoice not found' });
    }
    next();
};

module.exports = { validateInvoice, validateStatusChange, validateInvoiceId };
