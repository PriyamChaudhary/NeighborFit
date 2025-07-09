// main.jsx
// Entry point for the NeighborFit React app. Renders the App component into the root div.
import "./index.css"; // Import global styles
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Render the App component into the root element in index.html
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
