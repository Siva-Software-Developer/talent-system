import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Global Styles & Theme Variables inga thaan iruku machi!

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* Wrapping inside a div isn't usually needed, but App.js handles the layout classes */}
    <App />
  </React.StrictMode>
);