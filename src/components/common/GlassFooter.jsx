import { Link } from 'react-router-dom';

const GlassFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/90 flex items-center justify-center text-white font-bold">G</div>
              <span className="text-white font-semibold">Gazoduc Invest</span>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Investissement dans le Gaz Naturel Liquéfié avec un focus sécurité et transparence.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10">T</a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10">F</a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10">In</a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10">Ig</a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-white">Accueil</Link></li>
              <li><Link to="/invest" className="text-gray-400 hover:text-white">Investir</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white">Tableau de bord</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-gray-400 hover:text-white">Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white">Confidentialité</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Admiraal de Ruijterweg 401, 1055MD Amsterdam</li>
              <li>+31 20 674 33 79</li>
              <li>contact@votredomaine.com</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-gray-500">
          © {year} Gazoduc Invest — Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default GlassFooter;


