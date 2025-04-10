import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a context for dark mode
export const ThemeContext = createContext();
// Create a context for image history
export const ImageHistoryContext = createContext();
// Create a context for selected image data
export const SelectedImageContext = createContext();

function MyApp({ Component, pageProps }) {
  const [darkMode, setDarkMode] = useState(true);
  const [imageHistory, setImageHistory] = useState([]);
  const [selectedImageData, setSelectedImageData] = useState(null);

  // Check for saved user preference or system preference on initial load
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) {
        setDarkMode(savedMode === 'true');
      } else {
        // Default to dark mode, but also check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark || true); // Default to true if system preference is not dark
      }

      // Load image history from localStorage
      const savedImageHistory = localStorage.getItem('imageHistory');
      if (savedImageHistory) {
        try {
          setImageHistory(JSON.parse(savedImageHistory));
        } catch (error) {
          console.error('Error parsing image history:', error);
        }
      }
    }
  }, []);

  // Update localStorage when dark mode changes
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', darkMode);
      document.body.classList.toggle('dark-mode', darkMode);
    }
  }, [darkMode]);

  // Update localStorage when image history changes
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined' && imageHistory.length > 0) {
      localStorage.setItem('imageHistory', JSON.stringify(imageHistory));
    }
  }, [imageHistory]);

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
          `}</style>
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