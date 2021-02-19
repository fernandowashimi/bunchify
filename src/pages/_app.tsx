import { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import { ChakraProvider } from '@chakra-ui/react';
import { SWRConfig } from 'swr';

import { AuthProvider } from '@/providers/AuthProvider';

import theme from '../theme';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <AuthProvider>
      <SWRConfig
        value={{
          onError: (error, key) => {
            if (error.status === 401) {
              router.push('/authorize');
            }
          },
        }}
      >
        <ChakraProvider resetCSS theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </SWRConfig>
    </AuthProvider>
  );
}

export default MyApp;
