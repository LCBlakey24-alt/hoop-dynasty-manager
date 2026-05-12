import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { initialiseSidebarToggle } from './sidebarToggle';
import './styles/global.css';
import './styles/sharp-corners.css';
import './styles/collapsible-sidebar.css';
import './styles/landing-menu.css';
import './styles/team-profiles.css';

initialiseSidebarToggle();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
