import React, { useState, useEffect } from 'react';
import DarkModeToggle from '../components/DarkModeToggle';
import { WalletConnectButton } from '../components/WalletConnect';
import { useTheme } from './_app';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';

// Style options matching those on the home page
const STYLE_OPTIONS = [
  { id: 'photographic', name: 'Photographic', description: 'Realistic photo style' },
  { id: 'digital-art', name: 'Digital Art', description: 'Digital artwork style' },
  { id: 'anime', name: 'Anime', description: 'Japanese animation style' },
  { id: 'cinematic', name: 'Cinematic', description: 'Movie-like quality' },
  { id: 'neon-punk', name: 'Neon Punk', description: 'Cyberpunk with neon colors' },
  { id: 'pixel-art', name: 'Pixel Art', description: '8-bit style pixelated art' },
  { id: 'isometric', name: 'Isometric', description: '3D isometric view style' },
  { id: 'low-poly', name: 'Low Poly', description: 'Low polygon 3D style' },
  { id: 'line-art', name: 'Line Art', description: 'Simple line drawing style' }
];

export default function Gallery() {
  const { darkMode } = useTheme();
  const [allImages, setAllImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Wallet connection
  const wallet = useWallet();

  // Load images from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get image history from localStorage
      const imageHistory = JSON.parse(localStorage.getItem('imageHistory') || '[]');
      setAllImages(imageHistory);
      setFilteredImages(imageHistory);
    }
  }, []);

  // Filter and sort images when filter criteria change
  useEffect(() => {
    let result = [...allImages];
    
    // Apply search term filter
    if (searchTerm) {
      result = result.filter(item => 
        item.prompt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply style filter
    if (selectedStyle) {
      result = result.filter(item => item.style === selectedStyle);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else if (sortOrder === 'oldest') {
        return new Date(a.timestamp) - new Date(b.timestamp);
      }
      return 0;
    });
    
    setFilteredImages(result);
  }, [allImages, searchTerm, selectedStyle, sortOrder]);

  // Open image modal
  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  // Close image modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Format date for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
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
                  Please connect your Phantom wallet to view your generated images and create new ones.
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
              Connect Wallet
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
            Gallery
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
        </div>
        
        {/* Search and filter controls */}
        <div style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          padding: '1.5rem', 
          borderRadius: '12px',
          boxShadow: 'var(--card-shadow)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            alignItems: 'end'
          }}>
            {/* Search input */}
            <div>
              <label 
                htmlFor="search" 
                style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              >
                Search by prompt
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: darkMode ? '#2d3748' : 'white',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            
            {/* Style filter */}
            <div>
              <label 
                htmlFor="style-filter" 
                style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              >
                Filter by style
              </label>
              <select
                id="style-filter"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: darkMode ? '#2d3748' : 'white',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              >
                <option value="">All styles</option>
                {STYLE_OPTIONS.map(style => (
                  <option key={style.id} value={style.id}>
                    {style.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort order */}
            <div>
              <label 
                htmlFor="sort-order" 
                style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              >
                Sort by
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: darkMode ? '#2d3748' : 'white',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Gallery grid */}
        {filteredImages.length > 0 ? (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {filteredImages.map((item, index) => (
              <div 
                key={index}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: 'var(--card-shadow)',
                  transition: 'transform 0.2s ease',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={() => openImageModal(item)}
              >
                <div style={{ 
                  position: 'relative',
                  paddingBottom: '100%', // 1:1 aspect ratio
                  overflow: 'hidden'
                }}>
                  <img 
                    src={item.images?.[0] || '/placeholder-image.png'} 
                    alt={item.prompt}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{ 
                  padding: '1rem',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <p style={{ 
                    margin: '0 0 0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.prompt}
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <span>{STYLE_OPTIONS.find(s => s.id === item.style)?.name || item.style}</span>
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            padding: '3rem', 
            borderRadius: '12px',
            boxShadow: 'var(--card-shadow)',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            {allImages.length === 0 ? (
              <>
                <p style={{
                  fontSize: '1.2rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1.5rem'
                }}>
                  No images in your gallery yet
                </p>
                <p style={{
                  fontSize: '1rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '2rem'
                }}>
                  Create your first AI-generated image to start building your collection!
                </p>
                <Link href="/" style={{
                  display: 'inline-block',
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
              </>
            ) : (
              <p style={{
                fontSize: '1.2rem',
                color: 'var(--text-secondary)'
              }}>
                No images match your search filters
              </p>
            )}
          </div>
        )}
      </main>
      
      {/* Modal for viewing selected image */}
      {selectedImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }} onClick={closeImageModal}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            overflow: 'hidden',
            maxWidth: '90%',
            maxHeight: '90%',
            width: '900px',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.2rem', 
                fontWeight: '600',
                color: 'var(--text-primary)' 
              }}>Image Details</h3>
              <button 
                onClick={closeImageModal}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%'
                }}
              >×</button>
            </div>
            
            {/* Modal content */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              height: '100%'
            }}>
              {/* Image container */}
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                {/* Image carousel if multiple images */}
                {selectedImage.images?.length > 1 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    width: '100%',
                    maxWidth: '800px'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}>
                      {selectedImage.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            // Create a new selected image with this image as the first one
                            setSelectedImage({
                              ...selectedImage,
                              images: [
                                img,
                                ...selectedImage.images.filter((_, i) => i !== idx)
                              ]
                            });
                          }}
                          style={{
                            width: '40px',
                            height: '40px',
                            padding: '2px',
                            border: img === selectedImage.images[0] ? '2px solid var(--accent-color)' : '2px solid transparent',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-tertiary)',
                            cursor: 'pointer'
                          }}
                        >
                          <img 
                            src={img} 
                            alt={`Variation ${idx + 1}`} 
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }} 
                          />
                        </button>
                      ))}
                    </div>
                    <img 
                      src={selectedImage.images[0]} 
                      alt={selectedImage.prompt}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '600px',
                        objectFit: 'contain',
                        borderRadius: '8px'
                      }} 
                    />
                  </div>
                ) : (
                  <img 
                    src={selectedImage.images?.[0]}
                    alt={selectedImage.prompt}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '600px',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }} 
                  />
                )}
                
                {/* Image metadata */}
                <div style={{
                  width: '100%',
                  maxWidth: '800px',
                  marginTop: '1.5rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '1.5rem',
                  borderRadius: '8px'
                }}>
                  <h4 style={{
                    margin: '0 0 1rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}>Prompt</h4>
                  <p style={{
                    margin: '0 0 1.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    lineHeight: '1.6'
                  }}>{selectedImage.prompt}</p>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    fontSize: '0.9rem'
                  }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Style:</strong>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                        {STYLE_OPTIONS.find(s => s.id === selectedImage.style)?.name || selectedImage.style}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Dimensions:</strong>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                        {selectedImage.width} × {selectedImage.height}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Generated:</strong>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                        {formatDate(selectedImage.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal footer with actions */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Link href={{
                pathname: "/",
                query: { 
                  prompt: selectedImage.prompt,
                  style: selectedImage.style,
                  width: selectedImage.width,
                  height: selectedImage.height
                }
              }} style={{
                color: 'var(--accent-color)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Recreate with same settings
              </Link>
              <a 
                href={selectedImage.images?.[0]}
                download={`pennypics-${new Date(selectedImage.timestamp).getTime()}.png`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--accent-color)',
                  color: 'white',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '0.9rem'
                }}
              >
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Image
              </a>
            </div>
          </div>
        </div>
      )}
      
      <footer style={{
        padding: '2rem 1rem',
        backgroundColor: 'var(--footer-bg)',
        color: 'var(--footer-text)',
        textAlign: 'center',
        fontSize: '0.9rem'
      }}>
        <p style={{ margin: '0' }}>© {new Date().getFullYear()} PennyPics. All rights reserved.</p>
      </footer>
    </div>
  );
} 