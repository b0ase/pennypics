import React, { useState, useEffect } from 'react';

const RPC_OPTIONS = [
  { id: 'helius', name: 'Helius', url: 'https://mainnet.helius-rpc.com/?api-key=15d2664c-5fa1-443f-8dba-76f3df61aae5' },
  { id: 'quicknode', name: 'QuickNode', url: 'https://green-late-wildflower.solana-mainnet.quiknode.pro/c00a7ef0fb99cee10eb9fcd38a0a0e717b341ae1/' },
  { id: 'serum', name: 'Project Serum', url: 'https://solana-api.projectserum.com' },
  { id: 'mainnet', name: 'Solana Mainnet', url: 'https://api.mainnet-beta.solana.com' },
  { id: 'genesysgo', name: 'GenesysGo', url: 'https://ssc-dao.genesysgo.net/' },
  { id: 'alchemy', name: 'Alchemy', url: 'https://solana-mainnet.g.alchemy.com/v2/demo' },
];

// This function tests if an RPC endpoint is responsive
const testRpcEndpoint = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getHealth'
      })
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.result === 'ok';
  } catch (error) {
    console.error(`RPC endpoint test failed for ${url}:`, error);
    return false;
  }
};

const SolanaRpcSelector = ({ onRpcChange }) => {
  const [mounted, setMounted] = useState(false);
  const [selectedRpc, setSelectedRpc] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [rpcStatus, setRpcStatus] = useState({});
  
  useEffect(() => {
    setMounted(true);
    
    // Get the current RPC from environment or localStorage
    const currentRpc = localStorage.getItem('solana-rpc-url') || process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    if (currentRpc) {
      // Find which option matches the current RPC
      const matchingOption = RPC_OPTIONS.find(option => currentRpc === option.url);
      if (matchingOption) {
        setSelectedRpc(matchingOption.id);
      } else {
        // If not found in our options, add it as a custom option
        setSelectedRpc('custom');
      }
    } else {
      // Default to first option if nothing is selected
      setSelectedRpc(RPC_OPTIONS[0].id);
      if (onRpcChange) {
        onRpcChange(RPC_OPTIONS[0].url);
        localStorage.setItem('solana-rpc-url', RPC_OPTIONS[0].url);
      }
    }
    
    // Test all RPC endpoints
    const testAllEndpoints = async () => {
      const results = {};
      for (const option of RPC_OPTIONS) {
        results[option.id] = await testRpcEndpoint(option.url);
      }
      setRpcStatus(results);
    };
    
    testAllEndpoints();
  }, [onRpcChange]);
  
  const handleRpcChange = async (option) => {
    // No need to test the endpoint before changing - just try it
    setSelectedRpc(option.id);
    setIsOpen(false);
    
    if (onRpcChange) {
      onRpcChange(option.url);
      
      // Store the selection in localStorage for persistence
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('solana-rpc-url', option.url);
      }
      
      // If the option is different from the current one, refresh to apply the change
      if (getCurrentRpcUrl() !== option.url) {
        window.location.reload();
      }
    }
  };
  
  if (!mounted) return null;

  // Only show when needed (in WalletConnect.js)
  return (
    <div className="network-selector" 
      style={{
        position: 'relative',
        zIndex: 100,
        marginBottom: '0.75rem'
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-color)',
          padding: '0.35rem 0.5rem',
          fontSize: '0.7rem',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          opacity: 0.85,
          transition: 'opacity 0.2s',
          ':hover': { opacity: 1 }
        }}
      >
        <span>Network: {RPC_OPTIONS.find(opt => opt.id === selectedRpc)?.name || 'Custom'}</span>
        <svg
          style={{ 
            width: '0.7rem', 
            height: '0.7rem',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)'
          }}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '0.5rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          width: '160px',
          boxShadow: '0 5px 10px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          zIndex: 1000
        }}>
          <div style={{ padding: '0.4rem' }}>
            <div style={{ 
              textAlign: 'center', 
              fontSize: '0.65rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.35rem',
              padding: '0 0.5rem'
            }}>
              Try another network if you're having connection issues
            </div>
            {RPC_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => handleRpcChange(option)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  backgroundColor: selectedRpc === option.id ? 'var(--accent-color)' : 'transparent',
                  color: selectedRpc === option.id ? 'white' : 'var(--text-primary)',
                  padding: '0.4rem 0.6rem',
                  border: 'none',
                  borderRadius: '2px',
                  margin: '0.1rem 0',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{option.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {rpcStatus[option.id] !== undefined && (
                    <span style={{ 
                      width: '0.4rem', 
                      height: '0.4rem', 
                      borderRadius: '50%', 
                      backgroundColor: rpcStatus[option.id] ? '#38a169' : '#e53e3e',
                      display: 'inline-block'
                    }}></span>
                  )}
                  {selectedRpc === option.id && (
                    <svg style={{ width: '0.7rem', height: '0.7rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolanaRpcSelector; 