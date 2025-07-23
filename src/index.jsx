import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { AchievementProvider } from './context/AchievementContext.jsx';
import ErrorBoundary from './components/ErrorBoundary';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <DataProvider>
        <AchievementProvider>
          <App />
        </AchievementProvider>
      </DataProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
