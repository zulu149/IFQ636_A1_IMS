
const express = require('express');
const {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updateInvoiceStatus,
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateInvoice, validateStatusChange, validateInvoiceId } = require('../validators/invoiceValidators');
const router = express.Router();

router.route('/')
    .get(protect, getInvoices)
    .post(protect, authorize('admin'), validateInvoice, createInvoice);
router.route('/:id')
    .get(protect, validateInvoiceId, getInvoiceById)
    .put(protect, authorize('admin'), validateInvoiceId, validateInvoice, updateInvoice)
    .delete(protect, authorize('admin'), validateInvoiceId, deleteInvoice);
router.patch('/:id/status', protect, authorize('admin'), validateInvoiceId, validateStatusChange, updateInvoiceStatus);

module.exports = router;
