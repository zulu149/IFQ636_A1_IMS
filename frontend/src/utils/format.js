const currencyFormatter = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

export const formatCurrency = (amount) => currencyFormatter.format(amount || 0);

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const toDateInputValue = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export const todayInputValue = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
