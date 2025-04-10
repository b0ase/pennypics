export default function RecoverPage() {
  const resetApp = () => {
    // Clear localStorage
    try {
      console.log("Clearing localStorage");
      localStorage.clear();
    } catch (e) {
      console.error("Failed to clear localStorage:", e);
    }
    
    // Redirect to test page
    window.location.href = '/test';
  };
  
  return (
    <div style={{ 
      padding: "40px", 
      maxWidth: "600px",
      margin: "0 auto",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <h1>PennyPics Recovery Page</h1>
      <p>This page can help fix browser issues with the app.</p>
      
      <div style={{
        marginTop: "30px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px"
      }}>
        <h2>Reset App Data</h2>
        <p>Click the button below to clear all app data and return to a safe state:</p>
        <button 
          onClick={resetApp}
          style={{
            padding: "10px 20px",
            background: "#e53e3e",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Reset App Data
        </button>
      </div>
      
      <div style={{ marginTop: "30px" }}>
        <h2>Manual Steps</h2>
        <p>If the button doesn't help, try these steps:</p>
        <ol>
          <li>Close your browser completely</li>
          <li>Restart your browser</li>
          <li>Go to PennyPics in a new tab</li>
          <li>If problems persist, temporarily disable the Phantom extension</li>
        </ol>
      </div>
    </div>
  );
} 