'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';

export default function Home() {
  const { publicKey, sendTransaction } = useWallet();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [guidanceScale, setGuidanceScale] = useState(7);
  const [resolution, setResolution] = useState('512x512');

  const handlePayment = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      const connection = new Connection(clusterApiUrl('mainnet-beta'));
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('YOUR_WALLET_ADDRESS'), // Replace with your wallet address
          lamports: 0.001 * LAMPORTS_PER_SOL, // 0.001 SOL
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);
      return true;
    } catch (err) {
      setError('Payment failed. Please try again.');
      return false;
    }
  };

  const generateImage = async () => {
    if (!prompt) {
      setError('Please enter a prompt');
      return;
    }

    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paymentSuccess = await handlePayment();
      if (!paymentSuccess) {
        return;
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          guidanceScale,
          resolution,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      const base64Image = data.artifacts[0].base64;
      setImageUrl(`data:image/png;base64,${base64Image}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          PennyPics AI Image Generator
        </h1>
        <WalletMultiButton />
      </div>

      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '600px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Prompt:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Negative Prompt (what you don't want in the image):
          </label>
          <textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="Describe what you don't want in the image..."
            style={{
              width: '100%',
              minHeight: '60px',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Guidance Scale ({guidanceScale}):
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={guidanceScale}
              onChange={(e) => setGuidanceScale(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Resolution:
            </label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '8px',
                border: '1px solid #ccc'
              }}
            >
              <option value="512x512">512x512</option>
              <option value="512x768">512x768</option>
              <option value="768x512">768x512</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateImage}
          disabled={loading || !publicKey}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading || !publicKey ? 'not-allowed' : 'pointer',
            opacity: loading || !publicKey ? 0.7 : 1,
            marginTop: '1rem'
          }}
        >
          {loading ? 'Generating...' : 'Generate Image (0.001 SOL)'}
        </button>
      </div>

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {imageUrl && (
        <div style={{
          marginTop: '2rem',
          maxWidth: '1024px',
          width: '100%'
        }}>
          <img
            src={imageUrl}
            alt="Generated AI image"
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          />
        </div>
      )}
    </main>
  );
} 