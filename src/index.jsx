import React from 'react';
import './style.css'
import ReactDOM from 'react-dom/client'
import App from './App';

const root = ReactDOM.createRoot(document.querySelector('#root'))
// npm install react-router-dom
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
