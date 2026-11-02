const FormField = ({ error, ...inputProps }) => (
  <div className="mb-4">
    <input
      {...inputProps}
      aria-invalid={Boolean(error)}
      className={`w-full p-2 border rounded ${error ? 'border-red-500' : ''}`}
    />
    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
);

export default FormField;
