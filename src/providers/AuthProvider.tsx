import React, { createContext, FC } from 'react';

import { useLocalStorage } from '../hooks/useLocalStorage';

interface IAuthContextValue {
  accessToken: string;
  setAccessToken: (value: string | ((val: string) => string)) => void;
}

const AuthContext = createContext<IAuthContextValue>({
  accessToken: '',
  setAccessToken: () => {},
});

const AuthProvider: FC = ({ children }) => {
  const [accessToken, setAccessToken] = useLocalStorage('bunchify_token', '');

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
