import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Header: React.FC = () => {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            P
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Pathly</h1>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-gray-800">
            Kezdőlap
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/routes" className="text-gray-600 hover:text-gray-800">
                Mentett útvonalak
              </Link>
              <Link to="/settings" className="text-gray-600 hover:text-gray-800">
                Beállítások
              </Link>
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Kijelentkezés
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-800"
              >
                Bejelentkezés
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Regisztráció
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
