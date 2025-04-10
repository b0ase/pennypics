import React, { useEffect, useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, BackpackWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import the styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Set the network based on environment or default to devnet
const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' 
  ? WalletAdapterNetwork.Mainnet 
  : WalletAdapterNetwork.Devnet;

// You can also provide a custom RPC endpoint
const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);

export const WalletConnectButton = () => {
  return (
    <WalletMultiButton
      style={{
        backgroundColor: 'var(--accent-color)',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        fontSize: '14px',
        border: 'none',
        padding: '0.5rem 1rem',
      }}
    />
  );
};

export default function WalletContextProvider({ children }) {
  // The wallets we want to support  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new BackpackWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
} 