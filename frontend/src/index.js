import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Essential for global CSS variables!

/**
 * ==========================================
 * 🚀 DTMS CORE INITIALIZATION
 * ==========================================
 * This is the entry point of our infrastructure.
 * We use React.StrictMode to catch potential bugs early.
 */

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element ! Check your public/index.html");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    {/* Machi, App component-ai direct-ah render panrom.
        Intha infrastructure-la Theme-ai App.js switch panni handle pannum.
    */}
    <App />
  </React.StrictMode>
);

/**
 * 🛠️ PERFORMANCE MONITORING (Optional)
 * If you want to measure performance, you can add reportWebVitals here.
 */