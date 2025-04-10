import React, { useEffect, useMemo, useState } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// Simple wrapper around the WalletMultiButton with auto-connect functionality
export function WalletConnectButton() {
  const { publicKey, connecting } = useWallet();
  const { visible, setVisible } = useWalletModal();
  const [hasPrompted, setHasPrompted] = useState(false);
  
  // Show wallet modal automatically on load if not connected
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!publicKey && !connecting && !visible && !hasPrompted) {
        setVisible(true);
        setHasPrompted(true);
      }
    }, 1500); // Wait 1.5 seconds to show the prompt
    
    return () => clearTimeout(timer);
  }, [publicKey, connecting, visible, setVisible, hasPrompted]);
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      position: 'relative'
    }}>
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

// Main provider component that wraps your app with all the necessary Solana providers
const WalletContextProvider = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;
  
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  // We're only using Phantom wallet for simplicity
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
};

export default WalletContextProvider; 