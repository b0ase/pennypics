import React, { useState, useEffect } from 'react';
import DarkModeToggle from '../components/DarkModeToggle';
import { useTheme, useImageHistory, useSelectedImage } from './_app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { WalletConnectButton } from '../components/WalletConnect';
import { useWallet } from '@solana/wallet-adapter-react';

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
  const { imageHistory } = useImageHistory();
  const { setSelectedImageData } = useSelectedImage();
  const router = useRouter();
  const wallet = useWallet();
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [filteredImages, setFilteredImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Initialize filteredImages with imageHistory on load and when imageHistory changes
  useEffect(() => {
    setFilteredImages(imageHistory);
  }, [imageHistory]);

  // Filter and sort images when filter criteria change
  useEffect(() => {
    let result = [...imageHistory];
    
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
  }, [imageHistory, searchTerm, selectedStyle, sortOrder]);

  // Function to handle "Create Similar Image" button click
  const handleCreateSimilar = (imageData) => {
    setSelectedImageData(imageData);
    router.push('/');
  };

  // Format date for display
  const formatDate = (timestamp) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(timestamp).toLocaleDateString(undefined, options);
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
        </div>
        
        {imageHistory.length > 0 ? (
          <>
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
                    <span style={{ color: 'var(--text-secondary)' }}> 
                      {STYLE_OPTIONS.find(s => s.id === selectedImage.style)?.name || selectedImage.style}
                    </span>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Dimensions:</strong> 
                    <span style={{ color: 'var(--text-secondary)' }}> {selectedImage.width}×{selectedImage.height}px</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Created:</strong> 
                    <span style={{ color: 'var(--text-secondary)' }}> {formatDate(selectedImage.timestamp)}</span>
                  </div>
                </div>

                {/* Display all images in the selected group */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: selectedImage.images.length > 1 
                    ? 'repeat(auto-fill, minmax(300px, 1fr))' 
                    : '1fr',
                  gap: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  {selectedImage.images.map((image, index) => (
                    <div 
                      key={index}
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: 'var(--card-shadow)'
                      }}
                    >
                      <img 
                        src={image} 
                        alt={`Generated image ${index + 1} for prompt: ${selectedImage.prompt}`}
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block'
                        }}
                      />
                      <div style={{ 
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'center' 
                      }}>
                        <a 
                          href={image}
                          download={`pennypics-${new Date(selectedImage.timestamp).getTime()}-${index}.png`}
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
                  ))}
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

            {/* Gallery grid with filtered images */}
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
                    onClick={() => setSelectedImage(item)}
                  >
                    <div style={{ 
                      position: 'relative',
                      paddingBottom: '100%', // 1:1 aspect ratio
                      overflow: 'hidden'
                    }}>
                      <img 
                        src={item.images[0]} 
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
                      {item.images.length > 1 && (
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
                          {item.images.length} images
                        </div>
                      )}
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
                  No images match your search filters.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStyle('');
                    setSortOrder('newest');
                  }}
                  style={{
                    marginTop: '1.5rem',
                    backgroundColor: 'var(--accent-color)',
                    color: 'white',
                    border: 'none',
                    padding: '0.7rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </>
        ) : (
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
    </div>
  );
} 