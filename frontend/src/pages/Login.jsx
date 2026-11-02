import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import Alert from '../components/Alert';
import FormField from '../components/FormField';
import { hasErrors, validateLogin } from '../utils/validation';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin(formData);
    setErrors(validationErrors);
    setServerError('');
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate('/');
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setServerError(data?.message || 'Login failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} noValidate className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        {location.state?.registered && !serverError && (
          <Alert type="success">Registration successful. Please log in.</Alert>
        )}
        {serverError && <Alert>{serverError}</Alert>}
        <FormField
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
        />
        <FormField
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Logging in...' : 'Login'}
        </button>
        <p className="text-center text-sm mt-4">
          No account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
