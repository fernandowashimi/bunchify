import { FC, useContext, useEffect, useState } from 'react';

import Head from 'next/head';
import { useRouter } from 'next/router';

import {
  Box,
  Button,
  Code,
  Divider,
  Heading,
  IconButton,
  Image,
  ScaleFade,
  SlideFade,
  Stack,
  Text,
  useToast,
  useColorMode,
} from '@chakra-ui/react';
import { ArrowForwardIcon, ChevronDownIcon, LinkIcon, LockIcon, StarIcon } from '@chakra-ui/icons';

import { Layout } from '@/components/Layout';
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
  const { colorMode } = useColorMode();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  const sectionBgColor = { light: 'gray.200', dark: 'gray.800' };
  const cardBgColor = { light: 'gray.50', dark: 'gray.900' };

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

      if (e instanceof Error) {
        toast({
          title: 'Authorization failed.',
          description: e.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    }
  }, []);

  return (
    <Layout>
      <Head>
        <title>Bunchify</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      {loading ? (
        <Loading />
      ) : (
        <Box d="flex" w="100%">
          <Stack direction="column" spacing="0" w="100%" alignItems="center">
            <Box
              d="flex"
              w={['100%', '90%', '70%', '60%']}
              h="calc(100vh - 128px) "
              alignItems="center"
            >
              <Stack direction="row" w="100%">
                <Box d="flex" w={['100%', '50%']} justifyContent={['center', 'flex-end']}>
                  <ScaleFade in={!loading} initialScale={0.2}>
                    <Stack direction="column" spacing="2rem" alignItems={['center', 'flex-start']}>
                      <Box
                        d="flex"
                        w="100%"
                        px={['2rem', '1rem']}
                        justifyContent={['center', 'flex-start']}
                      >
                        <Image src="/Bunchify_Typo.svg" alt="Bunchify" htmlWidth="200px" />
                      </Box>

                      <Text px={['2rem', '1rem']} fontSize="xl" textAlign={['justify', 'left']}>
                        Bunchify allows you to generate shareable images based on statistics about
                        your <Code>Spotify</Code> usage.
                      </Text>

                      <Box
                        d="flex"
                        w="100%"
                        px={['2rem', '1rem']}
                        justifyContent={['center', 'flex-start']}
                      >
                        <Stack direction={['column', 'column', 'row']} w="100%" spacing="2rem">
                          <Button
                            rightIcon={<ArrowForwardIcon />}
                            colorScheme="brand"
                            variant="solid"
                            w={['100%', 'auto']}
                            onClick={handleAuthorization}
                          >
                            Get started now
                          </Button>

                          <Button as="a" variant="link" w={['100%', 'auto']} href="#how-it-works">
                            How it works
                          </Button>
                        </Stack>
                      </Box>
                    </Stack>
                  </ScaleFade>
                </Box>

                <SlideFade in={!loading} offsetY={600}>
                  <Box d={['none', 'flex']} w="sm" justifyContent="flex-start">
                    <Image src="/Mockup.png" alt="Mockup" objectFit="contain" />
                  </Box>
                </SlideFade>
              </Stack>
            </Box>

            <Box
              d="flex"
              h="64px"
              w="100%"
              backgroundImage={`url(${
                colorMode === 'dark' ? '/Divisor_Dark.svg' : '/Divisor_Light.svg'
              })`}
              backgroundRepeat="repeat-x"
              backgroundPosition="bottom"
              backgroundSize="contain"
              justifyContent="center"
            >
              <IconButton
                as="a"
                aria-label="Scroll to bottom"
                variant="ghost"
                icon={<ChevronDownIcon boxSize={30} />}
                top="-30px"
                href="#how-it-works"
              />
            </Box>

            <Box
              w="100%"
              minH="100vh"
              backgroundColor={sectionBgColor[colorMode]}
              id="how-it-works"
            >
              <Stack direction="column">
                <Box d="flex" height="128px" justifyContent="center" alignItems="center">
                  <Heading as="h1" size="lg" textAlign="center">
                    how it works
                  </Heading>
                </Box>

                <Box
                  d="flex"
                  pb={['0', '0', '16rem']}
                  minH="calc(100vh - 128px)"
                  alignItems="center"
                >
                  <Stack
                    direction={['column', 'column', 'row']}
                    w="100%"
                    height="max-content"
                    justifyContent="center"
                    alignItems={['center', 'center', 'normal']}
                    spacing="1rem"
                  >
                    <Box
                      w={['90%', '90%', 'xs']}
                      maxW={['none', 'none', '30%']}
                      p="2rem"
                      borderRadius="lg"
                      backgroundColor={cardBgColor[colorMode]}
                    >
                      <Stack direction="column" spacing="1rem">
                        <LinkIcon boxSize={6} color="brand.500" />
                        <Divider />
                        <Text>
                          To allow this application to receive your data, you need to connect to
                          your Spotify account.
                        </Text>
                        <Text>
                          You can revoke this permission at any time at{' '}
                          <Button as="a" variant="link" href="https://www.spotify.com/account">
                            spotify.com/account
                          </Button>
                          .
                        </Text>
                      </Stack>
                    </Box>

                    <Box
                      w={['90%', '90%', 'xs']}
                      maxW={['none', 'none', '30%']}
                      p="2rem"
                      borderRadius="lg"
                      backgroundColor={cardBgColor[colorMode]}
                    >
                      <Stack direction="column" spacing="1rem">
                        <LockIcon boxSize={6} color="brand.500" />
                        <Divider />
                        <Text>
                          We use the official{' '}
                          <Button
                            as="a"
                            variant="link"
                            href="https://developer.spotify.com/documentation/web-api/"
                          >
                            Spotify Web API
                          </Button>{' '}
                          to read your user profile details, recently played tracks and top
                          artists/tracks.
                        </Text>
                      </Stack>
                    </Box>

                    <Box
                      w={['90%', '90%', 'xs']}
                      maxW={['none', 'none', '30%']}
                      p="2rem"
                      borderRadius="lg"
                      backgroundColor={cardBgColor[colorMode]}
                    >
                      <Stack direction="column" spacing="1rem">
                        <StarIcon boxSize={6} color="brand.500" />
                        <Divider />
                        <Text>
                          For now, you can choose to generate your top artists or tracks across
                          different time ranges and customize them
                        </Text>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>
      )}
    </Layout>
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
