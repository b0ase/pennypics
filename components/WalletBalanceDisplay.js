import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

function WalletBalanceDisplay() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!publicKey || !connection) {
      setBalance(null);
      setError(null);
      return;
    }

    let isSubscribed = true;
    let subscriptionId = null;

    const fetchBalance = async () => {
      try {
        const currentBalance = await connection.getBalance(publicKey, 'confirmed');
        if (isSubscribed) {
          setBalance(currentBalance);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching balance:", err);
        if (isSubscribed) {
          setError("Failed to fetch balance");
          setBalance(null);
        }
      }
    };

    fetchBalance(); // Initial fetch

    // Subscribe to account changes
    try {
      subscriptionId = connection.onAccountChange(
        publicKey,
        (accountInfo) => {
          if (isSubscribed) {
            setBalance(accountInfo.lamports);
            setError(null);
          }
        },
        'confirmed'
      );
      console.log(`Subscribed to balance changes for ${publicKey.toString()}, subscriptionId: ${subscriptionId}`);
    } catch (subError) {
      console.error("Error subscribing to account changes:", subError);
      if (isSubscribed) {
        setError("Failed to subscribe to balance updates");
      }
    }

    return () => {
      isSubscribed = false;
      if (subscriptionId !== null) {
        console.log(`Unsubscribing from balance changes, subscriptionId: ${subscriptionId}`);
        connection.removeAccountChangeListener(subscriptionId)
          .catch(err => console.error("Error unsubscribing from account changes:", err));
      }
    };
  }, [publicKey, connection]);

  if (!publicKey) {
    return null; // Don't display anything if wallet is not connected
  }

  return (
    <div style={{
      color: 'white', 
      fontSize: '0.9rem',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <svg style={{ width: '1rem', height: '1rem', color: '#4fd1c5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {error ? (
        <span title={error} style={{ color: '#feb2b2' }}>Error</span>
      ) : balance !== null ? (
        <span>{(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL</span>
      ) : (
        <span>Loading...</span>
      )}
    </div>
  );
}

export default WalletBalanceDisplay; 