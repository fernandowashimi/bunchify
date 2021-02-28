import NextDocument, { Html, Head, Main, NextScript } from 'next/document';
import { ColorModeScript } from '@chakra-ui/react';

export default class Document extends NextDocument {
  render() {
    return (
      <Html>
        <Head>
          <title>Bunchify</title>
          <meta
            name="description"
            content="Bunchify allows you to generate shareable images based on statistics about your Spotify usage."
          />
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <body>
          <ColorModeScript />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
