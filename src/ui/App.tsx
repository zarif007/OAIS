import { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="app-container">
      <button className="close-button" onClick={handleClose}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 6L6 18" />
          <path d="M6 6L18 18" />
        </svg>
      </button>

      <div className="input-container">
        <input
          className="prompt-input"
          type="text"
          placeholder="Type your prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button className="send-button">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default App;
