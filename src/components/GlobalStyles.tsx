import { css, Global } from '@emotion/react';

export const GlobalStyles = () => (
  <Global
    styles={css`
      html {
        scroll-behavior: smooth;
      }
    `}
  />
);
