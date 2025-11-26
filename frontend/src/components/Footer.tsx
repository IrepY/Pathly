import React from 'react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gray-800 text-gray-100 py-12 mt-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Pathly</h3>
            <p className="text-gray-400">
              Intelligens közösségi közlekedési útvonaltervező
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Linkek</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Kezdőlap
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-white transition-colors">
                  Rólunk
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition-colors">
                  Kapcsolat
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Jogi információk</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/privacy" className="hover:text-white transition-colors">
                  Adatvédelem
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition-colors">
                  Felhasználási feltételek
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>
            © {currentYear} Pathly. Készítette: Dely Dániel, Málnás Péter, Tanner Renátó
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
