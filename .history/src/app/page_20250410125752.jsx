import React from 'react';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto' 
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Welcome to PennyPics
      </h1>
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
    </div>
  );
} 