// Désactiver les logs en production
if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

console.log('[INDEX] Démarrage de l\'application...');

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/SupabaseAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { router } from './routes';
import './index.css';

console.log('[INDEX] Importations terminées');

// Configuration du client Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

console.log('[INDEX] Client Query créé');

// Configuration du routeur avec les flags futurs
const routerWithFutureFlags = createBrowserRouter(router.routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

console.log('[INDEX] Configuration du routeur terminée');

// Composant racine
function App() {
  console.log('[ROOT] Rendu du composant Root');
  
  return (
    <StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={routerWithFutureFlags} />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  );
}

// Point d'entrée de l'application
function initializeApp() {
  console.log('[INDEX] Initialisation de l\'application...');
  
  const container = document.getElementById('root');
  
  if (!container) {
    console.error('[ERREUR] Élément #root introuvable dans le DOM');
    return;
  }

  try {
    console.log('[INDEX] Création de la racine React...');
    const root = createRoot(container);
    
    root.render(<App />);
    console.log('[INDEX] Application rendue avec succès');
  } catch (error) {
    console.error('[ERREUR CRITIQUE] Échec du rendu de l\'application:', error);
    
    // Afficher un message d'erreur convivial
    container.innerHTML = `
      <div style="
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #fff;
        background: #7f1d1d;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      ">
        <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">
          Oups ! Une erreur est survenue
        </h2>
        <p style="margin-bottom: 1.5rem;">
          Nous rencontrons des difficultés pour charger l'application.
          Veuillez réessayer ou contacter le support si le problème persiste.
        </p>
        <div style="
          background: rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          overflow: auto;
          max-height: 200px;
          font-family: monospace;
          font-size: 0.875rem;
        ">
          ${error.toString()}
        </div>
        <button 
          onclick="window.location.reload()" 
          style="
            padding: 0.75rem 1.5rem;
            background: #fff;
            color: #7f1d1d;
            border: none;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
          "
          onmouseover="this.style.backgroundColor='#f0f0f0'"
          onmouseout="this.style.backgroundColor='#fff'"
        >
          Réessayer
        </button>
      </div>
    `;
  }
}

// Démarrer l'application
initializeApp();

// Ajouter un gestionnaire d'erreur global
window.addEventListener('error', (event) => {
  console.error('[ERREUR GLOBALE]', event.error || event.message || event);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[PROMISE REJECTION]', event.reason || 'Raison inconnue');});