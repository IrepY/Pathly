import React from 'react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gradient-to-r from-gray-900 to-gray-800 text-gray-100 py-12 mt-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                P
              </div>
              <h3 className="text-xl font-bold">Pathly</h3>
            </div>
            <p className="text-gray-400">
              Intelligens közösségi közlekedési útvonaltervező
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">🔗 Linkek</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-blue-400 transition-colors">
                  🏠 Kezdőlap
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-blue-400 transition-colors">
                  ℹ️ Rólunk
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-blue-400 transition-colors">
                  📧 Kapcsolat
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-bold mb-4">⚖️ Jogi</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/privacy" className="hover:text-blue-400 transition-colors">
                  🔒 Adatvédelem
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-blue-400 transition-colors">
                  📋 Feltételek
                </a>
              </li>
              <li>
                <a href="/cookies" className="hover:text-blue-400 transition-colors">
                  🍪 Cookie-k
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-bold mb-4">🌐 Közösségi média</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 text-2xl transition-colors">
                f
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-2xl transition-colors">
                𝕏
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-2xl transition-colors">
                in
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-0.5 bg-gray-700 my-8"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            © {currentYear} Pathly - Közösségi Útvonaltervező. Minden jog fenntartva.
          </p>
          <p className="text-gray-500 text-xs mt-4 md:mt-0">
            v1.0.0 | Made with ❤️ for commuters
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
