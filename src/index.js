import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { DataProvider } from './context/DataContext';
import { AchievementProvider } from './context/AchievementContext';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <DataProvider>
      <AchievementProvider>
        <App />
      </AchievementProvider>
    </DataProvider>
  </React.StrictMode>
);
