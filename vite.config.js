import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'contexts': [
            './src/context/contexts/MenuContext.jsx',
            './src/context/contexts/CartContext.jsx',
            './src/context/contexts/AuthContext.jsx',
            './src/context/contexts/ReservationContext.jsx',
            './src/context/contexts/SearchContext.jsx'
          ],
          'admin': [
            './src/components/admin/AdminDashboard.jsx',
            './src/components/admin/JsonViewer.jsx',
            './src/components/admin/MenuManager.jsx',
            './src/components/admin/MenuUploader.jsx',
            './src/components/admin/MenuUploadModal.jsx',
            './src/components/admin/MenuVersionManager.jsx',
            './src/components/admin/OrderList.jsx',
            './src/components/admin/ReservationConfig.jsx',
            './src/components/admin/ReservationList.jsx',
            './src/components/admin/TableList.jsx',
            './src/components/admin/ViewMenuJson.jsx',
            './src/components/admin/ViewSiteContent.jsx'
          ]
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.jsx']
    }
  }
});
