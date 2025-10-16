import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="backdrop-blur supports-[backdrop-filter]:bg-black/50 bg-black/80 border-t border-white/10">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link to="/about" className="text-gray-400 hover:text-white">
              À propos
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white">
              Conditions d'utilisation
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-white">
              Confidentialité
            </Link>
            <Link to="/contact" className="text-gray-400 hover:text-white">
              Contact
            </Link>
          </div>
          <div className="mt-4 md:mt-0 text-center md:text-right">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} Gazoduc Invest. Tous droits réservés.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
