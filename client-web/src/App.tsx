import { Route, Routes, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/settings/SettingsPage';
import LuBenefitsPage from './pages/settings/LuBenefitsPage';
import LuLocationsPage from './pages/settings/LuLocationsPage';
import LuRoleTypesPage from './pages/settings/LuRoleTypesPage';
import LuWorkModelsPage from './pages/settings/LuWorkModelsPage';
import TagsPage from './pages/settings/TagsPage';
import JobSpecCreate from './pages/JobSpecCreate';
import JobSpecView from './pages/JobSpecView';
import Contacts from './pages/Contacts';
import SourcesPage from './pages/settings/Sources';
import React, { useState, useEffect } from 'react';

function App() {
  /* State to manage the current skin theme (e.g., 'light', 'dark') */
  const [currentSkin, setCurrentSkin] = useState('light');

  // Apply the selected skin via data attribute on the top-level shell div.
  useEffect(() => {
    document.body.setAttribute('data-skin', currentSkin);
  }, [currentSkin]);

  /* Placeholder for theme switching function - this would be triggered by a UI element */
  const handleSkinChange = (skin: 'light' | 'dark' ) => {
      setCurrentSkin(skin);
  };

  return (
    // Pass the skin context/attribute to a wrapper element that encapsulates everything
    <div className="app-shell" data-skin={currentSkin}>
      {/* HEADER: SUGGESTION: This area should house a button that calls handleSkinChange() */}
      <header className="app-header">
        <div>
          <h1>JobHunter UI</h1>
          <p>Track and manage your job applications.</p>
        </div>
        <nav className="top-nav">
          <Link to="/">Home</Link>
          <Link to="/contacts">Contacts</Link>
          {/* CORRECTED: Link targets the dedicated settings index page */}
          <Link to="/settings">Settings</Link>
            {/* Skin Selector Example: A button/dropdown here */}
            <button className="wide-button" onClick={()=>handleSkinChange(currentSkin==='light'?'dark':'light')} style={{marginLeft:'auto'}}>{currentSkin==='light'? 'Dark Mode': 'Light Mode'} </button>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/job-specs/new" element={<JobSpecCreate />} />
          <Route path="/job-specs/view/:id" element={<JobSpecView />} />
          <Route path="/contacts" element={<Contacts />} />
          {/* FIX: Explicitly map /settings to SettingsPage. This ensures SettingsPage renders first when the user hits /settings */}
          <Route path="/settings" element={<SettingsPage />} />
          {/* We keep sub-routes explicit here, assuming they are designed to handle their own internal linking logic inside SettingsPage or that direct navigation is intended. */}
          <Route path="/settings/sources" element={<SourcesPage />} />
          <Route path="/settings/lu_benefits" element={<LuBenefitsPage />} />
          <Route path="/settings/lu_locations" element={<LuLocationsPage />} />
          <Route path="/settings/lu_roletypes" element={<LuRoleTypesPage />} />
          <Route path="/settings/lu_workmodels" element={<LuWorkModelsPage />} />
          <Route path="/settings/tags" element={<TagsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

