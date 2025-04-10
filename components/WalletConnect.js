import React, { useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

export function WalletConnectButton() {
  const { publicKey } = useWallet();
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <WalletMultiButton style={{
        backgroundColor: 'var(--accent-color)',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        padding: '8px 16px',
        transition: 'all 0.2s ease'
      }} />
      
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
    </div>
  );
}

const WalletContextProvider = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;
  
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking
  // and lazy loading --
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