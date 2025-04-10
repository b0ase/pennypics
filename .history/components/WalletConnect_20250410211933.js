import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import dynamic from 'next/dynamic';

// Import the wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Wallet connection button component - client-side only rendering
export const WalletConnectButton = dynamic(
  () => Promise.resolve(() => (
    <WalletMultiButton 
      style={{
        background: 'var(--accent-color)',
        color: 'white',
        fontSize: '0.9rem',
        fontWeight: '500',
        borderRadius: '4px',
        transition: 'background 0.3s'
      }}
    />
  )),
  { ssr: false }
);

// Wallet Provider component to wrap the application
const WalletContextProvider = ({ children }) => {
  // Rely on Phantom's built-in connection
  // Instead of creating our own connection, we'll let the wallet handle it
  const network = WalletAdapterNetwork.MainnetBeta;
  
  // Use Phantom's default endpoint which should work better
  const endpoint = clusterApiUrl(network);
  
  // Configure connection with minimal options
  const connectionConfig = {
    commitment: 'processed'
  };
  
  // Only include Phantom and Solflare wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter()
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Export a client-side only version of the provider
export default dynamic(() => Promise.resolve(WalletContextProvider), { ssr: false }); 