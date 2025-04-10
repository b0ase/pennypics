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
        borderRadius: '8px',
        padding: '0.75rem 1.25rem',
        border: 'none',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        boxShadow: 'var(--card-shadow)',
      }}
    />
  )),
  { ssr: false }
);

// Wallet provider component
export const WalletContextProvider = ({ children }) => {
  // Set the network and endpoint
  const network = WalletAdapterNetwork.Mainnet;
  
  // Create a custom RPC URL using Helius API
  const endpoint = useMemo(() => {
    // Get the Helius API key from environment variable
    const heliusApiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
    
    if (heliusApiKey) {
      console.log('Using Helius RPC endpoint');
      return `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
    } else {
      // Fallback to public endpoint
      console.log('Using public RPC endpoint');
      return clusterApiUrl(network);
    }
  }, [network]);

  // Configure the wallet connection
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
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