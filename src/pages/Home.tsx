// src/Home.tsx
import React from 'react';

const Home: React.FC = () => {

  const handleClick = () => {
    alert('Button clicked!');
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-700 mb-4">Welcome Home🏠⛪🏡</h1>
        <p className="text-gray-600 mb-6">
          This is your starting point. Edit <code>Home.tsx</code> and make it yours!
        </p>
        <p className="text-gray-600 mb-6">
          Start coding willy nilly. Enjoy a lot!
        </p>
        <p className="text-gray-600 mb-6">
          Another CI/CD attempt! One tries and tries again!
        </p>
        <button onClick={handleClick} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
          Click Me
        </button>
      </div>
    </div>


  );
};

export default Home;
