import React, { useState } from 'react';
import DarkModeToggle from '../components/DarkModeToggle';
import { useTheme } from './_app';
import Link from 'next/link';
import { WalletConnectButton } from '../components/WalletConnect';
import { IMAGE_COST, formatSol, getAddressExplorerLink } from '../services/solanaService';
import { useWallet } from '@solana/wallet-adapter-react';

export default function About() {
  const { darkMode } = useTheme();
  const wallet = useWallet();
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const explorerLink = getAddressExplorerLink();

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
              transition: 'background 0.3s'
            }}>Gallery</Link>
            <Link href="/about" style={{ 
              color: 'white', 
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.1)',
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
                  Please connect your Phantom wallet to generate images. Each generation costs {formatSol(IMAGE_COST)}.
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
            About PennyPics
          </h2>
          <p style={{
            fontSize: '1.1rem',
            maxWidth: '700px',
            margin: '0 auto',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            Transforming your text descriptions into beautiful AI-generated images.
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          padding: '2.5rem', 
          borderRadius: '12px',
          boxShadow: 'var(--card-shadow)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700',
            marginTop: 0,
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
          }}>
            What is PennyPics?
          </h3>
          
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
            marginBottom: '1.5rem'
          }}>
            PennyPics is a web application that uses advanced AI technology from Stability AI 
            to generate stunning, creative images based on your text descriptions. Whether you're 
            looking for inspiration, creating concept art, or just having fun with AI, PennyPics 
            makes it easy to bring your ideas to life.
          </p>
          
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700',
            marginTop: '2.5rem',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
          }}>
            Features
          </h3>
          
          <ul style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
            marginBottom: '1.5rem',
            paddingLeft: '1.5rem'
          }}>
            <li style={{ marginBottom: '0.75rem' }}>Generate images from text descriptions in seconds</li>
            <li style={{ marginBottom: '0.75rem' }}>Choose from multiple art styles including photographic, digital art, anime, and more</li>
            <li style={{ marginBottom: '0.75rem' }}>Customize image dimensions to suit your needs</li>
            <li style={{ marginBottom: '0.75rem' }}>Create multiple variations with a single prompt</li>
            <li style={{ marginBottom: '0.75rem' }}>Dark mode support for comfortable viewing</li>
            <li style={{ marginBottom: '0.75rem' }}>Download your generated images for use in your projects</li>
            <li>Secure payment with Solana blockchain technology</li>
          </ul>
          
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700',
            marginTop: '2.5rem',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
          }}>
            Technology
          </h3>
          
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
            marginBottom: '1.5rem'
          }}>
            PennyPics is built with Next.js, a React framework for production-grade applications.
            The image generation is powered by Stability AI's state-of-the-art models, which can
            understand and visualize complex text descriptions with remarkable accuracy.
          </p>

          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700',
            marginTop: '2.5rem',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
          }}>
            Blockchain Integration
          </h3>
          
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
            marginBottom: '1.5rem'
          }}>
            PennyPics uses Solana blockchain for secure, fast, and low-cost transactions. 
            Each image generation costs just {formatSol(IMAGE_COST)}, paid directly through your 
            Phantom wallet to our service account. This integration ensures transparent pricing and helps 
            maintain the service quality while keeping costs affordable.
          </p>

          <div style={{
            backgroundColor: 'var(--bg-tertiary)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.5rem',
              gap: '0.75rem'
            }}>
              <svg style={{ width: '1.5rem', height: '1.5rem', color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h4 style={{ 
                margin: 0,
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                Payment Information
              </h4>
            </div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              All payments are sent to our Solana account:
            </p>
            <div style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              4FNJbnrwrmRY4W5TPRCv579iypQzh69pPmH1QM5M5oqB
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
              You can verify this address on the <a 
                href="https://explorer.solana.com/address/4FNJbnrwrmRY4W5TPRCv579iypQzh69pPmH1QM5M5oqB" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: 'var(--accent-color)',
                  textDecoration: 'underline'
                }}
              >Solana blockchain explorer</a>
            </p>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-tertiary)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              gap: '1rem'
            }}>
              <svg style={{ width: '2rem', height: '2rem', color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 style={{ 
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                How It Works
              </h4>
            </div>
            <ol style={{
              margin: '0 0 0 1rem',
              padding: 0,
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>Connect your Phantom wallet using the button in the navigation bar</li>
              <li style={{ marginBottom: '0.5rem' }}>Create your perfect prompt and customize settings</li>
              <li style={{ marginBottom: '0.5rem' }}>Click the "Pay & Generate" button to initiate the transaction</li>
              <li style={{ marginBottom: '0.5rem' }}>Approve the {formatSol(IMAGE_COST)} payment in your Phantom wallet</li>
              <li>Receive your AI-generated image once the transaction is confirmed</li>
            </ol>
          </div>
          
          <div style={{ 
            marginTop: '3rem',
            textAlign: 'center'
          }}>
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
              Try PennyPics Now
            </Link>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '2.5rem',
          borderRadius: '12px',
          boxShadow: 'var(--card-shadow)',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginTop: 0,
            marginBottom: '2rem',
            color: 'var(--text-primary)',
            textAlign: 'center'
          }}>
            Frequently Asked Questions
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h4 style={{ 
                margin: '0 0 0.75rem', 
                color: 'var(--text-primary)', 
                fontSize: '1.2rem',
                fontWeight: '600' 
              }}>
                What is the Stability API error?
              </h4>
              <p style={{ 
                margin: 0, 
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>
                If you encounter an error related to the Stability API key, it means there might be an issue with the API configuration. 
                We're constantly monitoring our services to ensure everything runs smoothly. If you continue to experience this issue, 
                please contact our support team.
              </p>
            </div>
            
            <div>
              <h4 style={{ 
                margin: '0 0 0.75rem', 
                color: 'var(--text-primary)', 
                fontSize: '1.2rem',
                fontWeight: '600' 
              }}>
                Why am I seeing an "Incorrect API key provided" error?
              </h4>
              <p style={{ 
                margin: 0, 
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>
                This error occurs when our server encounters authentication issues with the Stability AI service. 
                Our team is automatically notified when these errors occur and works to resolve them quickly. 
                The most common causes are temporary API service disruptions or configuration updates. 
                Please try again later, and if the issue persists, contact our support team.
              </p>
            </div>
            
            <div>
              <h4 style={{ 
                margin: '0 0 0.75rem', 
                color: 'var(--text-primary)', 
                fontSize: '1.2rem',
                fontWeight: '600' 
              }}>
                Why am I seeing "Development mode: Payment skipped"?
              </h4>
              <p style={{ 
                margin: 0, 
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>
                This message appears when you're using PennyPics in development mode, which allows testing the 
                application without making actual Solana payments. In production, you'll be charged the standard
                fee of {formatSol(IMAGE_COST)} per image generation.
              </p>
            </div>
            
            <div>
              <h4 style={{ 
                margin: '0 0 0.75rem', 
                color: 'var(--text-primary)', 
                fontSize: '1.2rem',
                fontWeight: '600' 
              }}>
                How do I connect my wallet?
              </h4>
              <p style={{ 
                margin: 0, 
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>
                Click the "Connect Wallet" button in the top-right corner of the page. You'll need the Phantom 
                wallet browser extension installed. If you don't have it, you can download it from 
                <a 
                  href="https://phantom.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--accent-color)',
                    marginLeft: '0.25rem'
                  }}
                >
                  phantom.app
                </a>.
              </p>
            </div>
            
            <div>
              <h4 style={{ 
                margin: '0 0 0.75rem', 
                color: 'var(--text-primary)', 
                fontSize: '1.2rem',
                fontWeight: '600' 
              }}>
                How can I get a refund?
              </h4>
              <p style={{ 
                margin: 0, 
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>
                Due to the nature of blockchain transactions, refunds cannot be automatically processed. 
                However, if you experienced a technical issue where an image wasn't generated but you were charged, 
                please contact our support team with your transaction details and we'll assist you.
              </p>
            </div>
            
            <div>
              <h4 style={{ 
                margin: '0 0 0.75rem', 
                color: 'var(--text-primary)', 
                fontSize: '1.2rem',
                fontWeight: '600' 
              }}>
                Troubleshooting Payment Issues
              </h4>
              <p style={{ 
                margin: 0, 
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>
                If you're experiencing issues with Solana payments:
              </p>
              <ul style={{
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                lineHeight: '1.6',
                marginTop: '0.75rem'
              }}>
                <li>Make sure you have sufficient balance in your wallet ({formatSol(IMAGE_COST)} per image)</li>
                <li>Check that you're connected to the correct Solana network (Devnet for testing)</li>
                <li>Try disconnecting and reconnecting your wallet</li>
                <li>Clear your browser cache and reload the page</li>
                <li>If you're in development mode, check the NEXT_PUBLIC_SKIP_PAYMENT environment variable</li>
              </ul>
            </div>
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