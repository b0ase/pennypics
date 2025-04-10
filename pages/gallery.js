import React, { useState, useEffect } from 'react';
import DarkModeToggle from '../components/DarkModeToggle';
import { useTheme, useImageHistory, useSelectedImage } from './_app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { WalletConnectButton } from '../components/WalletConnect';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Gallery() {
  const { darkMode } = useTheme();
  const { imageHistory, clearImageHistory } = useImageHistory();
  const { setSelectedImageData } = useSelectedImage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const wallet = useWallet();
  const [storageError, setStorageError] = useState(false);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
    
    // Check for localStorage errors
    try {
      const test = localStorage.getItem('test');
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        setStorageError(true);
      }
    }
  }, []);

  // Function to format date
  const formatDate = (dateString) => {
    if (!isMounted) return '';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to handle "Create Similar Image" button click
  const handleCreateSimilar = (imageData) => {
    setSelectedImageData(imageData);
    router.push('/');
  };

  // Handle clearing the image history
  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your image history? This cannot be undone.')) {
      clearImageHistory();
      setSelectedImage(null);
      setStorageError(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'var(--bg-primary)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      color: 'var(--text-primary)'
    }}>
      <header style={{ 
        background: 'var(--header-bg)',
        color: 'white', 
        padding: '1.5rem 0',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2rem', 
            fontWeight: '700',
            letterSpacing: '0.5px'
          }}>
            <span style={{ color: 'var(--accent-color)' }}>Penny</span>Pics
          </h1>
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            alignItems: 'center'
          }}>
            <DarkModeToggle />
            <Link href="/" style={{ 
              color: 'white', 
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              transition: 'background 0.3s'
            }}>Home</Link>
            <Link href="/gallery" style={{ 
              color: 'white', 
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.1)',
              transition: 'background 0.3s'
            }}>Gallery</Link>
            <Link href="/about" style={{ 
              color: 'white', 
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              transition: 'background 0.3s'
            }}>About</Link>
            <WalletConnectButton />
          </div>
        </div>
      </header>
      
      <main style={{ 
        flex: 1, 
        padding: '3rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Storage error notification */}
        {storageError && (
          <div style={{
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error-text)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            animation: 'fadeIn 0.5s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <svg style={{ width: '2rem', height: '2rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  Storage Quota Exceeded
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Your browser's storage is full. Clear your image history to fix this issue.
                </p>
              </div>
            </div>
            <button
              onClick={handleClearHistory}
              style={{
                backgroundColor: 'var(--error-text)',
                color: 'var(--error-bg)',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer',
                flexShrink: 0,
                fontSize: '0.9rem'
              }}
            >
              Clear History
            </button>
          </div>
        )}
      
        {/* Wallet connection notification banner */}
        {!wallet.publicKey && (
          <div style={{
            backgroundColor: '#e53e3e',
            color: 'white',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            animation: 'fadeIn 0.5s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <svg style={{ width: '2rem', height: '2rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V8m-3 5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  Wallet Connection Required
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Please connect your Phantom wallet to view your gallery and generate new images.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const walletButton = document.querySelector('.wallet-adapter-button');
                if (walletButton) walletButton.click();
              }}
              style={{
                backgroundColor: 'white',
                color: '#e53e3e',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer',
                flexShrink: 0,
                fontSize: '0.9rem'
              }}
            >
              Connect Now
            </button>
          </div>
        )}

        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '1rem'
          }}>
            Image Gallery
          </h2>
          <p style={{
            fontSize: '1.1rem',
            maxWidth: '700px',
            margin: '0 auto',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            Browse through your collection of AI-generated images created with PennyPics.
          </p>
          
          {imageHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              style={{
                marginTop: '1rem',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: `1px solid var(--border-color)`,
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Clear History
            </button>
          )}
        </div>
        
        {imageHistory.length === 0 ? (
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            padding: '2.5rem', 
            borderRadius: '12px',
            boxShadow: 'var(--card-shadow)',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '1.2rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.6'
            }}>
              No images yet!
            </p>
            <p style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              marginTop: '1rem'
            }}>
              Generate some amazing images to see them in your gallery.
            </p>
            <Link href="/" style={{
              display: 'inline-block',
              marginTop: '2rem',
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              padding: '0.9rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 4px 6px rgba(56, 178, 172, 0.3)',
            }}>
              Create Images
            </Link>
          </div>
        ) : (
          <>
            {/* Selected image display */}
            {selectedImage && (
              <div style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                padding: '2rem', 
                borderRadius: '12px',
                boxShadow: 'var(--card-shadow)',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '1.5rem', 
                    fontWeight: '700',
                    color: 'var(--text-primary)'
                  }}>
                    Selected Image
                  </h3>
                  <button
                    onClick={() => setSelectedImage(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.5rem',
                      borderRadius: '50%',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <div style={{ 
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Prompt:</strong> 
                    <span style={{ color: 'var(--text-secondary)' }}> {selectedImage.prompt}</span>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Style:</strong> 
                    <span style={{ color: 'var(--text-secondary)' }}> {selectedImage.style}</span>
                  </div>
                  {selectedImage.width && selectedImage.height && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Dimensions:</strong> 
                      <span style={{ color: 'var(--text-secondary)' }}> {selectedImage.width}×{selectedImage.height}px</span>
                    </div>
                  )}
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Created:</strong> 
                    <span style={{ color: 'var(--text-secondary)' }}> {formatDate(selectedImage.timestamp)}</span>
                  </div>
                </div>

                {/* Display thumbnail and/or full images if available */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}>
                  {/* Display the available image - either thumbnail or first image in array */}
                  {(selectedImage.images && selectedImage.images.length > 0) && (
                    <div 
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: 'var(--card-shadow)',
                        maxWidth: '500px'
                      }}
                    >
                      <img 
                        src={selectedImage.images && selectedImage.images.length > 0 ? selectedImage.images[0] : selectedImage.thumbnail}
                        alt={selectedImage.prompt}
                        style={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: '8px',
                          boxShadow: 'var(--card-shadow)'
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.png'; // Add a placeholder image
                        }}
                      />
                      <div style={{ 
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'center' 
                      }}>
                        <a 
                          href={selectedImage.images && selectedImage.images.length > 0 ? selectedImage.images[0] : selectedImage.thumbnail}
                          download={`pennypics-${new Date(selectedImage.timestamp).getTime()}.png`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: 'var(--accent-color)',
                            color: 'white',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: '500',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => handleCreateSimilar(selectedImage)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: 'var(--accent-color)',
                      color: 'white',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      border: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 6px rgba(56, 178, 172, 0.3)'
                    }}
                  >
                    <svg style={{ width: '1.2rem', height: '1.2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Similar Image
                  </button>
                </div>
              </div>
            )}

            {/* Gallery grid */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {imageHistory.map((item, index) => (
                <div 
                  key={index}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: 'var(--card-shadow)',
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    ':hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={() => setSelectedImage(item)}
                >
                  <div style={{ 
                    aspectRatio: '1',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={item.images && item.images.length > 0 ? item.images[0] : item.thumbnail}
                      alt={item.prompt}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        transition: 'transform 0.2s',
                        cursor: 'pointer',
                        boxShadow: 'var(--card-shadow)'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.png'; // Add a placeholder image
                      }}
                    />
                    {item.imageCount > 1 && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {item.imageCount} images
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <p style={{ 
                      margin: '0 0 0.5rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.prompt.length > 40 ? item.prompt.substring(0, 40) + '...' : item.prompt}
                    </p>
                    <p style={{ 
                      margin: 0,
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {formatDate(item.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      
      <footer style={{
        padding: '2rem 1rem',
        backgroundColor: 'var(--footer-bg)',
        color: 'var(--footer-text)',
        textAlign: 'center',
        fontSize: '0.9rem'
      }}>
        <p style={{ margin: '0' }}>© {new Date().getFullYear()} PennyPics. All rights reserved.</p>
      </footer>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 