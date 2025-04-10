import React from 'react';
import DarkModeToggle from '../components/DarkModeToggle';
import { useTheme } from './_app';
import Link from 'next/link';
import { WalletConnectButton } from '../components/WalletConnect';
import { IMAGE_COST, formatSol } from '../services/solanaService';

export default function About() {
  const { darkMode } = useTheme();

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
            Phantom wallet. This integration ensures transparent pricing and helps 
            maintain the service quality while keeping costs affordable.
          </p>

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