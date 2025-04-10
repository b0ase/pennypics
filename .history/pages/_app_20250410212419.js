import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import WalletContextProvider from '../components/WalletConnect';
import '../styles/globals.css';

// Create a context for dark mode
export const ThemeContext = createContext();
// Create a context for payment history
export const PaymentContext = createContext();

function MyApp({ Component, pageProps }) {
  const [darkMode, setDarkMode] = useState(true);
  const [payments, setPayments] = useState([]);
  const [isDOMReady, setIsDOMReady] = useState(false);
  const router = useRouter();

  // Add class to body to prevent flash of white background
  useEffect(() => {
    // Set dark mode preference as soon as possible
    document.documentElement.classList.add('dark-mode-init');
    
    // Check if dark mode preference exists in localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode !== null) {
          // Apply saved preference
          if (savedMode === 'false') {
            document.documentElement.classList.remove('dark-mode-init');
            setDarkMode(false);
          } else {
            setDarkMode(true);
          }
        } else {
          // Use system preference as fallback
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setDarkMode(prefersDark || true);
        }
      } catch (e) {
        console.error('Error accessing localStorage:', e);
      }
      
      // Also try to load payment history
      try {
        const paymentHistory = localStorage.getItem('paymentHistory');
        if (paymentHistory) {
          setPayments(JSON.parse(paymentHistory));
        }
      } catch (e) {
        console.error('Error parsing payment history:', e);
      }
      
      setIsDOMReady(true);
    }
  }, []);
  
  // Sync darkMode state with localStorage and apply/remove class
  useEffect(() => {
    if (isDOMReady) {
      localStorage.setItem('darkMode', darkMode);
      
      if (darkMode) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
        document.documentElement.classList.remove('dark-mode-init');
      }
    }
  }, [darkMode, isDOMReady]);
  
  // Sync payments state with localStorage
  useEffect(() => {
    if (isDOMReady && payments.length > 0) {
      localStorage.setItem('paymentHistory', JSON.stringify(payments));
    }
  }, [payments, isDOMReady]);
  
  // Check for gallery page parameters
  useEffect(() => {
    if (isDOMReady && window.location.pathname === '/' && Object.keys(window.location.search).length > 0) {
      // Parse query parameters
      const params = new URLSearchParams(window.location.search);
      
      // Store parameters in sessionStorage
      if (params.get('prompt')) sessionStorage.setItem('pendingPrompt', params.get('prompt'));
      if (params.get('style')) sessionStorage.setItem('pendingStyle', params.get('style'));
      if (params.get('width')) sessionStorage.setItem('pendingWidth', params.get('width'));
      if (params.get('height')) sessionStorage.setItem('pendingHeight', params.get('height'));
      
      // Clean URL
      window.history.replaceState({}, document.title, '/');
    }
  }, [isDOMReady]);

  // Handle URL query parameters coming from gallery
  useEffect(() => {
    if (!isDOMReady) return;

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
  }, [router.pathname, router.query, isDOMReady]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const addPayment = (paymentData) => {
    setPayments(prev => [paymentData, ...prev.slice(0, 49)]); // Keep last 50 payments
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <PaymentContext.Provider value={{ payments, addPayment }}>
        <WalletContextProvider>
          <Component {...pageProps} />

          {/* Add global styles for dark mode */}
          <style jsx global>{`
            /* Prevent flash of white screen during initial load */
            .dark-mode-init {
              background-color: #121212;
              color: #e2e8f0;
            }
            
            html, body {
              transition: background-color 0.3s ease, color 0.3s ease;
            }
            
            /* Other global styles */
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
      </PaymentContext.Provider>
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  return useContext(ThemeContext);
}

// Custom hook to use the payment context
export function usePayment() {
  return useContext(PaymentContext);
}

export default MyApp; 