import React from 'react';
import Link from 'next/link';
import DarkModeToggle from './DarkModeToggle';
import { WalletConnectButton } from './WalletConnect';
import WalletBalanceDisplay from './WalletBalanceDisplay';

function Header() {
  return (
    <header style={{ 
      background: 'var(--header-bg)',
      color: 'white', 
      padding: '1.5rem 0',
      boxShadow: 'var(--card-shadow)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2rem', 
            fontWeight: '700',
            letterSpacing: '0.5px',
            cursor: 'pointer'
          }}>
            <span style={{ color: 'var(--accent-color)' }}>Penny</span>Pics
          </h1>
        </Link>
        <nav style={{ 
          display: 'flex', 
          gap: '1rem',
          alignItems: 'center'
        }}>
          <DarkModeToggle />
          <Link href="/" style={navLinkStyle}>Home</Link>
          <Link href="/gallery" style={navLinkStyle}>Gallery</Link>
          <Link href="/about" style={navLinkStyle}>About</Link>
          <Link href="/admin" style={{...navLinkStyle, color: '#ff9800'}}>Admin</Link>
          <WalletBalanceDisplay /> 
          <WalletConnectButton />
        </nav>
      </div>
    </header>
  );
}

const navLinkStyle = {
  color: 'white', 
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: '500',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  transition: 'background 0.2s',
  whiteSpace: 'nowrap'
};

// Style modification for hover effects (cannot be directly inline)
// Consider using CSS modules or a styled-components approach for hover effects
// Example (Conceptual - needs CSS setup):
// .navLink:hover {
//   background: rgba(255, 255, 255, 0.1);
// }

export default Header; 