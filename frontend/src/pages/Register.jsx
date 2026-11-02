import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import Alert from '../components/Alert';
import FormField from '../components/FormField';
import { hasErrors, validateRegister } from '../utils/validation';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegister(formData);
    setErrors(validationErrors);
    setServerError('');
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const { confirmPassword, ...payload } = formData;
      await axiosInstance.post('/api/auth/register', payload);
      navigate('/login', { state: { registered: true } });
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setServerError(data?.message || 'Registration failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} noValidate className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
        {serverError && <Alert>{serverError}</Alert>}
        <FormField
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />
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
        <FormField
          type="password"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Registering...' : 'Register'}
        </button>
        <p className="text-center text-sm mt-4">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
