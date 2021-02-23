import { FC, ReactNode } from 'react';

import { Box, Flex, useColorMode } from '@chakra-ui/react';

import { Header } from '@/components/Header';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const { colorMode } = useColorMode();

  const bgColor = { light: 'gray.50', dark: 'gray.900' };
  const color = { light: 'black', dark: 'white' };

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      bg={bgColor[colorMode]}
      color={color[colorMode]}
    >
      <Header />
      <Box
        d="flex"
        flex={1}
        w="100%"
        minHeight="calc(100vh - 64px)"
        justifyContent="center"
        alignItems="center"
      >
        {children}
      </Box>
    </Flex>
  );
};
