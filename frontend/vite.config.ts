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
      '@': path.resolve(__dirname, './src/lib/'),
      actions: `${path.resolve(__dirname, './src/lib/actions/')}`,
      context: `${path.resolve(__dirname, './src/lib/context/')}`,
      components: `${path.resolve(__dirname, './src/lib/components/')}`,
      query: `${path.resolve(__dirname, './src/lib/query/')}`,
      public: `${path.resolve(__dirname, './public/')}`,
      pages: path.resolve(__dirname, './src/lib/pages'),
      types: `${path.resolve(__dirname, './src/lib/@types')}`,
    },
  },
});
