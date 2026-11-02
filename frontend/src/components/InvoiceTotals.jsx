import { formatCurrency } from '../utils/format';

const InvoiceTotals = ({ subtotal, taxRate, tax, total }) => (
  <dl className="ml-auto max-w-xs text-sm space-y-1">
    <div className="flex justify-between">
      <dt className="text-gray-600">Subtotal</dt>
      <dd>{formatCurrency(subtotal)}</dd>
    </div>
    <div className="flex justify-between">
      <dt className="text-gray-600">Tax ({taxRate}%)</dt>
      <dd>{formatCurrency(tax)}</dd>
    </div>
    <div className="flex justify-between border-t pt-1 font-bold text-base">
      <dt>Total</dt>
      <dd>{formatCurrency(total)}</dd>
    </div>
  </dl>
);

export default InvoiceTotals;
