import { FC, useContext, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { Box, Button, Code, Image, Stack, Text, useToast } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';

import { Container } from '@/components/Container';
import { DarkModeSwitch } from '@/components/DarkModeSwitch';
import { Loading } from '@/components/Loading';
import { buildUrl, parseUrl } from '@/helpers/urlHandler';
import { AuthContext } from '@/providers/AuthProvider';

interface SpotifyParams {
  baseUrl: string;
  clientId: string;
  type: string;
  redirectUri: string;
  scope: string;
}

interface AuthorizeProps {
  spotifyParams: SpotifyParams;
}

const Authorize: FC<AuthorizeProps> = ({ spotifyParams }) => {
  const { setAccessToken } = useContext(AuthContext);
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  const handleAuthorization = () => {
    const url = buildUrl(spotifyParams);
    window.open(url, '_self');
  };

  useEffect(() => {
    try {
      const token = parseUrl();

      if (token) {
        setAccessToken(token);

        router.push('/');
      } else {
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);

      toast({
        title: 'Authorization failed.',
        description: e.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  }, []);

  return (
    <Container height="100vh">
      <DarkModeSwitch />
      {loading ? (
        <Loading />
      ) : (
        <>
          <Stack direction="column" spacing="2rem" alignItems="center">
            <Box backgroundColor="gray.900" p="15px">
              <Image src="/Bunchify_Typo.png" htmlWidth="250px" />
            </Box>

            <Text textAlign="center">
              Generate assets based on your <Code>Spotify</Code> data.
            </Text>

            <Container>
              <Button
                rightIcon={<ArrowForwardIcon />}
                colorScheme="green"
                variant="solid"
                w="auto"
                onClick={handleAuthorization}
              >
                Get started now
              </Button>
            </Container>
          </Stack>
        </>
      )}
    </Container>
  );
};

export async function getStaticProps() {
  return {
    props: {
      spotifyParams: {
        baseUrl: process.env.SPOTIFY_AUTH_URL,
        clientId: process.env.SPOTIFY_CLIENT_ID,
        redirectUri: process.env.SPOTIFY_REDIRECT_URI,
        type: process.env.SPOTIFY_RESPONSE_TYPE,
        scope: process.env.SPOTIFY_SCOPE,
      },
    },
  };
}

export default Authorize;
