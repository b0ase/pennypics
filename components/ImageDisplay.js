import React from 'react';

export default function ImageDisplay({ imageUrl, alt = "Generated Image" }) {
  // Super simple image component with minimal logic
  return (
    <div style={{ 
      width: '100%', 
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#f5f5f5'
    }}>
      <img 
        src={imageUrl}
        alt={alt}
        style={{ 
          width: '100%', 
          height: 'auto',
          display: 'block'
        }}
      />
    </div>
  );
} 