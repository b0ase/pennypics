import Head from 'next/head';

// This is a minimal page with no wallet connections or complex code
export default function SimplePage() {
  // Create a completely self-contained SVG image (no external resources)
  const svgImage = `
    <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="400" fill="#4a90e2"/>
      <circle cx="200" cy="200" r="80" fill="#ffd700"/>
      <rect x="0" y="320" width="800" height="80" fill="#3a7024"/>
      <text x="400" y="200" font-family="Arial" font-size="32" text-anchor="middle" fill="white">
        PennyPics Demo Image
      </text>
    </svg>
  `;

  // Encode the SVG for use in an img tag
  const encodedSvg = encodeURIComponent(svgImage);
  const imgSrc = `data:image/svg+xml,${encodedSvg}`;

  return (
    <>
      <Head>
        <title>PennyPics - Simple Mode</title>
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'unsafe-inline' 'self'; script-src 'self'" />
      </Head>
      
      <div style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        <h1>PennyPics - Simple Mode</h1>
        <p>This is a simplified version with no external resources.</p>
        
        <div style={{ 
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px',
          backgroundColor: 'white'
        }}>
          <h2>Demo Image</h2>
          <img 
            src={imgSrc}
            alt="Demo Image"
            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
          />
          <p style={{ marginTop: '10px', textAlign: 'center' }}>
            Example image (self-contained SVG)
          </p>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <p><b>Troubleshooting:</b> If you're seeing this page, it means your browser was having trouble with the main application.</p>
          <p><b>Recovery:</b> To completely reset the application, open your browser's developer tools (F12), go to Application → Storage → Clear Site Data.</p>
        </div>
      </div>
    </>
  );
} 