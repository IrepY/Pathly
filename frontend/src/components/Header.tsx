import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Header: React.FC = () => {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold text-lg shadow-md">
            P
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Pathly</h1>
            <p className="text-xs text-blue-100">Okos Útvonaltervező</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-white hover:text-blue-100 font-medium transition-colors">
            🏠 Kezdőlap
          </Link>
          
          <Link to="/search" className="text-white hover:text-blue-100 font-medium transition-colors">
            🔍 Útvonal keresése
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/routes" className="text-white hover:text-blue-100 font-medium transition-colors">
                ⭐ Mentett útvonalak
              </Link>
              <Link to="/settings" className="text-white hover:text-blue-100 font-medium transition-colors">
                ⚙️ Beállítások
              </Link>
              <div className="h-8 w-0.5 bg-blue-400"></div>
              <div className="flex items-center space-x-4">
                <span className="text-blue-100 text-sm">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Kijelentkezés
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                🔑 Bejelentkezés
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 font-medium transition-colors"
              >
                📝 Regisztráció
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-700 px-4 py-4 space-y-2">
          <Link
            to="/"
            className="block text-white hover:bg-blue-600 px-4 py-2 rounded transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            🏠 Kezdőlap
          </Link>
          <Link
            to="/search"
            className="block text-white hover:bg-blue-600 px-4 py-2 rounded transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            🔍 Útvonal keresése
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/routes"
                className="block text-white hover:bg-blue-600 px-4 py-2 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ⭐ Mentett útvonalak
              </Link>
              <Link
                to="/settings"
                className="block text-white hover:bg-blue-600 px-4 py-2 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ⚙️ Beállítások
              </Link>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors font-medium"
              >
                Kijelentkezés
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block text-white hover:bg-blue-600 px-4 py-2 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                🔑 Bejelentkezés
              </Link>
              <Link
                to="/register"
                className="block bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                📝 Regisztráció
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
