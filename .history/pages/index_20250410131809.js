import React, { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [prompt, setPrompt] = useState('a beautiful landscape with mountains and water');

  const generateImage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to generate image');
      }
      
      const data = await response.json();
      setGeneratedImage(`data:image/png;base64,${data.image}`);
    } catch (err) {
      setError(err.message);
      console.error('Error generating image:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      <header style={{ 
        backgroundColor: '#333', 
        color: 'white', 
        padding: '1rem',
        textAlign: 'center' 
      }}>
        <h1>PennyPics</h1>
      </header>
      
      <main style={{ 
        flex: 1, 
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1rem',
            color: '#333'
          }}>
            Welcome to Your Personal Photo Gallery
          </h2>
          
          <p style={{ 
            marginBottom: '1.5rem',
            lineHeight: '1.6',
            color: '#555'
          }}>
            PennyPics helps you generate beautiful images using AI. 
            Enter a prompt below and create stunning visuals instantly!
          </p>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="prompt" 
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#333'
              }}
            >
              Image Prompt:
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                minHeight: '100px',
                fontFamily: 'inherit'
              }}
              placeholder="Describe the image you want to generate..."
            />
          </div>
          
          <button 
            onClick={generateImage}
            disabled={loading || !prompt.trim()}
            style={{
              backgroundColor: loading ? '#999' : '#333',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Generating...' : 'Generate Image'}
          </button>
          
          {error && (
            <div style={{ 
              marginTop: '1.5rem', 
              color: '#e74c3c', 
              padding: '0.75rem',
              backgroundColor: '#fde2e2',
              borderRadius: '4px'
            }}>
              Error: {error}
            </div>
          )}
          
          {generatedImage && !error && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#333' }}>
                Your Generated Image:
              </h3>
              <div style={{ 
                border: '1px solid #ddd', 
                padding: '0.5rem', 
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}>
                <img 
                  src={generatedImage} 
                  alt="AI Generated" 
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    borderRadius: '2px',
                    display: 'block'
                  }} 
                />
              </div>
              <div style={{ 
                marginTop: '1rem',
                textAlign: 'center'
              }}>
                <a 
                  href={generatedImage}
                  download="pennypics-generated.png"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                >
                  Download Image
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer style={{ 
        backgroundColor: '#333', 
        color: 'white', 
        padding: '1rem',
        textAlign: 'center',
        marginTop: '2rem'
      }}>
        <p>&copy; {new Date().getFullYear()} PennyPics</p>
      </footer>
    </div>
  );
} 