import { useColorMode, Box, IconButton, Image, Stack } from '@chakra-ui/react';

import { DarkModeSwitch } from '@/components/DarkModeSwitch';

export const Header = () => {
  const { colorMode } = useColorMode();

  const isDark = colorMode === 'dark';

  return (
    <Box
      h="64px"
      w="100%"
      px={['1rem', '5rem']}
      d="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <Image src="/Bunchify_Logo.svg" boxSize="32px" />

      <Stack direction="row" spacing="1rem" alignItems="center">
        <IconButton
          as="a"
          href="https://github.com/fernandowashimi/bunchify"
          target="_blank"
          variant="ghost"
          aria-label="GitHub"
        >
          <Image
            src={
              isDark
                ? 'https://bunchify.vercel.app/GitHub-Mark-Light.png'
                : 'https://bunchify.vercel.app/GitHub-Mark.png'
            }
          />
        </IconButton>

        <DarkModeSwitch />
      </Stack>
    </Box>
  );
};
