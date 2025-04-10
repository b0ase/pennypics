import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a context for dark mode
export const ThemeContext = createContext();

function MyApp({ Component, pageProps }) {
  const [darkMode, setDarkMode] = useState(false);

  // Check for saved user preference or system preference on initial load
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      setDarkMode(savedMode === 'true');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Update localStorage when dark mode changes
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
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
        }

        body {
          background-color: var(--bg-primary);
          color: var(--text-primary);
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  return useContext(ThemeContext);
}

export default MyApp; 