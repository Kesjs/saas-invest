import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { toast } from 'react-hot-toast';
import './GlassNavbar.css';

// Composant pour les liens de navigation desktop
const NavLink = ({ to, onClick, text, className = '', isSection = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.hash === `#${to}`;
  
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      if (isSection) {
        // Si c'est une section, on utilise la fonction de défilement personnalisée
        onClick(to);
      } else if (onClick) {
        onClick();
      }
    }
  };

  return (
    <Link
      to={isSection ? `#${to}` : to}
      onClick={handleClick}
      className={`text-sm font-medium transition-colors duration-200 ${
        isActive 
          ? 'text-white' 
          : 'text-gray-300 hover:text-white'
      } ${className}`}
    >
      {text}
    </Link>
  );
};

// Composant pour les liens de navigation mobile
const MobileNavLink = ({ to, onClick, text, className = '', isSection = false }) => {
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      if (isSection) {
        onClick(to);
      } else if (onClick) {
        onClick();
      }
    }
  };

  return (
    <Link
      to={isSection ? `#${to}` : to}
      onClick={handleClick}
      className={`block w-full py-2 px-3 rounded-lg hover:bg-white/5 transition-colors duration-200 text-gray-200 hover:text-white ${className}`}
    >
      {text}
    </Link>
  );
};

const GlassNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  // Gestion du défilement pour l'effet de rétrécissement
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonction pour faire défiler vers une section
  const scrollTo = (id) => {
    if (id.startsWith('#')) {
      id = id.substring(1);
    }
    
    if (window.location.pathname !== '/') {
      // Si on n'est pas sur la page d'accueil, on navigue vers la page d'accueil avec le hash
      navigate(`/#${id}`, { replace: true });
      
      // On attend que la page soit chargée avant de faire défiler
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const yOffset = -100;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Si on est sur la page d'accueil, on fait défiler vers la section
      const element = document.getElementById(id);
      if (element) {
        const yOffset = -100;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({ top: y, behavior: 'smooth' });
        
        // Met à jour l'URL sans recharger la page
        window.history.pushState({}, '', `#${id}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Déconnexion réussie');
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
      console.error('Logout error:', error);
    }
  };

  return ( 
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`relative rounded-2xl border transition-all duration-300 ${
            isScrolled 
              ? 'bg-black/90 backdrop-blur-lg border-white/20 shadow-xl' 
              : 'bg-black/80 backdrop-blur-md border-white/10 shadow-lg'
          }`}
          style={{
            WebkitBackdropFilter: 'blur(12px)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group transition-transform hover:scale-105"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="relative h-10 w-10">
                <img 
                  src="/logo.svg" 
                  alt="Logo Gazoduc Invest" 
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Gazoduc Invest
              </span>
            </Link>

            {/* Navigation desktop */}
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => scrollTo('features')}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Fonctionnalités
              </button>
              <button 
                onClick={() => scrollTo('how-it-works')}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Comment ça marche
              </button>
              <NavLink to="/invest" text="Investir" />
              
              {/* Menu déroulant pour les pages supplémentaires */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Plus
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-800/95 backdrop-blur-lg shadow-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <NavLink to="/faq" text="FAQ" className="block px-4 py-2 text-sm hover:bg-white/5" />
                    <NavLink to="/contact" text="Contact" className="block px-4 py-2 text-sm hover:bg-white/5" />
                    <NavLink to="/about" text="À propos" className="block px-4 py-2 text-sm hover:bg-white/5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'authentification et thème */}
            <div className="hidden md:flex items-center gap-3">
              {/* Bouton de bascule de thème */}
              <div className="mr-2">
                <ThemeToggle />
              </div>
              
              {user ? (
                <div className="flex items-center gap-3">
                  <Link 
                    to="/dashboard" 
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-primary/30 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 01-.788 0l-7 3a1 1 0 010 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 01.287.02l4.657.98a1 1 0 01.764.727l.5 2.5a1 1 0 101.28 1.537l1.536-1.28a1 1 0 01.78-.172l2.5.5a1 1 0 01.547 1.65l-1.28 1.537a1 1 0 101.537 1.28l1.28-1.537a1 1 0 01.172-.78l.5-2.5a1 1 0 10-1.537-1.28l-1.28 1.537a1 1 0 01-.78.172l-2.5-.5a1 1 0 01-.547-1.65l1.28-1.537a1 1 0 10-1.537-1.28l-1.28 1.537a1 1 0 01-.78.172l-4.657-.98a1 1 0 01-.287-.02l-1.94-.832-1.32.565a1 1 0 01-.788-1.838l7-3a1 1 0 01.788 0z" clipRule="evenodd" />
                    </svg>
                    Tableau de bord
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                    title="Déconnexion"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="px-4 py-2 text-sm font-medium text-white hover:text-primary transition-colors duration-200"
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg hover:opacity-90 transition-all duration-200"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>

            {/* Bouton menu mobile */}
            <button 
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              aria-label="Menu"
              aria-expanded={isMobileOpen}
            >
              <div className="space-y-1.5">
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${isMobileOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMobileOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>

          {/* Menu mobile */}
          <div 
            className={`md:hidden transition-all duration-300 overflow-hidden ${
              isMobileOpen ? 'max-h-96 border-t border-white/10' : 'max-h-0'
            }`}
          >
            <div className="px-4 py-3 space-y-2">
              <MobileNavLink 
                onClick={scrollTo} 
                text="Fonctionnalités" 
                to="features"
                isSection={true}
              />
              <MobileNavLink 
                onClick={scrollTo} 
                text="Comment ça marche" 
                to="how-it-works"
                isSection={true}
              />
              <MobileNavLink 
                to="/invest" 
                text="Investir" 
              />
              <MobileNavLink 
                to="/contact" 
                text="Contact" 
              />
              <div className="px-4 py-2">
                <p className="text-xs font-medium text-gray-400 mb-1">Thème</p>
                <ThemeToggle />
              </div>
              
              {user ? (
                <div className="border-t border-white/10 pt-3 mt-2">
                  <MobileNavLink 
                    to="/dashboard" 
                    text="Tableau de bord"
                    className="flex items-center gap-2 text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 01-.788 0l-7 3a1 1 0 010 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 01.287.02l4.657.98a1 1 0 01.764.727l.5 2.5a1 1 0 101.28 1.537l1.536-1.28a1 1 0 01.78-.172l2.5.5a1 1 0 01.547 1.65l-1.28 1.537a1 1 0 101.537 1.28l1.28-1.537a1 1 0 01.172-.78l.5-2.5a1 1 0 10-1.537-1.28l-1.28 1.537a1 1 0 01-.78.172l-2.5-.5a1 1 0 01-.547-1.65l1.28-1.537a1 1 0 10-1.537-1.28l-1.28 1.537a1 1 0 01-.78.172l-4.657-.98a1 1 0 01-.287-.02l-1.94-.832-1.32.565a1 1 0 01-.788-1.838l7-3a1 1 0 01.788 0z" clipRule="evenodd" />
                    </svg>
                    Tableau de bord
                  </MobileNavLink>
                  <MobileNavLink 
                    onClick={handleLogout}
                    text="Déconnexion"
                    className="flex items-center gap-2 text-red-400 hover:bg-red-400/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    Déconnexion
                  </MobileNavLink>
                </div>
              ) : (
                <div className="pt-3 mt-2 border-t border-white/10 flex gap-3">
                  <Link 
                    to="/login" 
                    className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-gray-200 hover:text-white transition-colors duration-200 bg-white/5 rounded-lg hover:bg-white/10"
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex-1 text-center px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg hover:opacity-90 transition-all duration-200"
                  >
                    Commencer
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GlassNavbar;
