import { STATUS_LABELS, STATUS_STYLES } from '../utils/invoiceStatus';

const StatusBadge = ({ status, overdue }) => {
  const key = overdue ? 'overdue' : status;
  const label = overdue ? 'Overdue' : STATUS_LABELS[status] || status;

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[key] || ''}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
