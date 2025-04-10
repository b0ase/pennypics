import React, { useEffect, useMemo, useState } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
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
  const { publicKey, connecting } = useWallet();
  const { visible, setVisible } = useWalletModal();
  const [hasPrompted, setHasPrompted] = useState(false);

  // Show wallet modal automatically on load if not connected, but only once
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!publicKey && !connecting && !visible && !hasPrompted) {
        console.log("Prompting wallet connection modal...");
        setVisible(true);
        setHasPrompted(true);
      }
    }, 1500); // Wait 1.5 seconds to show the prompt
    
    return () => clearTimeout(timer);
  }, [publicKey, connecting, visible, setVisible, hasPrompted]);
  
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
        marginLeft: '0.5rem' // Add some space if balance is shown
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
      // Temporarily removed Backpack to simplify
      // new BackpackWalletAdapter(), 
    ],
    [network]
  );

  // Connection config with higher commitment level for better reliability
  const connectionConfig = useMemo(
    () => ({
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000, // 60 seconds
      disableRetryOnRateLimit: false,
      confirmTransactionRetries: 3,
    }),
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
} 