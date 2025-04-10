import React from 'react';
import DarkModeToggle from '../components/DarkModeToggle';
import { WalletConnectButton } from '../components/WalletConnect';
import { useTheme } from './_app';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';

export default function About() {
  const { darkMode } = useTheme();
  const wallet = useWallet();

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
            Transforming your text descriptions into beautiful AI-generated images
            powered by Solana blockchain technology.
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
            <li>Powered by Solana blockchain for secure, transparent payments</li>
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
            PennyPics leverages Solana blockchain technology to provide a seamless payment experience.
            Each image generation costs just 0.001 SOL, payable through your Phantom wallet.
            This integration ensures secure transactions, lower fees, and faster processing compared to
            traditional payment methods.
          </p>
          
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
              marginRight: '1rem'
            }}>
              Try PennyPics Now
            </Link>
            
            {!wallet.publicKey && (
              <button
                onClick={() => {
                  const walletButton = document.querySelector('.wallet-adapter-button');
                  if (walletButton) walletButton.click();
                }}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#4A5568',
                  color: 'white',
                  border: 'none',
                  padding: '0.9rem 2rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 6px rgba(74, 85, 104, 0.3)',
                }}
              >
                Connect Wallet
              </button>
            )}
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
        <p style={{ margin: '0 0 0.5rem' }}>© {new Date().getFullYear()} PennyPics. All rights reserved.</p>
        <p style={{ margin: '0', fontSize: '0.8rem' }}>Powered by Solana Blockchain and Stability AI</p>
      </footer>
    </div>
  );
} 