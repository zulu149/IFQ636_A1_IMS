import { formatCurrency } from '../utils/format';
import { MAX_LINE_ITEMS } from '../utils/validation';

export const emptyLineItem = () => ({ description: '', quantity: '1', unitPrice: '' });

const lineAmount = (item) => (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);

const FieldError = ({ message }) => (message ? <p className="text-red-600 text-xs mt-1">{message}</p> : null);

const LineItemsEditor = ({ items, errors, onChange }) => {
  const updateItem = (index, field, value) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));
  const addItem = () => onChange([...items, emptyLineItem()]);

  const errorFor = (index, field) => errors[`items.${index}.${field}`];
  const inputClass = (index, field) => `w-full p-2 border rounded ${errorFor(index, field) ? 'border-red-500' : ''}`;

  return (
    <fieldset className="mb-4">
      <legend className="text-sm font-medium mb-2">Line items</legend>
      <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-gray-500 mb-1">
        <span className="col-span-6">Description</span>
        <span className="col-span-2">Quantity</span>
        <span className="col-span-2">Unit price</span>
        <span className="col-span-2 text-right">Amount</span>
      </div>

      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 mb-3 items-start">
          <div className="col-span-12 md:col-span-6">
            <input
              aria-label={`Line ${index + 1} description`}
              placeholder="Description"
              value={item.description}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
              className={inputClass(index, 'description')}
            />
            <FieldError message={errorFor(index, 'description')} />
          </div>
          <div className="col-span-4 md:col-span-2">
            <input
              type="number"
              min="0.01"
              step="0.01"
              aria-label={`Line ${index + 1} quantity`}
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', e.target.value)}
              className={inputClass(index, 'quantity')}
            />
            <FieldError message={errorFor(index, 'quantity')} />
          </div>
          <div className="col-span-4 md:col-span-2">
            <input
              type="number"
              min="0"
              step="0.01"
              aria-label={`Line ${index + 1} unit price`}
              placeholder="Price"
              value={item.unitPrice}
              onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
              className={inputClass(index, 'unitPrice')}
            />
            <FieldError message={errorFor(index, 'unitPrice')} />
          </div>
          <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-2 pt-2">
            <span className="text-sm">{formatCurrency(lineAmount(item))}</span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={items.length === 1}
              aria-label={`Remove line ${index + 1}`}
              className="text-red-600 font-bold px-1 disabled:opacity-30"
            >
              ×
            </button>
          </div>
        </div>
      ))}

      {errors.items && <p className="text-red-600 text-sm mb-2">{errors.items}</p>}
      <button
        type="button"
        onClick={addItem}
        disabled={items.length >= MAX_LINE_ITEMS}
        className="text-blue-600 hover:underline text-sm disabled:opacity-50"
      >
        + Add line item
      </button>
    </fieldset>
  );
};

export default LineItemsEditor;
