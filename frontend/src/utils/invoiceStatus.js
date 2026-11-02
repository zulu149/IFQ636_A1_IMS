export const STATUS_LABELS = {
  draft: 'Draft',
  issued: 'Issued',
  payment_submitted: 'Payment submitted',
  paid: 'Paid',
  void: 'Void',
};

export const PAYMENT_METHOD_LABELS = {
  bank_transfer: 'Bank transfer',
  card: 'Card',
  paypal: 'PayPal',
  other: 'Other',
};

export const STATUS_STYLES = {
  draft: 'bg-gray-200 text-gray-800',
  issued: 'bg-blue-100 text-blue-800',
  overdue: 'bg-red-100 text-red-800',
  payment_submitted: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  void: 'bg-gray-100 text-gray-500 line-through',
};
