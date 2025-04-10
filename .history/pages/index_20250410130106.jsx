import React from 'react';

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column'
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
        padding: '2rem 0',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Your personal photo gallery
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Start uploading and organizing your memories today!
          </p>
        </div>
      </main>
      
      <footer style={{ 
        backgroundColor: '#333', 
        color: 'white', 
        padding: '1rem',
        textAlign: 'center',
        marginTop: 'auto'
      }}>
        <p>&copy; {new Date().getFullYear()} PennyPics</p>
      </footer>
    </div>
  );
} 