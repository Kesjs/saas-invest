import { Suspense, useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import StyleDebugger from './components/debug/StyleDebugger';

// Composant de chargement simplifié
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Composant d'erreur
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen bg-gray-900 text-white p-8">
    <h1 className="text-2xl font-bold text-red-500 mb-4">Une erreur est survenue</h1>
    <pre className="bg-gray-800 p-4 rounded overflow-auto mb-4">
      {error.message}
    </pre>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Réessayer
    </button>
  </div>
);

// Composant de mise en page de base
const BaseLayout = () => {
  console.log('Rendu du composant BaseLayout');
  
  return (
    <div className="min-h-screen bg-black text-white">
      <StyleDebugger />
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#2D3748',
            color: '#fff',
            border: '1px solid #4A5568',
          },
        }}
      />
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error, errorInfo) => {
          console.error('[APP] Erreur dans ErrorBoundary:', error, errorInfo);
        }}
        onReset={() => {
          console.log('[APP] Réinitialisation de l\'application');
          window.location.reload();
        }}
      >
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

// Composant pour la page d'erreur 403
const UnauthorizedPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Accès non autorisé</h1>
        <p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retour
        </button>
      </div>
    </div>
  );
};

// Composant principal de l'application
export default function App() {
  console.log('[APP] Rendu du composant App');
  const [isInitialized, setIsInitialized] = useState(false);
  const location = useLocation();

  // Simuler un chargement initial court
  useEffect(() => {
    console.log('[APP] Effet de chargement initial démarré');
    
    // Vérifier si le composant est toujours monté avant de mettre à jour l'état
    let isMounted = true;
    
    const timer = setTimeout(() => {
      console.log('[APP] Tentative de mise à jour de isInitialized à true');
      if (isMounted) {
        console.log('[APP] Mise à jour de isInitialized à true');
        setIsInitialized(true);
      } else {
        console.log('[APP] Composant déjà démonté, annulation de la mise à jour');
      }
    }, 1000);
    
    return () => {
      console.log('[APP] Nettoyage de l\'effet de chargement');
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Log de l'emplacement actuel
  useEffect(() => {
    console.log('[APP] Changement de route détecté:', location.pathname);
  }, [location]);

  console.log('[APP] État actuel - isInitialized:', isInitialized);

  if (!isInitialized) {
    console.log('[APP] Affichage du loader de chargement');
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="mt-4 text-gray-400">Chargement en cours...</p>
        <p className="text-sm text-gray-500 mt-2">Veuillez patienter</p>
      </div>
    );
  }

  console.log('[APP] Affichage du contenu principal');
  
  try {
    return (
  <ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={(error, errorInfo) => {
    console.error('[APP] Erreur dans ErrorBoundary:', error, errorInfo);
  }}
  onReset={() => {
    console.log('[APP] Réinitialisation de l\'application');
    window.location.reload();
  }}
>
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
    </div>
  }>
    <Outlet />
  </Suspense>
</ErrorBoundary>
    );
  } catch (error) {
    console.error('[APP] Erreur lors du rendu du contenu principal:', error);
    return (
      <div className="min-h-screen bg-red-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Erreur critique</h1>
        <pre className="bg-black/50 p-4 rounded overflow-auto">
          {error.message}
        </pre>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-white text-red-900 rounded hover:bg-gray-200"
        >
          Recharger la page
        </button>
      </div>
    );
  }
}

// Export des composants de route
export { default as HomePage } from './pages/HomePage';
export { default as LoginPage } from './pages/auth/LoginPage';
export { default as RegisterPage } from './pages/auth/RegisterPage';
export { default as VerifyEmailPage } from './pages/auth/VerifyEmailPage';
export { default as ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
export { default as ResetPasswordPage } from './pages/auth/ResetPasswordPage';
export { default as DashboardPage } from './pages/dashboard/DashboardPage';
export { default as InvestmentPage } from './pages/investment/InvestmentPage';
export { default as DepositPage } from './pages/transactions/DepositPage';
export { default as WithdrawPage } from './pages/transactions/WithdrawPage';
export { default as SettingsPage } from './pages/settings/SettingsPage';
export { default as NotFoundPage } from './pages/NotFoundPage';

export { UnauthorizedPage };