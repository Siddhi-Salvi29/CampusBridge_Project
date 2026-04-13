import React from 'react';
import ReactDOM from 'react-dom/client';
// ✨ src फोल्डर जोडा
import './src/index.css'; 
import App from './src/App.jsx'; // ✨ src फोल्डर जोडा


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);