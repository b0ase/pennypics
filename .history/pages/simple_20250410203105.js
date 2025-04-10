// This is a minimal page with no wallet connections or complex code
export default function SimplePage() {
  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h1>PennyPics - Simple Mode</h1>
      <p>This is a simplified version that bypasses wallet connections.</p>
      
      <div style={{ 
        border: '1px solid #ddd',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px',
        backgroundColor: 'white'
      }}>
        <h2>Demo Image</h2>
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1064&auto=format&fit=crop" 
          alt="Demo Image"
          style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
        />
        <p style={{ marginTop: '10px', textAlign: 'center' }}>
          Example image (static from Unsplash)
        </p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <p><b>Troubleshooting:</b> If you're seeing this page, it means your browser was having trouble with the main application.</p>
      </div>
    </div>
  );
} 