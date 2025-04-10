import React from 'react';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Welcome to PennyPics</h2>
        <p>
          Your personal photo gallery application. Start uploading and organizing your memories today!
        </p>
      </div>
    </Layout>
  );
} 