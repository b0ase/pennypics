import React, { createContext, useState, useEffect, useContext } from 'react';
import WalletContextProvider from '../components/WalletConnect';

// Create a context for dark mode
export const ThemeContext = createContext();
// Create a context for image history
export const ImageHistoryContext = createContext();
// Create a context for selected image data
export const SelectedImageContext = createContext();

function MyApp({ Component, pageProps }) {
  const [darkMode, setDarkMode] = useState(undefined);
  const [imageHistory, setImageHistory] = useState([]);
  const [selectedImageData, setSelectedImageData] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Handle initial mount and hydration
  useEffect(() => {
    setMounted(true);
    // Load saved preferences after mount
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(savedMode !== null ? savedMode === 'true' : prefersDark);

    // Load image history
    try {
      const savedImageHistory = localStorage.getItem('imageHistory');
      if (savedImageHistory) {
        setImageHistory(JSON.parse(savedImageHistory));
      }
    } catch (error) {
      console.error('Error loading image history:', error);
      // Reset to empty array on error
      setImageHistory([]);
    }
  }, []);

  // Update localStorage when dark mode changes
  useEffect(() => {
    if (mounted && darkMode !== undefined) {
      localStorage.setItem('darkMode', darkMode);
      document.documentElement.classList.toggle('dark-mode', darkMode);
    }
  }, [darkMode, mounted]);

  // Update localStorage when image history changes
  useEffect(() => {
    if (mounted && imageHistory.length > 0) {
      try {
        localStorage.setItem('imageHistory', JSON.stringify(imageHistory));
      } catch (error) {
        console.error('Error saving image history:', error);
      }
    }
  }, [imageHistory, mounted]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const addToImageHistory = (imageData) => {
    setImageHistory(prev => [imageData, ...prev.slice(0, 19)]); // Keep last 20 generations
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ImageHistoryContext.Provider value={{ imageHistory, addToImageHistory }}>
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