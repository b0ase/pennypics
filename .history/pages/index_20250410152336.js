import React, { useState, useEffect } from 'react';
import DarkModeToggle from '../components/DarkModeToggle';
import { useTheme, useImageHistory, useSelectedImage } from './_app';
import Link from 'next/link';
import { WalletConnectButton } from '../components/WalletConnect';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  payForImageGeneration, 
  checkBalance, 
  IMAGE_COST, 
  formatSol, 
  verifyRecipientAddress,
  getTransactionExplorerLink
} from '../services/solanaService';
import dynamic from 'next/dynamic';

// Import the RPC selector dynamically
const SolanaRpcSelector = dynamic(() => import('../components/SolanaRpcSelector'), { ssr: false });

// Available style presets for the generator
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

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [prompt, setPrompt] = useState('a beautiful landscape with mountains and water');
  const [style, setStyle] = useState('photographic');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [samples, setSamples] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hasEnoughBalance, setHasEnoughBalance] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [transactionLink, setTransactionLink] = useState(null);
  const { darkMode } = useTheme();
  const { imageHistory, addToImageHistory } = useImageHistory();
  const { selectedImageData, setSelectedImageData } = useSelectedImage();
  const wallet = useWallet();
  const { connection } = useConnection();
  const [recipientAddressInfo, setRecipientAddressInfo] = useState(null);
  const [hadNetworkIssues, setHadNetworkIssues] = useState(false);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);

    // Verify recipient address in development mode
    if (process.env.NODE_ENV === 'development') {
      const addressInfo = verifyRecipientAddress();
      setRecipientAddressInfo(addressInfo);
    }
  }, []);

  // Apply selected image data when component loads
  useEffect(() => {
    if (!isMounted) return;
    
    if (selectedImageData) {
      setPrompt(selectedImageData.prompt);
      setStyle(selectedImageData.style);
      setWidth(selectedImageData.width);
      setHeight(selectedImageData.height);
      
      // Clear the selected image data after applying it
      setSelectedImageData(null);
    }
  }, [selectedImageData, setSelectedImageData, isMounted]);

  // Check wallet balance when wallet changes
  useEffect(() => {
    if (!isMounted) return;
    
    const checkUserBalance = async () => {
      if (wallet && wallet.publicKey) {
        try {
          // Actually check the balance and don't assume it's sufficient
          const hasBalance = await checkBalance(wallet, connection);
          setHasEnoughBalance(hasBalance);
          
          if (!hasBalance) {
            setError(`Insufficient balance. You need at least ${formatSol(IMAGE_COST)} to generate an image.`);
          } else {
            // Clear any previous insufficient balance error
            if (error && error.includes("Insufficient balance")) {
              setError(null);
            }
          }
        } catch (balanceError) {
          console.error("Error checking balance:", balanceError);
          setHasEnoughBalance(false);
          setError(`Failed to check balance: ${balanceError.message}`);
        }
      } else {
        setHasEnoughBalance(false);
      }
    };

    checkUserBalance();
  }, [wallet, wallet.publicKey, connection, isMounted, error]);

  const handlePaymentAndGenerate = async () => {
    // Clear any previous errors or success messages
    setError(null);
    setSuccess(null);
    setIsProcessingPayment(true);
    setHadNetworkIssues(false);
    
    // Add a timeout to prevent UI from getting stuck
    const paymentTimeout = setTimeout(() => {
      console.log("Payment processing timeout reached");
      if (isProcessingPayment) {
        // This is a fallback to prevent the UI from being stuck
        setIsProcessingPayment(false);
        setError("Payment processing timed out. Please try again.");
      }
    }, 15000); // 15 second timeout
    
    try {
      if (!wallet.publicKey) {
        clearTimeout(paymentTimeout);
        throw new Error('Please connect your wallet first');
      }

      // For development/testing - allow skipping payment only if explicitly configured
      if (process.env.NEXT_PUBLIC_SKIP_PAYMENT === 'true') {
        console.log("SKIP_PAYMENT enabled: skipping payment");
        clearTimeout(paymentTimeout);
        setSuccess(`Payment processed. Starting image generation...`);
        await generateImage();
        return;
      }

      console.log("Connected wallet:", wallet.publicKey.toString());
      console.log("Connection object available:", !!connection);

      // Process the payment
      console.log("Processing payment...");
      try {
        const paymentResult = await payForImageGeneration(wallet, connection);
        console.log("Payment result:", paymentResult);
        
        clearTimeout(paymentTimeout);
        
        // Get explorer link for the transaction
        const explorerLink = getTransactionExplorerLink(paymentResult.signature);
        setTransactionLink(explorerLink);
        
        // Show success message with signature details 
        setSuccess(`Payment of ${formatSol(IMAGE_COST)} sent successfully. Starting image generation...`);
        
        // Now generate the image
        await generateImage();
      } catch (paymentError) {
        clearTimeout(paymentTimeout);
        console.error("Payment error:", paymentError);
        
        // Payment failed - do NOT proceed with generation
        setHadNetworkIssues(true);
        throw new Error(paymentError.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      clearTimeout(paymentTimeout);
      console.error("Payment processing error:", err);
      setError(err.message || "An unknown error occurred");
    } finally {
      clearTimeout(paymentTimeout);
      setIsProcessingPayment(false);
    }
  };

  const generateImage = async () => {
    setLoading(true);
    setError(null);
    
    // Add a timeout to prevent UI from getting stuck
    const generationTimeout = setTimeout(() => {
      console.log("Image generation timeout reached");
      if (loading) {
        setLoading(false);
        setError("Image generation took too long. Please try again.");
      }
    }, 30000); // 30 second timeout
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt, 
          style,
          width,
          height,
          samples
        }),
      });
      
      clearTimeout(generationTimeout);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to generate image');
      }
      
      const data = await response.json();
      const newImages = data.images.map(imageBase64 => `data:image/png;base64,${imageBase64}`);
      setGeneratedImages(newImages);
      setActiveImageIndex(0);
      
      // Add to history using the context
      try {
        addToImageHistory({
          prompt,
          style,
          width,
          height,
          timestamp: new Date().toISOString(),
          images: newImages
        });
      } catch (error) {
        console.error('Error saving to image history:', error);
        // Don't show an error to the user since the image generation worked
      }
      
    } catch (err) {
      clearTimeout(generationTimeout);
      console.error('Error generating image:', err);
      setError(err.message || "Failed to generate image");
    } finally {
      clearTimeout(generationTimeout);
      setLoading(false);
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
          {/* Hidden PennyPics title */}
          <div style={{ 
            height: '2rem',
            visibility: 'hidden'
          }}>
            <span>PennyPics</span>
          </div>
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
              background: 'rgba(255,255,255,0.1)',
              transition: 'background 0.3s'
            }}>Home</Link>
            <Link href="/gallery" style={{ 
              color: 'white', 
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
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
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Environment banners - all hidden */}
        
        {/* Wallet connection notification banner - kept for UX */}
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
                  Connect Wallet to Generate
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Connect your Phantom wallet to generate AI images
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                // Find the wallet button in the DOM and click it
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
            Transform Your Ideas Into Art
          </h2>
          <p style={{
            fontSize: '1.1rem',
            maxWidth: '700px',
            margin: '0 auto',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            Use the power of AI to create stunning images from your text descriptions.
            Just type what you want to see, and watch the magic happen!
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          padding: '2.5rem', 
          borderRadius: '12px',
          boxShadow: 'var(--card-shadow)',
          marginBottom: '2rem'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <label 
              htmlFor="prompt" 
              style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '1.1rem'
              }}
            >
              Describe the image you want to create:
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid var(--border-color)`,
                backgroundColor: darkMode ? '#2d3748' : 'white',
                color: 'var(--text-primary)',
                minHeight: '120px',
                fontFamily: 'inherit',
                fontSize: '1rem',
                transition: 'border-color 0.3s',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
              }}
              placeholder="Example: A futuristic cityscape with flying cars and neon lights"
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '1.1rem'
              }}
            >
              Choose an art style:
            </label>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem', 
              justifyContent: 'center' 
            }}>
              {STYLE_OPTIONS.map(styleOption => (
                <button
                  key={styleOption.id}
                  type="button"
                  onClick={() => setStyle(styleOption.id)}
                  style={{
                    padding: '0.6rem 1rem',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: style === styleOption.id ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                    color: style === styleOption.id ? 'white' : 'var(--text-secondary)',
                    fontWeight: style === styleOption.id ? '600' : '500',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: style === styleOption.id 
                      ? '0 4px 6px rgba(56, 178, 172, 0.3)' 
                      : '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                  title={styleOption.description}
                >
                  {styleOption.name}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ 
            marginBottom: '1.5rem', 
            display: 'flex', 
            justifyContent: 'center' 
          }}>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
            >
              <span style={{ marginRight: '0.5rem' }}>
                {showAdvanced ? '▼' : '►'} Advanced Options
              </span>
            </button>
          </div>
          
          {showAdvanced && (
            <div style={{ 
              marginBottom: '2rem',
              padding: '1.5rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '8px',
              border: `1px solid var(--border-color)`,
            }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600',
                marginTop: 0,
                marginBottom: '1rem',
                color: 'var(--text-primary)',
              }}>
                Advanced Settings
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1.5rem',
              }}>
                {/* Image dimensions */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem'
                    }}
                  >
                    Width (px)
                  </label>
                  <select
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value={512}>512px</option>
                    <option value={768}>768px</option>
                    <option value={1024}>1024px</option>
                    <option value={1280}>1280px</option>
                    <option value={1536}>1536px</option>
                  </select>
                </div>
                
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem'
                    }}
                  >
                    Height (px)
                  </label>
                  <select
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value={512}>512px</option>
                    <option value={768}>768px</option>
                    <option value={1024}>1024px</option>
                    <option value={1280}>1280px</option>
                    <option value={1536}>1536px</option>
                  </select>
                </div>
                
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem'
                    }}
                  >
                    Number of images
                  </label>
                  <select
                    value={samples}
                    onChange={(e) => setSamples(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value={1}>1 image</option>
                    <option value={2}>2 images</option>
                    <option value={3}>3 images</option>
                    <option value={4}>4 images</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={handlePaymentAndGenerate}
              disabled={loading || isProcessingPayment || !prompt.trim() || !hasEnoughBalance}
              style={{
                backgroundColor: (loading || isProcessingPayment || !prompt.trim() || !hasEnoughBalance) 
                  ? 'var(--text-secondary)' 
                  : 'var(--accent-color)',
                color: 'white',
                border: 'none',
                padding: '0.9rem 2rem',
                borderRadius: '8px',
                cursor: (loading || isProcessingPayment || !prompt.trim() || !hasEnoughBalance) 
                  ? 'not-allowed' 
                  : 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(56, 178, 172, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading || isProcessingPayment ? (
                <>
                  <span className="spinner" style={{
                    display: 'inline-block',
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  {isProcessingPayment ? 'Processing Payment...' : 'Generating...'}
                </>
              ) : (
                <>
                  <svg style={{ width: '1.2rem', height: '1.2rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {wallet.publicKey ? `Generate Image` : 'Connect Wallet to Generate'}
                </>
              )}
            </button>
            
            {/* Payment info displayed in a subtle way beneath the button */}
            <p style={{ 
              fontSize: '0.8rem', 
              color: 'var(--text-secondary)',
              margin: '0.75rem 0 0',
              opacity: 0.8
            }}>
              Each generation costs {formatSol(IMAGE_COST)} SOL
            </p>
            
            {/* Only show the network selector if we've had network issues or there's a connection-related error */}
            {wallet.publicKey && hadNetworkIssues && (
              <div style={{ 
                marginTop: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--text-secondary)',
                  margin: 0
                }}>
                  Having connection issues? Try a different network:
                </p>
                <SolanaRpcSelector onRpcChange={() => setHadNetworkIssues(false)} />
              </div>
            )}
            
            {!wallet.publicKey && (
              <p style={{ 
                marginTop: '0.75rem', 
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                Please connect your wallet using the button in the top-right corner
              </p>
            )}
            {wallet.publicKey && (
              <div style={{ 
                marginTop: '0.75rem', 
                fontSize: '0.9rem',
                color: 'var(--success-text)',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Ready
              </div>
            )}
          </div>
        </div>
          
        {/* Success message */}
        {success && (
          <div style={{ 
            marginTop: '1.5rem', 
            color: 'var(--success-text)', 
            padding: '1rem',
            backgroundColor: 'var(--success-bg)',
            borderRadius: '8px',
            border: darkMode ? '1px solid #22543d' : '1px solid #9ae6b4',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <svg style={{ width: '1.5rem', height: '1.5rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>{success}</div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div style={{ 
            marginTop: '1.5rem', 
            color: 'var(--error-text)', 
            padding: '1rem',
            backgroundColor: 'var(--error-bg)',
            borderRadius: '8px',
            border: darkMode ? '1px solid #742a2a' : '1px solid #feb2b2',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <svg style={{ width: '1.5rem', height: '1.5rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>{error}</div>
          </div>
        )}
        
        {generatedImages.length > 0 && !error && (
          <div style={{ 
            marginTop: '2.5rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow)',
          }}>
            <div style={{ 
              borderBottom: '1px solid var(--border-color)',
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.25rem', 
                fontWeight: '700', 
                color: 'var(--text-primary)' 
              }}>
                Your Generated Image
              </h3>
              <a 
                href={generatedImages[activeImageIndex]}
                download={`pennypics-${new Date().getTime()}.png`}
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
            <div style={{ padding: '1.5rem' }}>
              <div style={{ 
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1rem'
              }}>
                <p style={{ 
                  margin: 0, 
                  color: 'var(--text-primary)', 
                  fontSize: '0.9rem',
                  fontStyle: 'italic' 
                }}>
                  <strong>Prompt:</strong> {prompt}
                </p>
              </div>
              
              {generatedImages.length > 1 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    {generatedImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '6px',
                          border: index === activeImageIndex ? '2px solid var(--accent-color)' : '2px solid transparent',
                          padding: '2px',
                          backgroundColor: 'var(--bg-tertiary)',
                          cursor: 'pointer',
                          overflow: 'hidden',
                        }}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${index + 1}`} 
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
                </div>
              )}
              
              <div style={{ 
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}>
                <img 
                  src={generatedImages[activeImageIndex]} 
                  alt="AI Generated" 
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    display: 'block'
                  }} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Image history section */}
        {imageHistory.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Recent Generations
            </h3>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {imageHistory.map((item, historyIndex) => (
                <div 
                  key={historyIndex}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: 'var(--card-shadow)',
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    ':hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={() => {
                    setPrompt(item.prompt);
                    setStyle(item.style);
                    if (item.width) setWidth(item.width);
                    if (item.height) setHeight(item.height);
                    // Check if we have an images array or a thumbnail
                    if (item.images && item.images.length > 0) {
                      setGeneratedImages(item.images);
                    } else if (item.thumbnail) {
                      setGeneratedImages([item.thumbnail]);
                    } else {
                      // Fallback to prevent errors
                      setGeneratedImages([]);
                    }
                    setActiveImageIndex(0);
                  }}
                >
                  <div style={{ 
                    aspectRatio: '1 / 1',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={item.thumbnail || (item.images && item.images.length > 0 ? item.images[0] : '')}
                      alt={item.prompt}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {/* Display image count if more than 1 */}
                    {((item.imageCount && item.imageCount > 1) || (item.images && item.images.length > 1)) && (
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
                        {(item.imageCount || (item.images && item.images.length)) || 1} images
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    <p style={{ 
                      margin: 0,
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.prompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: '3rem', 
          display: 'flex', 
          justifyContent: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            maxWidth: '300px',
            textAlign: 'center',
            padding: '1.5rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            boxShadow: 'var(--card-shadow)'
          }}>
            <div style={{ 
              backgroundColor: 'var(--bg-tertiary)', 
              width: '3rem', 
              height: '3rem', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1rem' 
            }}>
              <svg style={{ width: '1.5rem', height: '1.5rem', color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontWeight: '600' }}>Multiple Styles</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Choose from various artistic styles to create the perfect image for your needs.
            </p>
          </div>
          
          <div style={{
            maxWidth: '300px',
            textAlign: 'center',
            padding: '1.5rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            boxShadow: 'var(--card-shadow)'
          }}>
            <div style={{ 
              backgroundColor: 'var(--bg-tertiary)', 
              width: '3rem', 
              height: '3rem', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1rem' 
            }}>
              <svg style={{ width: '1.5rem', height: '1.5rem', color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontWeight: '600' }}>Advanced Options</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Control image size and generate multiple versions to find your perfect result.
            </p>
          </div>
          
          <div style={{
            maxWidth: '300px',
            textAlign: 'center',
            padding: '1.5rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            boxShadow: 'var(--card-shadow)'
          }}>
            <div style={{ 
              backgroundColor: 'var(--bg-tertiary)', 
              width: '3rem', 
              height: '3rem', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1rem' 
            }}>
              <svg style={{ width: '1.5rem', height: '1.5rem', color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontWeight: '600' }}>Generation History</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Browse your recent creations and reuse your favorite generation settings.
            </p>
          </div>
        </div>
      </main>
      
      <footer style={{ 
        backgroundColor: 'var(--header-bg)', 
        color: 'var(--text-secondary)', 
        padding: '2.5rem 0',
        marginTop: '4rem'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Terms of Service</a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Contact Us</a>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '1.5rem' 
          }}>
            <a href="#" style={{ 
              color: 'white', 
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
              width: '2.5rem', 
              height: '2.5rem', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <svg style={{ width: '1.2rem', height: '1.2rem' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </a>
            <a href="#" style={{ 
              color: 'white', 
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
              width: '2.5rem', 
              height: '2.5rem', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <svg style={{ width: '1.2rem', height: '1.2rem' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.668-.069 4.948-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="#" style={{ 
              color: 'white', 
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
              width: '2.5rem', 
              height: '2.5rem', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <svg style={{ width: '1.2rem', height: '1.2rem' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
            </a>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)',
            textAlign: 'center' 
          }}>
            &copy; {new Date().getFullYear()} PennyPics. All rights reserved.<br />
            <span style={{ fontSize: '0.8rem' }}>Powered by Stability AI</span>
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 