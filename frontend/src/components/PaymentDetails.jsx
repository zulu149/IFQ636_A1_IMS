import { formatCurrency, formatDate } from '../utils/format';
import { PAYMENT_METHOD_LABELS } from '../utils/invoiceStatus';

const Detail = ({ label, children }) => (
  <div>
    <dt className="text-gray-500">{label}</dt>
    <dd className="font-medium break-words">{children}</dd>
  </div>
);

const PaymentDetails = ({ payment }) => (
  <dl className="grid sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
    <Detail label="Amount">{formatCurrency(payment.amount)}</Detail>
    <Detail label="Method">{PAYMENT_METHOD_LABELS[payment.method] || payment.method}</Detail>
    <Detail label="Reference">{payment.reference}</Detail>
    <Detail label="Paid on">{formatDate(payment.paidOn)}</Detail>
    <Detail label="Submitted">{formatDate(payment.submittedAt)}</Detail>
    {payment.reviewedAt && <Detail label="Reviewed">{formatDate(payment.reviewedAt)}</Detail>}
  </dl>
);

export default PaymentDetails;
