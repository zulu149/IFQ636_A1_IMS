import { useState } from 'react';
import axiosInstance from '../axiosConfig';
import Alert from './Alert';
import FormField from './FormField';
import { formatCurrency, todayInputValue } from '../utils/format';
import { PAYMENT_METHOD_LABELS } from '../utils/invoiceStatus';
import { hasErrors, validatePayment } from '../utils/validation';

const PaymentForm = ({ invoice, onSubmitted }) => {
  const [formData, setFormData] = useState({ method: '', reference: '', paidOn: todayInputValue() });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setField = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validatePayment(formData);
    setErrors(validationErrors);
    setServerError('');
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const response = await axiosInstance.post(`/api/invoices/${invoice._id}/payment`, {
        ...formData,
        reference: formData.reference.trim(),
      });
      onSubmitted(response.data);
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setServerError(data?.message || 'Failed to submit the payment. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white rounded shadow p-6">
      <h2 className="text-lg font-bold mb-1">Pay this invoice</h2>
      <p className="text-sm text-gray-600 mb-4">
        Pay {formatCurrency(invoice.total)} using your preferred method, then record the payment details below so it
        can be confirmed.
      </p>
      {serverError && <Alert>{serverError}</Alert>}

      <div className="grid md:grid-cols-3 gap-x-4">
        <FormField
          as="select"
          id="method"
          label="Payment method"
          value={formData.method}
          onChange={setField('method')}
          error={errors.method}
        >
          <option value="">Select a method</option>
          {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </FormField>
        <FormField
          id="reference"
          label="Payment reference"
          placeholder="e.g. receipt or transaction number"
          maxLength={100}
          value={formData.reference}
          onChange={setField('reference')}
          error={errors.reference}
        />
        <FormField
          type="date"
          id="paidOn"
          label="Paid on"
          max={todayInputValue()}
          value={formData.paidOn}
          onChange={setField('paidOn')}
          error={errors.paidOn}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : `Submit payment of ${formatCurrency(invoice.total)}`}
      </button>
    </form>
  );
};

export default PaymentForm;
