import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { AchievementProvider } from './context/AchievementContext.jsx';

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
