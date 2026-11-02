import { useState } from 'react';
import axiosInstance from '../axiosConfig';
import Alert from './Alert';
import ConfirmDialog from './ConfirmDialog';
import FormField from './FormField';
import PaymentDetails from './PaymentDetails';
import { formatCurrency } from '../utils/format';
import { hasErrors, validateRejection } from '../utils/validation';

const PaymentReview = ({ invoice, onReviewed }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const review = async (payload, successMessage) => {
    setBusy(true);
    setServerError('');
    try {
      const response = await axiosInstance.patch(`/api/invoices/${invoice._id}/payment`, payload);
      onReviewed(response.data, successMessage);
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setServerError(data?.message || 'Failed to review the payment. Please try again.');
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  const handleReject = (e) => {
    e.preventDefault();
    const validationErrors = validateRejection({ reason });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    review({ decision: 'reject', reason: reason.trim() }, 'Payment rejected. The customer can submit it again.');
  };

  return (
    <section className="bg-white rounded shadow p-6 border-l-4 border-yellow-400">
      <h2 className="text-lg font-bold mb-4">Payment awaiting review</h2>
      {serverError && <Alert>{serverError}</Alert>}
      <PaymentDetails payment={invoice.payment} />

      {rejecting ? (
        <form onSubmit={handleReject} noValidate className="mt-6">
          <FormField
            as="textarea"
            id="rejectionReason"
            label="Reason for rejection (shown to the customer)"
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={errors.reason}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRejecting(false)}
              disabled={busy}
              className="px-4 py-2 rounded border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {busy ? 'Rejecting...' : 'Reject payment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Confirm payment
          </button>
          <button
            type="button"
            onClick={() => setRejecting(true)}
            className="px-4 py-2 rounded border border-red-300 text-red-600 hover:bg-red-50"
          >
            Reject
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm this payment?"
        message={`${invoice.invoiceNumber} will be marked as paid (${formatCurrency(invoice.payment.amount)}).`}
        confirmLabel="Confirm payment"
        busy={busy}
        onConfirm={() => review({ decision: 'confirm' }, 'Payment confirmed. The invoice is now paid.')}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
};

export default PaymentReview;
