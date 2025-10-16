import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Chargement des variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: path.resolve(__dirname, './'),
    publicDir: path.resolve(__dirname, 'public'),
    plugins: [react()],
    
    define: {
      'process.env': {}
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    
    // Configurer le point d'entrée principal et les options de build
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'src/index.jsx')
        },
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['@supabase/supabase-js', '@tanstack/react-query'],
          },
        },
      },
      assetsInlineLimit: 0,
      chunkSizeWarningLimit: 1000,
    },
    
    // Configurer le serveur de développement
    server: {
      port: 3002,
      open: true,
      strictPort: true,
      host: '0.0.0.0',
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3002,
      },
    },
    
    optimizeDeps: {
      include: ['@fontsource/inter', '@fontsource/poppins'],
    },
    
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer()
        ]
      }
    }
  };
});
