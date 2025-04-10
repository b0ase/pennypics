export default function Home() {
  return (
    <main style={{ 
      minHeight: '100vh',
      padding: '4rem 0',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <h1 style={{
        margin: '0',
        lineHeight: '1.15',
        fontSize: '4rem',
        textAlign: 'center',
      }}>
        Welcome to{' '}
        <a href="https://nextjs.org" style={{ color: '#0070f3', textDecoration: 'none' }}>
          PennyPics
        </a>
      </h1>

      <p style={{
        margin: '4rem 0',
        lineHeight: '1.5',
        fontSize: '1.5rem',
        textAlign: 'center',
      }}>
        Get started by editing{' '}
        <code style={{
          background: '#fafafa',
          borderRadius: '5px',
          padding: '0.75rem',
          fontSize: '1.1rem',
          fontFamily: 'Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, monospace',
        }}>src/app/page.tsx</code>
      </p>
    </main>
  )
} 