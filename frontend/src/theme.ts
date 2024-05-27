import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    actions: {
      'pink.100': '#be123c',
      'pink.50': '#d4455a',
    },
    primary: {
      50: '#eef9ff',
      100: '#d4ebff',
    },
  },
  fonts: {
    body: 'Atkinson Hyper Pro, Roboto, sans-serif',
    heading: 'Lexend, sans-serif',
  },
});

export default theme;
