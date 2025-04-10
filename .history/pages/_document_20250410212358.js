import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Add preload script to prevent flash of white content */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Check for saved theme or use system preference
              try {
                const savedTheme = localStorage.getItem('darkMode');
                if (savedTheme === 'false') {
                  document.documentElement.classList.remove('dark-mode-init');
                } else if (savedTheme === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark-mode-init');
                }
              } catch (e) {
                // If localStorage is not available, use system preference
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark-mode-init');
                }
              }
            })();
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 