import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Load Remix Icons
const remixIconsLink = document.createElement("link");
remixIconsLink.rel = "stylesheet";
remixIconsLink.href = "https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css";
document.head.appendChild(remixIconsLink);

// Load Inter & Fira Code fonts
const fontsLink = document.createElement("link");
fontsLink.rel = "stylesheet";
fontsLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap";
document.head.appendChild(fontsLink);

// Set page title
const titleElement = document.createElement("title");
titleElement.textContent = "CodeMentor AI - Personalized Coding Guidance";
document.head.appendChild(titleElement);

createRoot(document.getElementById("root")!).render(<App />);
