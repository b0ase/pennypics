import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import Header from '../components/Header';
import { createPennyPicsToken } from '../services/tokenService';
import { useTheme } from './_app';

export default function Admin() {
  const { darkMode } = useTheme();
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleCreateToken = async () => {
    if (!wallet.publicKey) {
      setError('Please connect your wallet first.');
      return;
    }

    setError(null);
    setIsCreatingToken(true);

    try {
      const newTokenInfo = await createPennyPicsToken(connection, wallet);
      setTokenInfo(newTokenInfo);
      console.log('Token created:', newTokenInfo);
    } catch (err) {
      console.error('Token creation error:', err);
      setError(err.message || 'Failed to create token');
    } finally {
      setIsCreatingToken(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
    }}>
      <Header />
      
      <main style={{ 
        flex: 1, 
        padding: '3rem 2rem',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          color: 'var(--text-primary)',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          PennyPics Admin Panel
        </h2>
        
        <div style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          padding: '2rem', 
          borderRadius: '12px',
          boxShadow: 'var(--card-shadow)',
          lineHeight: '1.7'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Create PennyPics Token</h3>
          <p>
            This will create the PennyPics token (PENNY) with a supply of 1 billion tokens.
            The token will be created on the {process.env.NEXT_PUBLIC_SOLANA_NETWORK} network.
          </p>
          <p>
            <strong>Connected wallet:</strong> {wallet.publicKey ? wallet.publicKey.toString() : 'Not connected'}
          </p>

          {error && (
            <div style={{
              backgroundColor: 'var(--error-bg)',
              color: 'var(--error-text)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}

          {tokenInfo && (
            <div style={{
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success-text)',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ marginTop: 0 }}>Token Created Successfully!</h4>
              <p><strong>Token Mint:</strong> {tokenInfo.mint}</p>
              <p><strong>Your Token Account:</strong> {tokenInfo.tokenAccount}</p>
              <p><strong>Mint Signature:</strong> {tokenInfo.mintSignature}</p>
              <p><strong>Token Name:</strong> {tokenInfo.name}</p>
              <p><strong>Token Symbol:</strong> {tokenInfo.symbol}</p>
              <p><strong>Decimals:</strong> {tokenInfo.decimals}</p>
              <p>⚠️ Be sure to save this information, especially the token mint address!</p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={handleCreateToken}
              disabled={isCreatingToken || !wallet.publicKey || !!tokenInfo}
              style={{
                backgroundColor: isCreatingToken || !wallet.publicKey || !!tokenInfo
                  ? 'var(--text-secondary)'
                  : 'var(--accent-color)',
                color: 'white',
                border: 'none',
                padding: '0.9rem 2rem',
                borderRadius: '8px',
                cursor: isCreatingToken || !wallet.publicKey || !!tokenInfo
                  ? 'not-allowed'
                  : 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              {isCreatingToken ? 'Creating Token...' : tokenInfo ? 'Token Created!' : 'Create PennyPics Token'}
            </button>
          </div>
        </div>
      </main>
      
      <footer style={{
        padding: '2rem 1rem',
        backgroundColor: 'var(--footer-bg)',
        color: 'var(--footer-text)',
        textAlign: 'center',
        fontSize: '0.9rem'
      }}>
        <p style={{ margin: '0' }}>© {new Date().getFullYear()} PennyPics Admin. Restricted Access.</p>
      </footer>
    </div>
  );
} 