import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initConfig } from './config/runtimeConfig';
import App from './App';
import './styles/global.css';
import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/700.css';
import '@fontsource/source-sans-3/400.css';
import '@fontsource/source-sans-3/500.css';
import '@fontsource/source-sans-3/600.css';
import '@fontsource/source-sans-3/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

initConfig().then(() => {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
