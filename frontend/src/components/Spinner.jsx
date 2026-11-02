const Spinner = ({ label = 'Loading...' }) => (
  <div role="status" className="flex flex-col items-center justify-center py-12 text-gray-500">
    <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    <span className="mt-2">{label}</span>
  </div>
);

export default Spinner;
