const STYLES = {
  error: 'bg-red-100 border-red-300 text-red-700',
  success: 'bg-green-100 border-green-300 text-green-700',
};

const Alert = ({ type = 'error', children }) => (
  <div role="alert" className={`border rounded p-3 mb-4 ${STYLES[type]}`}>
    {children}
  </div>
);

export default Alert;
