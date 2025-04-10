'use client';

import { useState } from 'react';

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
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
      gap: '2rem'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '1rem'
      }}>
        AI Image Generator
      </h1>

      <button
        onClick={generateImage}
        disabled={loading}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.2rem',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Generating...' : 'Generate Image'}
      </button>

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