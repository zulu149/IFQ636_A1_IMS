
const express = require('express');
const {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    submitPayment,
    reviewPayment,
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    validateInvoice,
    validateStatusChange,
    validatePaymentSubmission,
    validatePaymentReview,
    validateInvoiceId,
} = require('../validators/invoiceValidators');
const router = express.Router();

router.route('/')
    .get(protect, getInvoices)
    .post(protect, authorize('admin'), validateInvoice, createInvoice);
router.route('/:id')
    .get(protect, validateInvoiceId, getInvoiceById)
    .put(protect, authorize('admin'), validateInvoiceId, validateInvoice, updateInvoice)
    .delete(protect, authorize('admin'), validateInvoiceId, deleteInvoice);
router.patch('/:id/status', protect, authorize('admin'), validateInvoiceId, validateStatusChange, updateInvoiceStatus);
router.route('/:id/payment')
    .post(protect, authorize('customer'), validateInvoiceId, validatePaymentSubmission, submitPayment)
    .patch(protect, authorize('admin'), validateInvoiceId, validatePaymentReview, reviewPayment);

module.exports = router;
