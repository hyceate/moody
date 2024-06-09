import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react-swc';
import react from '@vitejs/plugin-react';
import generouted from '@generouted/react-router/plugin';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), generouted()],
  server: { port: 5173 },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
      actions: `${path.resolve(__dirname, './src/actions/')}`,
      components: `${path.resolve(__dirname, './src/components/')}`,
      query: `${path.resolve(__dirname, './src/query/')}`,
      public: `${path.resolve(__dirname, './public/')}`,
      pages: path.resolve(__dirname, './src/pages'),
      types: `${path.resolve(__dirname, './src/@types')}`,
    },
  },
});
