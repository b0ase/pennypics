import React from 'react';
import DarkModeToggle from '../components/DarkModeToggle';
import { useTheme } from './_app';
import Link from 'next/link';

export default function Gallery() {
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
            Gallery
          </h2>
          <p style={{
            fontSize: '1.1rem',
            maxWidth: '700px',
            margin: '0 auto',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            Browse through a collection of AI-generated images created with PennyPics.
          </p>
        </div>
        
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
            Coming Soon!
          </p>
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            marginTop: '1rem'
          }}>
            This feature is currently under development. Check back later to browse all generated images.
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
            Return to Image Generator
          </Link>
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