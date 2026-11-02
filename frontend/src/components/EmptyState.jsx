const EmptyState = ({ title, message, action }) => (
  <div className="text-center py-12 px-4 bg-white rounded shadow">
    <h2 className="text-lg font-semibold">{title}</h2>
    {message && <p className="text-gray-500 mt-1">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
