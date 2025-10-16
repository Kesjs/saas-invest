console.log('[INDEX] Démarrage de l\'application...');

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/SupabaseAuthContext';
import { router } from './routes';
import './index.css';

console.log('[INDEX] Importations terminées');

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

console.log('[INDEX] Client Query créé');

// Add future flags for React Router v7
const routerWithFutureFlags = {
  ...router,
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};

console.log('[INDEX] Configuration du routeur terminée');

const Root = () => {
  console.log('[ROOT] Rendu du composant Root');
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider 
          router={routerWithFutureFlags} 
          future={routerWithFutureFlags.future}
          fallbackElement={
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }
        />
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
};

console.log('[INDEX] Création de la racine React...');

// Create root only once
const container = document.getElementById('root');
if (!container) {
  console.error('[ERREUR] Élément #root introuvable dans le DOM');
} else {
  console.log('[INDEX] Élément #root trouvé, création de la racine React...');
  
  try {
    const root = ReactDOM.createRoot(container);
    console.log('[INDEX] Racine React créée avec succès');
    
    root.render(
      <React.StrictMode>
        <Root />
      </React.StrictMode>
    );
    
    console.log('[INDEX] Application rendue avec succès');
  } catch (error) {
    console.error('[ERREUR CRITIQUE] Échec du rendu de l\'application:', error);
    
    // Afficher un message d'erreur dans le DOM en cas d'échec
    const errorMessage = document.createElement('div');
    errorMessage.style.padding = '20px';
    errorMessage.style.color = 'white';
    errorMessage.style.backgroundColor = '#7f1d1d';
    errorMessage.style.fontFamily = 'sans-serif';
    errorMessage.innerHTML = `
      <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Erreur critique lors du chargement de l'application</h2>
      <pre style="background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 4px; overflow: auto;">
${error.message || 'Erreur inconnue'}
      </pre>
      <button 
        onclick="window.location.reload()" 
        style="margin-top: 1rem; padding: 0.5rem 1rem; background: white; color: #7f1d1d; border: none; border-radius: 4px; cursor: pointer;"
      >
        Réessayer
      </button>
    `;
    
    container.innerHTML = '';
    container.appendChild(errorMessage);
  }
}

// Ajouter un gestionnaire d'erreur global
window.addEventListener('error', (event) => {
  console.error('[ERREUR GLOBALE]', event.error || event.message || event);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[PROMISE REJECTION]', event.reason || 'Raison inconnue');});