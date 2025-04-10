import React, { useState, useEffect } from 'react';

const RPC_OPTIONS = [
  { id: 'alchemy', name: 'Alchemy', url: 'https://solana-mainnet.g.alchemy.com/v2/demo' },
  { id: 'serum', name: 'Project Serum', url: 'https://solana-api.projectserum.com' },
  { id: 'quicknode', name: 'QuickNode', url: 'https://green-late-wildflower.solana-mainnet.quiknode.pro/c00a7ef0fb99cee10eb9fcd38a0a0e717b341ae1/' },
  { id: 'mainnet', name: 'Solana Mainnet', url: 'https://api.mainnet-beta.solana.com' },
];

const SolanaRpcSelector = ({ onRpcChange }) => {
  const [mounted, setMounted] = useState(false);
  const [selectedRpc, setSelectedRpc] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Get the current RPC from environment
    const currentRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    if (currentRpc) {
      // Find which option matches the current RPC
      const matchingOption = RPC_OPTIONS.find(option => currentRpc === option.url);
      if (matchingOption) {
        setSelectedRpc(matchingOption.id);
      } else {
        // If not found in our options, add it as a custom option
        setSelectedRpc('custom');
      }
    }
  }, []);
  
  const handleRpcChange = (option) => {
    setSelectedRpc(option.id);
    setIsOpen(false);
    
    if (onRpcChange) {
      onRpcChange(option.url);
      
      // Store the selection in localStorage for persistence
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('solana-rpc-url', option.url);
      }
      
      // Refresh the page to apply the new RPC
      window.location.reload();
    }
  };
  
  if (!mounted) return null;
  
  return (
    <div style={{
      position: 'relative',
      zIndex: 100
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          color: 'white',
          border: 'none',
          padding: '0.5rem 0.75rem',
          fontSize: '0.8rem',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <span>RPC: {RPC_OPTIONS.find(opt => opt.id === selectedRpc)?.name || 'Custom'}</span>
        <svg
          style={{ 
            width: '0.8rem', 
            height: '0.8rem',
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
          right: 0,
          marginTop: '0.5rem',
          backgroundColor: '#1a202c',
          border: '1px solid #2d3748',
          borderRadius: '4px',
          width: '200px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '0.5rem' }}>
            <div style={{ 
              textAlign: 'center', 
              fontSize: '0.7rem',
              color: '#a0aec0',
              marginBottom: '0.5rem'
            }}>
              Switch RPC Provider
            </div>
            {RPC_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => handleRpcChange(option)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  backgroundColor: selectedRpc === option.id ? '#2d3748' : 'transparent',
                  color: 'white',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  borderRadius: '2px',
                  margin: '0.1rem 0',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{option.name}</span>
                {selectedRpc === option.id && (
                  <svg style={{ width: '0.8rem', height: '0.8rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolanaRpcSelector; 