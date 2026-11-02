import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/format';
import { STATUS_LABELS } from '../utils/invoiceStatus';

const SEARCH_DELAY_MS = 300;
const NO_FILTERS = { status: '', search: '' };

const Invoices = () => {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const location = useLocation();
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get('/api/invoices', { params: filters });
        if (active) setInvoices(response.data);
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Failed to load invoices.');
      } finally {
        if (active) setLoading(false);
      }
    }, SEARCH_DELAY_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [filters, reloadKey]);

  const statusOptions = Object.entries(STATUS_LABELS).filter(([value]) => isAdmin || value !== 'draft');
  const isFiltered = Boolean(filters.status || filters.search);

  const renderContent = () => {
    if (loading) return <Spinner label="Loading invoices..." />;

    if (error) {
      return (
        <Alert>
          {error}{' '}
          <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="underline font-semibold">
            Try again
          </button>
        </Alert>
      );
    }

    if (invoices.length === 0 && isFiltered) {
      return (
        <EmptyState
          title="No invoices match your filters"
          action={
            <button type="button" onClick={() => setFilters(NO_FILTERS)} className="text-blue-600 hover:underline">
              Clear filters
            </button>
          }
        />
      );
    }

    if (invoices.length === 0) {
      return isAdmin ? (
        <EmptyState
          title="No invoices yet"
          message="Create your first invoice to bill a customer."
          action={
            <Link to="/invoices/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              New invoice
            </Link>
          }
        />
      ) : (
        <EmptyState title="No invoices yet" message="Invoices issued to you will appear here." />
      );
    }

    return (
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-3">Invoice</th>
              {isAdmin && <th className="p-3">Customer</th>}
              <th className="p-3">Due</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice._id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">
                  <Link to={`/invoices/${invoice._id}`} className="text-blue-600 hover:underline">
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                {isAdmin && <td className="p-3">{invoice.customer?.name || '—'}</td>}
                <td className="p-3">{formatDate(invoice.dueDate)}</td>
                <td className="p-3 text-right">{formatCurrency(invoice.total)}</td>
                <td className="p-3">
                  <StatusBadge status={invoice.status} overdue={invoice.isOverdue} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{isAdmin ? 'Invoices' : 'My invoices'}</h1>
        {isAdmin && (
          <Link to="/invoices/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            New invoice
          </Link>
        )}
      </div>

      {location.state?.message && <Alert type="success">{location.state.message}</Alert>}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          aria-label="Search by invoice number"
          placeholder="Search by invoice number"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="flex-1 p-2 border rounded"
        />
        <select
          aria-label="Filter by status"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="p-2 border rounded bg-white"
        >
          <option value="">All statuses</option>
          {statusOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {renderContent()}
    </div>
  );
};

export default Invoices;
