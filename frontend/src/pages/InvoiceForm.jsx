import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import Alert from '../components/Alert';
import FormField from '../components/FormField';
import InvoiceTotals from '../components/InvoiceTotals';
import LineItemsEditor, { emptyLineItem } from '../components/LineItemsEditor';
import Spinner from '../components/Spinner';
import { toDateInputValue, todayInputValue } from '../utils/format';
import { hasErrors, validateInvoice } from '../utils/validation';

const EMPTY_FORM = { customer: '', dueDate: '', taxRate: '10', notes: '', items: [emptyLineItem()] };

const round2 = (value) => Math.round(value * 100) / 100;

const calculateTotals = (items, taxRate) => {
  const subtotal = round2(items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0));
  const tax = round2((subtotal * (Number(taxRate) || 0)) / 100);
  return { subtotal, tax, total: round2(subtotal + tax) };
};

const toFormData = (invoice) => ({
  customer: invoice.customer?._id || '',
  dueDate: toDateInputValue(invoice.dueDate),
  taxRate: String(invoice.taxRate),
  notes: invoice.notes || '',
  items: invoice.items.map((item) => ({
    description: item.description,
    quantity: String(item.quantity),
    unitPrice: String(item.unitPrice),
  })),
});

const toPayload = (formData) => ({
  customer: formData.customer,
  dueDate: formData.dueDate,
  taxRate: Number(formData.taxRate),
  notes: formData.notes.trim(),
  items: formData.items.map((item) => ({
    description: item.description.trim(),
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
  })),
});

const withoutItemErrors = (errors) =>
  Object.fromEntries(Object.entries(errors).filter(([key]) => !key.startsWith('items')));

const InvoiceForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [customersResponse, invoiceResponse] = await Promise.all([
          axiosInstance.get('/api/users/customers'),
          isEdit ? axiosInstance.get(`/api/invoices/${id}`) : null,
        ]);
        setCustomers(customersResponse.data);
        if (invoiceResponse) {
          if (invoiceResponse.data.status !== 'draft') {
            navigate(`/invoices/${id}`, { replace: true });
            return;
          }
          setFormData(toFormData(invoiceResponse.data));
        }
      } catch (error) {
        setLoadError(error.response?.status === 404 ? 'Invoice not found.' : 'Failed to load the invoice form. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit, navigate]);

  const handleItemsChange = (items) => {
    setFormData((current) => ({ ...current, items }));
    setErrors(withoutItemErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateInvoice(formData);
    setErrors(validationErrors);
    setServerError(hasErrors(validationErrors) ? 'Please fix the highlighted fields.' : '');
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const payload = toPayload(formData);
      const response = isEdit
        ? await axiosInstance.put(`/api/invoices/${id}`, payload)
        : await axiosInstance.post('/api/invoices', payload);
      navigate(`/invoices/${response.data._id}`, {
        state: { message: isEdit ? 'Draft updated.' : 'Draft invoice created.' },
      });
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors) {
        setErrors(data.errors);
        setServerError('Please fix the highlighted fields.');
      } else {
        setServerError(data?.message || 'Failed to save the invoice. Please try again.');
      }
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert>{loadError}</Alert>
        <Link to="/invoices" className="text-blue-600 hover:underline">Back to invoices</Link>
      </div>
    );
  }

  const totals = calculateTotals(formData.items, formData.taxRate);
  const setField = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });
  const submitLabel = isEdit ? 'Save changes' : 'Save as draft';

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link to={isEdit ? `/invoices/${id}` : '/invoices'} className="text-blue-600 hover:underline text-sm">
        ← Back
      </Link>
      <form onSubmit={handleSubmit} noValidate className="bg-white p-6 shadow-md rounded mt-2">
        <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Edit draft invoice' : 'New invoice'}</h1>
        {serverError && <Alert>{serverError}</Alert>}
        {customers.length === 0 && (
          <Alert>No customers yet. A customer needs to register before you can invoice them.</Alert>
        )}

        <div className="grid md:grid-cols-3 gap-x-4">
          <FormField
            as="select"
            id="customer"
            label="Customer"
            value={formData.customer}
            onChange={setField('customer')}
            error={errors.customer}
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.name} ({customer.email})
              </option>
            ))}
          </FormField>
          <FormField
            type="date"
            id="dueDate"
            label="Due date"
            min={todayInputValue()}
            value={formData.dueDate}
            onChange={setField('dueDate')}
            error={errors.dueDate}
          />
          <FormField
            type="number"
            id="taxRate"
            label="Tax rate (%)"
            min="0"
            max="100"
            step="0.01"
            value={formData.taxRate}
            onChange={setField('taxRate')}
            error={errors.taxRate}
          />
        </div>

        <LineItemsEditor items={formData.items} errors={errors} onChange={handleItemsChange} />

        <FormField
          as="textarea"
          id="notes"
          label="Notes (optional)"
          rows={3}
          value={formData.notes}
          onChange={setField('notes')}
          error={errors.notes}
        />

        <div className="mb-6">
          <InvoiceTotals {...totals} taxRate={Number(formData.taxRate) || 0} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </form>
    </div>
  );
};

export default InvoiceForm;
