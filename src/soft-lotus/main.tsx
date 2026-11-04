import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import 'lenis/dist/lenis.css';
import './style.css';

createRoot(document.getElementById('soft-root')!).render(<App />);
