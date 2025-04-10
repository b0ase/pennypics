import React, { useState } from 'react';

export default function ImageDisplay({ imageUrl, alt = "Generated Image", width = "100%", height = "auto" }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Create fallback SVG as a data URL
  const getFallbackImage = () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
        <rect width="512" height="512" fill="#f8f8f8"/>
        <text x="256" y="200" font-family="Arial" font-size="24" text-anchor="middle" fill="#666">
          Image could not be displayed
        </text>
        <text x="256" y="240" font-family="Arial" font-size="16" text-anchor="middle" fill="#999">
          Try downloading the image instead
        </text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const handleImageError = (e) => {
    console.error("Image failed to load:", e);
    setHasError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div style={{ 
      position: 'relative',
      width: '100%', 
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          color: '#666',
          zIndex: 1
        }}>
          Loading image...
        </div>
      )}
      
      <img 
        src={hasError ? getFallbackImage() : imageUrl}
        alt={alt}
        style={{ 
          width, 
          height,
          display: 'block',
          zIndex: 2
        }}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      
      {hasError && (
        <div style={{ 
          padding: '0.5rem', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          The image could not be displayed. Try downloading it instead.
        </div>
      )}
    </div>
  );
} 