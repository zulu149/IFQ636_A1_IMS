import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import InvoiceTotals from '../components/InvoiceTotals';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/format';

const ACTIONS = {
  issue: {
    title: 'Issue this invoice?',
    message: 'The customer will be able to see it and it can no longer be edited.',
    confirmLabel: 'Issue invoice',
    status: 'issued',
    success: 'Invoice issued to the customer.',
  },
  void: {
    title: 'Void this invoice?',
    message: 'The invoice will be cancelled and can no longer be paid. This cannot be undone.',
    confirmLabel: 'Void invoice',
    danger: true,
    status: 'void',
    success: 'Invoice voided.',
  },
  delete: {
    title: 'Delete this draft?',
    message: 'The draft will be permanently deleted.',
    confirmLabel: 'Delete draft',
    danger: true,
  },
};

const InvoiceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const navigate = useNavigate();
  const location = useLocation();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [message, setMessage] = useState(location.state?.message || '');
  const [actionError, setActionError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const response = await axiosInstance.get(`/api/invoices/${id}`);
        setInvoice(response.data);
      } catch (error) {
        if (error.response?.status === 404) setNotFound(true);
        else setLoadError('Failed to load the invoice.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, reloadKey]);

  const runAction = async () => {
    const action = ACTIONS[pendingAction];
    setBusy(true);
    setActionError('');
    setMessage('');
    try {
      if (pendingAction === 'delete') {
        await axiosInstance.delete(`/api/invoices/${id}`);
        navigate('/invoices', { state: { message: `${invoice.invoiceNumber} deleted.` } });
        return;
      }
      const response = await axiosInstance.patch(`/api/invoices/${id}/status`, { status: action.status });
      setInvoice(response.data);
      setMessage(action.success);
    } catch (error) {
      setActionError(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
      setPendingAction(null);
    }
  };

  if (loading) return <Spinner label="Loading invoice..." />;

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <EmptyState
          title="Invoice not found"
          message="It may have been deleted, or you don't have access to it."
          action={<Link to="/invoices" className="text-blue-600 hover:underline">Back to invoices</Link>}
        />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          {loadError}{' '}
          <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="underline font-semibold">
            Try again
          </button>
        </Alert>
      </div>
    );
  }

  const action = ACTIONS[pendingAction];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/invoices" className="text-blue-600 hover:underline text-sm">← Back to invoices</Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-2 mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
          <StatusBadge status={invoice.status} overdue={invoice.isOverdue} />
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            {invoice.status === 'draft' && (
              <>
                <Link to={`/invoices/${id}/edit`} className="px-4 py-2 rounded border hover:bg-gray-50">
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setPendingAction('delete')}
                  className="px-4 py-2 rounded border border-red-300 text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setPendingAction('issue')}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Issue
                </button>
              </>
            )}
            {invoice.status === 'issued' && (
              <button
                type="button"
                onClick={() => setPendingAction('void')}
                className="px-4 py-2 rounded border border-red-300 text-red-600 hover:bg-red-50"
              >
                Void
              </button>
            )}
          </div>
        )}
      </div>

      {message && <Alert type="success">{message}</Alert>}
      {actionError && <Alert>{actionError}</Alert>}

      <div className="bg-white rounded shadow p-6">
        <div className="grid sm:grid-cols-3 gap-4 mb-6 text-sm">
          <div>
            <p className="text-gray-500">Billed to</p>
            <p className="font-medium">{invoice.customer?.name || '—'}</p>
            <p className="text-gray-600">{invoice.customer?.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Issued</p>
            <p className="font-medium">{invoice.issueDate ? formatDate(invoice.issueDate) : 'Not issued yet'}</p>
          </div>
          <div>
            <p className="text-gray-500">Due</p>
            <p className={`font-medium ${invoice.isOverdue ? 'text-red-600' : ''}`}>{formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Unit price</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InvoiceTotals subtotal={invoice.subtotal} taxRate={invoice.taxRate} tax={invoice.tax} total={invoice.total} />

        {invoice.notes && (
          <div className="mt-6 text-sm">
            <p className="text-gray-500">Notes</p>
            <p className="whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(action)}
        title={action?.title}
        message={action?.message}
        confirmLabel={action?.confirmLabel}
        danger={action?.danger}
        busy={busy}
        onConfirm={runAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
};

export default InvoiceDetail;
