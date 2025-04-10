import './globals.css';

export const metadata = {
  title: 'PennyPics',
  description: 'Your personal photo gallery application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 