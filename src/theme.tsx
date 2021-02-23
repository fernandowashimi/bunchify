import { extendTheme } from '@chakra-ui/react';
import { createBreakpoints } from '@chakra-ui/theme-tools';

const fonts = { mono: `'Roboto Mono', monospace` };

const breakpoints = createBreakpoints({
  sm: '40em',
  md: '52em',
  lg: '64em',
  xl: '80em',
});

const theme = extendTheme({
  colors: {
    brand: {
      50: '#F68DCE',
      100: '#F57AC6',
      200: '#F467BE',
      300: '#F254B6',
      400: '#F141AD',
      500: '#EE1F9D',
      600: '#E41193',
      700: '#D11087',
      800: '#BE0E7A',
      900: '#AB0D6E',
    },
    black: '#16161D',
  },
  fonts,
  breakpoints,
});

export default theme;
