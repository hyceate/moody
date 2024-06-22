/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from '@generouted/react-router';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme.ts';
import { AuthProvider } from '@/context/authContext.tsx';
import './index.css';

const queryClient = new QueryClient();
const html = document.querySelector('html');
html?.setAttribute('dir', 'ltr');
const router = createBrowserRouter(routes);
const Routes = () => <RouterProvider router={router}></RouterProvider>;
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes />
        </AuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  </React.StrictMode>,
);
