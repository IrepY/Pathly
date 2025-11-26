import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { validateEmail } from '../utils/helpers';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Kérlek töltsd ki az összes mezőt');
      return;
    }

    if (!validateEmail(email)) {
      setError('Érvénytelen e-mail cím');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      setAuth(response.token, response.user);
      navigate('/');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Bejelentkezés sikertelen';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Bejelentkezés</h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jelszó
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {isLoading ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Még nincs fiókod?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Regisztráció
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
