import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Entry point: This file renders the App component into the root div in index.html
console.log("main.jsx is running and rendering the React app");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
