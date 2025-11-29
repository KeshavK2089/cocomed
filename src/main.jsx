import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ENGINEERING NOTE: 
// Capture the root element reference first. 
// This prevents 'Target container is not a DOM element' errors 
// which can occur in complex micro-frontend or Vercel edge deployments.
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error(
    "FATAL: Failed to find the root element. \n" +
    "Check if index.html contains <div id='root'></div>"
  );
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
