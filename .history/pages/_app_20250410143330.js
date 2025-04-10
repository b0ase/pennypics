import React, { createContext, useState, useEffect, useContext } from 'react';
import WalletContextProvider from '../components/WalletConnect';

// Create a context for dark mode
export const ThemeContext = createContext({
  darkMode: true,
  toggleDarkMode: () => {}
});

// Create a context for image history
export const ImageHistoryContext = createContext({
  imageHistory: [],
  addToImageHistory: () => {},
  clearImageHistory: () => {}
});

// Create a context for selected image data
export const SelectedImageContext = createContext({
  selectedImageData: null,
  setSelectedImageData: () => {}
});

// Helper function to manage localStorage safely
const safeLocalStorage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error storing ${key} in localStorage:`, error);
      return false;
    }
  },
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error retrieving ${key} from localStorage:`, error);
      return null;
    }
  }
};

function MyApp({ Component, pageProps }) {
  // Set initial state with default values
  const [darkMode, setDarkMode] = useState(true);
  const [imageHistory, setImageHistory] = useState([]);
  const [selectedImageData, setSelectedImageData] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Mark when component is mounted on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load preferences from localStorage only on the client after initial render
  useEffect(() => {
    if (isClient) {
      // Load dark mode preference
      const savedMode = safeLocalStorage.getItem('darkMode');
      if (savedMode !== null) {
        setDarkMode(savedMode === 'true');
      } else {
        // Default to dark mode, but also check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark || true); // Default to true if system preference is not dark
      }

      // Load image history from localStorage
      try {
        const savedImageHistory = safeLocalStorage.getItem('imageHistory');
        if (savedImageHistory) {
          setImageHistory(JSON.parse(savedImageHistory));
        }
      } catch (error) {
        console.error('Error parsing image history:', error);
        // If there's an error parsing, clear the corrupted data
        clearImageHistory();
      }
    }
  }, [isClient]);

  // Update localStorage when dark mode changes - only on client
  useEffect(() => {
    if (isClient) {
      safeLocalStorage.setItem('darkMode', darkMode);
      document.body.classList.toggle('dark-mode', darkMode);
    }
  }, [darkMode, isClient]);

  // Update localStorage when image history changes - only on client
  useEffect(() => {
    if (isClient && imageHistory.length > 0) {
      try {
        // Optimize storage by storing only essential data
        const compressedHistory = imageHistory.map(item => {
          // For each image generation, keep only the first image and limit data
          const { prompt, style, timestamp } = item;
          // Store only the first image to save space
          const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;
          return {
            prompt: prompt.substring(0, 100), // Limit prompt length
            style,
            timestamp,
            imageCount: item.images ? item.images.length : 0,
            thumbnail: firstImage // Store just one image as thumbnail
          };
        });
        
        // Try to store the compressed history
        const success = safeLocalStorage.setItem('imageHistory', JSON.stringify(compressedHistory));
        
        // If storage failed due to quota, reduce the history size further
        if (!success) {
          // Keep only the 5 most recent items if we hit quota issues
          const reducedHistory = compressedHistory.slice(0, 5);
          safeLocalStorage.setItem('imageHistory', JSON.stringify(reducedHistory));
        }
      } catch (error) {
        console.error('Error saving image history:', error);
      }
    }
  }, [imageHistory, isClient]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const addToImageHistory = (imageData) => {
    try {
      // Keep last 10 generations instead of 20 to save space
      setImageHistory(prev => [imageData, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Error adding to image history:', error);
    }
  };

  const clearImageHistory = () => {
    setImageHistory([]);
    if (isClient) {
      try {
        localStorage.removeItem('imageHistory');
      } catch (error) {
        console.error('Error clearing image history:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ImageHistoryContext.Provider value={{ imageHistory, addToImageHistory, clearImageHistory }}>
        <SelectedImageContext.Provider value={{ selectedImageData, setSelectedImageData }}>
          <WalletContextProvider>
            <Component {...pageProps} />

            {/* Add global styles for dark mode */}
            <style jsx global>{`
              :root {
                --bg-primary: ${darkMode ? '#121212' : '#f8f9fa'};
                --bg-secondary: ${darkMode ? '#1e1e1e' : '#ffffff'};
                --bg-tertiary: ${darkMode ? '#2d2d2d' : '#f7fafc'};
                
                --text-primary: ${darkMode ? '#e2e8f0' : '#2d3748'};
                --text-secondary: ${darkMode ? '#a0aec0' : '#4a5568'};
                
                --accent-color: ${darkMode ? '#4fd1c5' : '#38b2ac'};
                --accent-light: ${darkMode ? 'rgba(79, 209, 197, 0.1)' : '#ebf4ff'};
                --accent-dark: ${darkMode ? '#2c7a7b' : '#2b6cb0'};
                
                --border-color: ${darkMode ? '#2d3748' : '#e2e8f0'};
                --error-bg: ${darkMode ? '#742a2a' : '#fff5f5'};
                --error-text: ${darkMode ? '#feb2b2' : '#e53e3e'};
                --success-bg: ${darkMode ? '#22543d' : '#f0fff4'};
                --success-text: ${darkMode ? '#9ae6b4' : '#38a169'};

                --header-bg: ${darkMode ? 'linear-gradient(90deg, #1a202c, #2d3748)' : 'linear-gradient(90deg, #2c3e50, #4a5568)'};
                --card-shadow: ${darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)'};
                --footer-bg: ${darkMode ? '#1a202c' : '#2c3e50'};
                --footer-text: ${darkMode ? '#a0aec0' : '#cbd5e0'};
              }

              body {
                background-color: var(--bg-primary);
                color: var(--text-primary);
                transition: background-color 0.3s ease, color 0.3s ease;
                margin: 0;
                padding: 0;
              }

              @keyframes spin {
                to { transform: rotate(360deg); }
              }

              /* Override wallet adapter styles to match our theme */
              .wallet-adapter-button {
                background-color: var(--accent-color) !important;
              }
              .wallet-adapter-button:hover {
                background-color: var(--accent-dark) !important;
              }
              .wallet-adapter-modal-wrapper {
                background-color: var(--bg-secondary) !important;
                color: var(--text-primary) !important;
              }
              .wallet-adapter-modal-button-close {
                background-color: var(--bg-tertiary) !important;
              }
              .wallet-adapter-modal-title {
                color: var(--text-primary) !important;
              }
            `}</style>
          </WalletContextProvider>
        </SelectedImageContext.Provider>
      </ImageHistoryContext.Provider>
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  return useContext(ThemeContext);
}

// Custom hook to use the image history context
export function useImageHistory() {
  return useContext(ImageHistoryContext);
}

// Custom hook to use the selected image context
export function useSelectedImage() {
  return useContext(SelectedImageContext);
}

export default MyApp;