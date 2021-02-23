import { useColorMode, Switch } from '@chakra-ui/react';

export const DarkModeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const isDark = colorMode === 'dark';

  return <Switch h="20px" isChecked={isDark} onChange={toggleColorMode} />;
};
