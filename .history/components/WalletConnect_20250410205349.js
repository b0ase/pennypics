import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import the wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Wallet connection button component
export const WalletConnectButton = () => {
  return (
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
  );
};

// Wallet Provider component to wrap the application
export default function WalletContextProvider({ children }) {
  // Set network to 'devnet' for development, 'mainnet-beta' for production
  const network = WalletAdapterNetwork.Devnet;
  
  // Get the endpoint for the Solana connection
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  // Initialize the wallet adapters you want to support
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
} 