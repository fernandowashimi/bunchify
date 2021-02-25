import { ChangeEvent, FC, useContext, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import useSWR from 'swr';
import {
  Box,
  Button,
  Heading,
  Image,
  Select,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { DownloadIcon, InfoIcon, ViewIcon } from '@chakra-ui/icons';

import { Layout } from '@/components/Layout';
import { Loading } from '@/components/Loading';
import { AuthContext } from '@/providers/AuthProvider';
import { getProfile, getTop } from '@/services/spotify';
import { generateImage } from '@/services/api';

const typeOptions = [
  { value: 'artists', label: 'Top artists', enabled: true },
  { value: 'tracks', label: 'Top tracks', enabled: true },
];

const rangeOptions = [
  { value: 'short_term', label: 'Short term' },
  { value: 'medium_term', label: 'Medium term' },
  { value: 'long_term', label: 'Long term' },
];

const rangeTooltip = `
  Short term: approximately last 4 weeks.\n
  Medium term: approximately last 6 months.\n
  Long term: calculated from several years of data and including all new data as it becomes available.
`;

interface OptionsState {
  type: 'artists' | 'tracks';
  range: 'short_term' | 'medium_term' | 'long_term';
}

const Index: FC = () => {
  const { accessToken } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<OptionsState>({ type: 'artists', range: 'short_term' });
  const [image, setImage] = useState();

  const { data: profile } = useSWR('profile', () => getProfile({ token: accessToken }));
  const { data: top } = useSWR(`top_${options.type}_${options.range}`, () =>
    getTop({ token: accessToken, type: options.type, range: options.range, limit: 10 }),
  );

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = e.target;

    setOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerate = async () => {
    setImage(undefined);

    if (!top) return;

    const response = await generateImage({
      type: options.type,
      range: options.range,
      data: top.items,
      profile: profile,
    });

    setImage(response);
  };

  const handleSave = () => {
    if (!image) return;

    const anchorElement = document.createElement('a');
    const url = URL.createObjectURL(image);

    document.body.appendChild(anchorElement);

    anchorElement.href = url;
    anchorElement.download = 'bunchify_image.png';
    anchorElement.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(anchorElement);
  };

  useEffect(() => {
    if (accessToken) {
      setLoading(false);
    } else {
      router.push('/authorize');
    }
  }, [accessToken]);

  useEffect(() => {
    if (profile && top && !image) {
      handleGenerate();
    }
  }, [profile, top]);

  return (
    <Layout>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Stack
            direction={['column', 'row']}
            flex={1}
            w="100%"
            spacing={['1rem', 0]}
            p={['2rem', '2rem']}
          >
            <Box w={['100%', '50%']}>
              <Stack direction="column" spacing="1rem">
                {profile ? (
                  <Heading as="h1" size="md" textAlign="center">
                    Welcome, {profile.display_name}!
                  </Heading>
                ) : (
                  <Skeleton height="20px" />
                )}

                <Stack direction="column" flex={1} alignItems="center" spacing="1rem">
                  <Box w={['100%', '50%']}>
                    <Text mb="0.5rem">Type</Text>

                    <Select name="type" value={options.type} onChange={handleSelectChange}>
                      {typeOptions.map((o, i) => (
                        <option key={i} value={o.value} disabled={!o.enabled}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Box w={['100%', '50%']}>
                    <Stack direction="row" spacing="1rem">
                      <Text mb="0.5rem">Range</Text>
                      <Tooltip
                        label={rangeTooltip}
                        aria-label="Range tooltip"
                        placement="right-end"
                      >
                        <InfoIcon w="18px" h="18px" mt="4px" cursor="pointer" />
                      </Tooltip>
                    </Stack>

                    <Select name="range" value={options.range} onChange={handleSelectChange}>
                      {rangeOptions.map((o, i) => (
                        <option key={i} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Box w={['100%', '50%']}>
                    <Button
                      colorScheme="brand"
                      variant="solid"
                      w="100%"
                      leftIcon={<ViewIcon />}
                      onClick={handleGenerate}
                    >
                      Generate
                    </Button>
                  </Box>

                  <Box w={['100%', '50%']}>
                    <Button
                      colorScheme="brand"
                      variant="solid"
                      download="image.png"
                      w="100%"
                      leftIcon={<DownloadIcon />}
                      disabled={!image}
                      onClick={handleSave}
                    >
                      Save image
                    </Button>
                  </Box>
                </Stack>
              </Stack>
            </Box>

            <Box w={['100%', '50%']}>
              <Stack direction="column" spacing="1rem" align="center">
                <Heading as="h1" size="md">
                  Preview
                </Heading>

                <Box d="flex" alignItems="center" justifyContent="center">
                  {image ? (
                    <Image src={URL.createObjectURL(image)} w="375px" />
                  ) : (
                    <Skeleton h="812px" w="375px" />
                  )}
                </Box>
              </Stack>
            </Box>
          </Stack>
        </>
      )}
    </Layout>
  );
};

export default Index;
