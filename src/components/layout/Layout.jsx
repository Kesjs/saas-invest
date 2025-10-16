import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import GlassNavbar from '../common/GlassNavbar';

const Layout = ({ children }) => {
  console.log('[LAYOUT] Rendu du composant Layout');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const location = useLocation();
  
  console.log('[LAYOUT] État actuel:', {
    pathname: location.pathname,
    hasUser: !!user,
    loading,
    sidebarOpen,
    hasChildren: !!children
  });
  
  // Close sidebar when route changes
  useEffect(() => {
    console.log('[LAYOUT] Changement de route détecté:', location.pathname);
    setSidebarOpen(false);
  }, [location]);

  // Vérifier si c'est la page d'accueil
  const isHomePage = location.pathname === '/';
  console.log('[LAYOUT] Est la page d\'accueil:', isHomePage);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative">
      {/* Navbar pour la page d'accueil */}
      {isHomePage && <GlassNavbar className="glass-nav" />}
      
      {/* Layout principal pour les autres pages */}
      <div className={`flex flex-1 main-content ${isHomePage ? 'pt-20' : 'pt-16'}`} style={{ position: 'relative', zIndex: 1 }}>
        {user && (
          <>
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 z-20 bg-black/70 lg:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
            )}
            
            {/* Sidebar */}
            <div 
              className={`fixed inset-y-0 left-0 z-40 w-64 transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              } bg-black/80 backdrop-blur border-r border-white/10 transition duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
            >
              <Sidebar />
            </div>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header (non affiché sur la page d'accueil) */}
          {!isHomePage && <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
          
          {/* Page content */}
          <main className="flex-1 overflow-y-auto focus:outline-none">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children || <Outlet />}
            </div>
          </main>
          
          {/* Footer (non affiché sur la page d'accueil) */}
          {!isHomePage && <Footer />}
        </div>
      </div>
    </div>
  );
};

export default Layout;
