import React from 'react';
import Layout from './components/Layout';

function App() {
  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome to PennyPics</h2>
        <p className="text-gray-600">
          Your personal photo gallery application. Start uploading and organizing your memories today!
        </p>
      </div>
    </Layout>
  );
}

export default App; 