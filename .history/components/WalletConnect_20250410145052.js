import React, { useEffect, useMemo, useState } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Dynamic import to prevent SSR issues
import dynamic from 'next/dynamic';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// Import the RPC selector (dynamically to avoid SSR issues)
const SolanaRpcSelector = dynamic(() => import('./SolanaRpcSelector'), { ssr: false });

// Simple wrapper around the WalletMultiButton with auto-connect functionality
function WalletConnectButtonBase() {
  const { publicKey, connecting } = useWallet();
  const { visible, setVisible } = useWalletModal();
  const [hasPrompted, setHasPrompted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rpcUrl, setRpcUrl] = useState('');
  
  // Set mounted state when client-side
  useEffect(() => {
    setMounted(true);
    
    // Check if we have a stored RPC URL
    if (typeof localStorage !== 'undefined') {
      const storedRpc = localStorage.getItem('solana-rpc-url');
      if (storedRpc) {
        setRpcUrl(storedRpc);
      }
    }
  }, []);
  
  // Show wallet modal automatically on load if not connected
  useEffect(() => {
    if (!mounted) return;
    
    const timer = setTimeout(() => {
      if (!publicKey && !connecting && !visible && !hasPrompted) {
        setVisible(true);
        setHasPrompted(true);
      }
    }, 1500); // Wait 1.5 seconds to show the prompt
    
    return () => clearTimeout(timer);
  }, [publicKey, connecting, visible, setVisible, hasPrompted, mounted]);
  
  // Don't render anything on the server
  if (!mounted) return null;
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      position: 'relative'
    }}>
      {/* RPC Selector */}
      <SolanaRpcSelector onRpcChange={setRpcUrl} />
      
      {/* Wallet Button */}
      <WalletMultiButton 
        style={{
          backgroundColor: publicKey ? 'var(--accent-color)' : '#e53e3e',
          color: 'white',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '8px',
          animation: publicKey ? 'none' : 'pulse 2s infinite'
        }}
      />
      
      {publicKey && (
        <div style={{
          fontSize: '0.8rem',
          color: 'white',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </div>
      )}
      
      {!publicKey && !visible && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          padding: '6px 10px',
          backgroundColor: 'rgba(229, 62, 62, 0.9)',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          pointerEvents: 'none'
        }}>
          Connect wallet to generate images
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(229, 62, 62, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(229, 62, 62, 0);
          }
        }
      `}</style>
    </div>
  );
}

// Dynamically export the WalletConnectButton with no SSR to prevent hydration issues
export const WalletConnectButton = dynamic(
  () => Promise.resolve(WalletConnectButtonBase),
  { ssr: false }
);

// Main provider component that wraps your app with all the necessary Solana providers
const WalletContextProvider = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state when client-side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Determine network based on environment variables
  const network = useMemo(() => {
    if (!mounted) return WalletAdapterNetwork.Devnet; // Default
    
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '';
    
    if (rpcUrl.includes('mainnet')) {
      console.log("Using Solana Mainnet");
      return WalletAdapterNetwork.Mainnet;
    } else if (rpcUrl.includes('testnet')) {
      console.log("Using Solana Testnet");
      return WalletAdapterNetwork.Testnet;
    } else {
      console.log("Using Solana Devnet");
      return WalletAdapterNetwork.Devnet;
    }
  }, [mounted]);
  
  // Get the custom RPC endpoint from environment or use the cluster API URL
  const endpoint = useMemo(() => {
    // First try to use locally stored RPC URL if available
    if (mounted && typeof localStorage !== 'undefined') {
      const storedRpc = localStorage.getItem('solana-rpc-url');
      if (storedRpc) {
        console.log("Using stored RPC endpoint:", storedRpc);
        return storedRpc;
      }
    }
    
    // Otherwise use the one from environment
    const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    
    if (mounted && customRpc) {
      console.log("Using custom RPC endpoint from env:", customRpc);
      return customRpc;
    }
    
    // Fallback to default cluster URL
    return clusterApiUrl(network);
  }, [network, mounted]);
  
  console.log("Solana network:", network);
  console.log("Solana endpoint:", endpoint);
  
  // We're only using Phantom wallet for simplicity
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  
  // Don't render with real providers on server to prevent hydration issues
  if (!mounted) {
    return <>{children}</>;
  }
  
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

// Dynamically export the provider with no SSR to prevent hydration issues
export default dynamic(() => Promise.resolve(WalletContextProvider), { ssr: false }); 