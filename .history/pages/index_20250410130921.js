import React from 'react';

export default function Home() {
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
            PennyPics helps you organize and share your memories. 
            Start uploading your photos and create beautiful collections today!
          </p>
          <button style={{
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Get Started
          </button>
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