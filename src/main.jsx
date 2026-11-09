import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import App from './App';
import './index.css';

/**
 * App entry point.
 * - ErrorBoundary catches runtime/chunk loading errors and provides 1-click cache reset
 * - BrowserRouter wraps all routing (react-router-dom v6)
 * - AuthProvider gives global auth state to every component
 * - Toaster shows toast notifications from any component
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
          {/* Global toast container — positioned top-right */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { fontSize: '14px' },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
