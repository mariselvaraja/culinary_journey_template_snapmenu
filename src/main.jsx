import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { 
  AuthProvider,
  ContentProvider,
  MenuProvider,
  CartProvider,
  SearchProvider,
  ReservationProvider
} from './context';
import App from './App';
import './index.css';

// Handle browser support errors early
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Failed to find the root element');

  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ContentProvider>
            <MenuProvider>
              <CartProvider>
                <SearchProvider>
                  <ReservationProvider>
                    <App />
                  </ReservationProvider>
                </SearchProvider>
              </CartProvider>
            </MenuProvider>
          </ContentProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
} catch (error) {
  console.error('Application initialization error:', error);
  document.body.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      text-align: center;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div>
        <h1 style="color: #dc2626; font-size: 24px; margin-bottom: 16px;">
          Application Error
        </h1>
        <p style="color: #4b5563; margin-bottom: 16px;">
          Sorry, something went wrong while loading the application.
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          Please try refreshing the page or contact support if the problem persists.
        </p>
      </div>
    </div>
  `;
}
