import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';

// Create a context for dark mode
export const ThemeContext = createContext();

function MyApp({ Component, pageProps }) {
  const [darkMode, setDarkMode] = useState(true);
  const router = useRouter();

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
    }
  }, []);

  // Handle URL query parameters coming from gallery
  useEffect(() => {
    if (router.pathname === '/' && Object.keys(router.query).length > 0) {
      // We have query parameters, might be coming from gallery
      const { prompt, style, width, height } = router.query;
      
      // Store these values in sessionStorage for the home page to pick up
      if (prompt) sessionStorage.setItem('pendingPrompt', prompt);
      if (style) sessionStorage.setItem('pendingStyle', style);
      if (width) sessionStorage.setItem('pendingWidth', width);
      if (height) sessionStorage.setItem('pendingHeight', height);
      
      // Clear URL parameters without triggering a full page reload
      router.replace('/', undefined, { shallow: true });
    }
  }, [router.pathname, router.query]);

  // Update localStorage when dark mode changes
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', darkMode);
      document.body.classList.toggle('dark-mode', darkMode);
    }
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
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  return useContext(ThemeContext);
}

export default MyApp; 