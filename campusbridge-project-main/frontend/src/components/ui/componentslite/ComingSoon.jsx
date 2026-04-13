import React from 'react';
import { useLocation } from 'react-router-dom';

const ComingSoon = () => {
  const { pathname } = useLocation();
  const name = pathname.replace('/', '').replace('-', ' ');
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 pt-16">
      <div className="text-center p-10">
        <h1 className="text-4xl font-bold text-gray-800 capitalize mb-3">{name || 'Page'}</h1>
        <p className="text-gray-500 text-lg">This section is coming soon. Check back later.</p>
      </div>
    </div>
  );
};

export default ComingSoon;
