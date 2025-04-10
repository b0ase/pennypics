import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' https://*.solana.com https://*.helius-rpc.com https://*.solana-api.com https://*.solana-mainnet.com https://api.mainnet-beta.solana.com; style-src 'self' 'unsafe-inline';" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 