import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus';
import { LedgerWalletAdapter } from '@solana/wallet-adapter-ledger';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
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
  // Set network to 'mainnet-beta' for production
  const network = WalletAdapterNetwork.MainnetBeta;
  
  // Use direct endpoint for better stability
  const endpoint = "https://api.mainnet-beta.solana.com";
  
  // Initialize phantom as the primary wallet adapter
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter()
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
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