import React, { useEffect, useMemo, useState } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection } from '@solana/web3.js';

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
  const [rpcHealth, setRpcHealth] = useState(true);
  
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
  
  // Helper function to test RPC endpoint health
  const testRpcEndpoint = async (url) => {
    try {
      console.log(`Testing RPC endpoint health: ${url}`);
      const testConnection = new Connection(url);
      await testConnection.getLatestBlockhash();
      return true;
    } catch (error) {
      console.error(`RPC health check failed for ${url}:`, error);
      return false;
    }
  };
  
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
  
  // Check if the RPC endpoint is healthy
  useEffect(() => {
    if (!mounted || !endpoint) return;
    
    const checkEndpointHealth = async () => {
      const isHealthy = await testRpcEndpoint(endpoint);
      setRpcHealth(isHealthy);
      
      if (!isHealthy) {
        console.warn("Current RPC endpoint is not healthy, trying fallbacks...");
        
        // Try some fallback endpoints
        const fallbackEndpoints = [
          'https://mainnet.helius-rpc.com/?api-key=15d2664c-5fa1-443f-8dba-76f3df61aae5',
          'https://solana-api.projectserum.com',
          'https://api.mainnet-beta.solana.com',
          'https://ssc-dao.genesysgo.net/'
        ];
        
        for (const fbEndpoint of fallbackEndpoints) {
          if (fbEndpoint === endpoint) continue; // Skip the current one
          
          const isWorking = await testRpcEndpoint(fbEndpoint);
          if (isWorking) {
            console.log(`Found working fallback endpoint: ${fbEndpoint}`);
            localStorage.setItem('solana-rpc-url', fbEndpoint);
            
            // Only reload if we're not already showing an error to the user
            if (!document.querySelector('[role="alert"]')) {
              window.location.reload();
            }
            break;
          }
        }
      }
    };
    
    checkEndpointHealth();
  }, [endpoint, mounted]);
  
  console.log("Solana network:", network);
  console.log("Solana endpoint:", endpoint);
  console.log("RPC health status:", rpcHealth ? "Healthy" : "Unhealthy");
  
  // We're only using Phantom wallet for simplicity
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  
  // Don't render with real providers on server to prevent hydration issues
  if (!mounted) {
    return <>{children}</>;
  }
  
  return (
    <>
      {!rpcHealth && (
        <div 
          role="alert"
          style={{
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#e53e3e',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            maxWidth: '90%'
          }}
        >
          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Solana RPC connection issue. Please try switching to another RPC provider.</span>
        </div>
      )}
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
};

// Dynamically export the provider with no SSR to prevent hydration issues
export default dynamic(() => Promise.resolve(WalletContextProvider), { ssr: false }); 