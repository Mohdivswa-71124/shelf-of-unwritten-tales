
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add custom CSS to make the app more colorful
const style = document.createElement('style');
style.textContent = `
  :root {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    
    --primary: 280 75% 60%; /* Purple */
    --primary-foreground: 0 0% 98%;
    
    --secondary: 226 70% 55%; /* Blue */
    --secondary-foreground: 0 0% 98%;
    
    --accent: 12 80% 65%; /* Coral */
    --accent-foreground: 0 0% 98%;
    
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
  }

  /* Card gradients for book cards */
  .card-gradient-1 {
    background: linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(240,240,250,0.9));
    border-left: 4px solid rgba(var(--primary), 0.5);
  }

  .card-gradient-2 {
    background: linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(240,250,245,0.9));
    border-left: 4px solid rgba(var(--secondary), 0.5);
  }

  .card-gradient-3 {
    background: linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(250,240,250,0.9));
    border-left: 4px solid rgba(var(--accent), 0.5);
  }

  .card-gradient-4 {
    background: linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(250,245,240,0.9));
    border-left: 4px solid rgba(12, 74, 110, 0.5);
  }

  .card-gradient-5 {
    background: linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(240,250,250,0.9));
    border-left: 4px solid rgba(20, 184, 166, 0.5);
  }

  /* Category tabs styling */
  .category-tab {
    min-width: max-content;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    border: 1px solid transparent;
    transition: all 0.2s ease;
  }
  
  .category-tab[data-state="active"] {
    background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)));
    color: white;
    border-color: transparent;
  }

  /* Loading shimmer effect */
  .loading-shimmer {
    background: linear-gradient(90deg,#f0f0f0 0%,#f8f8f8 50%,#f0f0f0 100%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* Improved scrollbar */
  .no-scrollbar::-webkit-scrollbar {
    height: 4px;
  }
  .no-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(var(--primary), 0.2);
    border-radius: 4px;
  }
`;

document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
