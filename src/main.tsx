//import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);


// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/serviceWorker.js')
//       .then(reg => console.log('Service worker registered:', reg))
//       .catch(err => console.error('Service worker registration failed:', err));
//   });
// }



root.render(
  // <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </StrictMode>
);


