import './globals.css';

export const metadata = {
  title: 'PennyPics',
  description: 'Your personal photo gallery application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <header style={{ 
            backgroundColor: '#333', 
            color: 'white', 
            padding: '1rem',
            textAlign: 'center' 
          }}>
            <h1>PennyPics</h1>
          </header>
          
          <main style={{ flex: 1, padding: '2rem 0' }}>
            {children}
          </main>
          
          <footer style={{ 
            backgroundColor: '#333', 
            color: 'white', 
            padding: '1rem',
            textAlign: 'center',
            marginTop: 'auto'
          }}>
            <p>&copy; {new Date().getFullYear()} PennyPics</p>
          </footer>
        </div>
      </body>
    </html>
  );
} 