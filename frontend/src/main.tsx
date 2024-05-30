import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes } from '@generouted/react-router';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme.ts';
import { AuthProvider } from './context/authContext';
import './index.css';

const queryClient = new QueryClient();
const html = document.querySelector('html');
html?.setAttribute('dir', 'ltr');
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
