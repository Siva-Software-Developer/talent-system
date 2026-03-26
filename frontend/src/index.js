import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Intha line kandippa irukanum machi styles work aaga!

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);