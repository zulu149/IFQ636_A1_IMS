const FormField = ({ label, id, error, as: Control = 'input', children, ...inputProps }) => (
  <div className="mb-4">
    {label && (
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
      </label>
    )}
    <Control
      id={id}
      {...inputProps}
      aria-invalid={Boolean(error)}
      className={`w-full p-2 border rounded bg-white ${error ? 'border-red-500' : ''}`}
    >
      {children}
    </Control>
    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
);

export default FormField;
