import { ChangeEvent, FC, useContext, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import useSWR from 'swr';
import {
  Box,
  Button,
  Heading,
  Image,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Select,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { DownloadIcon, InfoIcon, ViewIcon } from '@chakra-ui/icons';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import { useDebounce } from 'use-debounce';

import { Layout } from '@/components/Layout';
import { Loading } from '@/components/Loading';
import { AuthContext } from '@/providers/AuthProvider';
import { getProfile, getTop } from '@/services/spotify';
import { generateImage } from '@/services/api';

interface OptionsState {
  type: 'artists' | 'tracks';
  range: 'short_term' | 'medium_term' | 'long_term';
}

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

const Index: FC = () => {
  const { accessToken } = useContext(AuthContext);
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<OptionsState>({ type: 'artists', range: 'short_term' });
  const [imageBlob, setImageBlob] = useState<Blob | undefined>();
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [primaryColor, setPrimaryColor] = useState('#ee1f9d');
  const [secondaryColor, setSecondaryColor] = useState('#dbfa84');
  const [debouncedPrimaryColor] = useDebounce(primaryColor, 200);
  const [debouncedSecondaryColor] = useDebounce(secondaryColor, 200);

  const { data: profile } = useSWR('profile', () => getProfile({ token: accessToken }));
  const { data: top } = useSWR(`top_${options.type}_${options.range}`, () =>
    getTop({ token: accessToken, type: options.type, range: options.range, limit: 5 }),
  );

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = e.target;

    setOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerate = async () => {
    setImageBlob(undefined);

    if (!top) return;

    if (top.items.length < 5) {
      toast({
        title: 'Failed to generate.',
        description: "You don't have enough data to proceed.",
        status: 'error',
        duration: 9000,
        isClosable: true,
      });

      return;
    }

    const response = await generateImage({
      type: options.type,
      range: options.range,
      data: top.items,
      profile: profile,
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
      },
    });

    setImageBlob(response);
  };

  const handleSave = () => {
    if (!imageBlob || !imageUrl) return;

    const anchorElement = document.createElement('a');

    document.body.appendChild(anchorElement);

    anchorElement.href = imageUrl;
    anchorElement.download = 'bunchify_image.png';
    anchorElement.click();

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
    if (profile && top && !imageBlob) {
      handleGenerate();
    }
  }, [profile, top]);

  useEffect(() => {
    if (!imageBlob) return;

    const reader = new FileReader();
    reader.readAsDataURL(imageBlob);

    reader.onload = () => {
      if (typeof reader.result !== 'string') return;

      setImageUrl(reader.result);
    };
  }, [imageBlob]);

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
                    <Stack direction="row" spacing="1rem">
                      <Text mb="0.5rem">Primary color</Text>
                      <Tooltip
                        label="Darker colors may make it difficult to read."
                        aria-label="Range tooltip"
                        placement="right-end"
                      >
                        <InfoIcon w="18px" h="18px" mt="4px" cursor="pointer" />
                      </Tooltip>
                    </Stack>

                    <Popover placement="bottom-start">
                      <PopoverTrigger>
                        <Button w="100%" backgroundColor={primaryColor} />
                      </PopoverTrigger>
                      <PopoverContent w="250px" p="1.5rem" alignItems="center">
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverBody>
                          <Stack direction="column" spacing="1rem">
                            <HexColorPicker color={primaryColor} onChange={setPrimaryColor} />
                            <HexColorInput
                              color={primaryColor}
                              onChange={setPrimaryColor}
                              style={{ borderRadius: 8, textAlign: 'center', color: '#333' }}
                            />
                          </Stack>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </Box>

                  <Box w={['100%', '50%']}>
                    <Stack direction="row" spacing="1rem">
                      <Text mb="0.5rem">Secondary color</Text>
                      <Tooltip
                        label="Darker colors may make it difficult to read."
                        aria-label="Range tooltip"
                        placement="right-end"
                      >
                        <InfoIcon w="18px" h="18px" mt="4px" cursor="pointer" />
                      </Tooltip>
                    </Stack>

                    <Popover placement="bottom-start">
                      <PopoverTrigger>
                        <Button w="100%" backgroundColor={secondaryColor} />
                      </PopoverTrigger>
                      <PopoverContent w="250px" p="1.5rem" alignItems="center">
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverBody>
                          <Stack direction="column" spacing="1rem">
                            <HexColorPicker color={secondaryColor} onChange={setSecondaryColor} />
                            <HexColorInput
                              color={secondaryColor}
                              onChange={setSecondaryColor}
                              style={{ borderRadius: 8, textAlign: 'center', color: '#333' }}
                            />
                          </Stack>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </Box>

                  <Box w={['100%', '50%']} pt="2rem">
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
                      disabled={!imageBlob}
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
                  {imageUrl || imageBlob ? (
                    <Image src={imageUrl} w="300px" />
                  ) : (
                    <Skeleton h="650px" w="300px" />
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
