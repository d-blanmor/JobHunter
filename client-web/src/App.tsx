import { useNavigate, Route, Routes, Link } from 'react-router-dom';
import { FaAddressBook, FaCog, FaSun, FaMoon, FaHome } from 'react-icons/fa';
import { FaHouse, FaIdCard} from 'react-icons/fa6';
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
import BackupExportPage from './pages/settings/backup_export';
import BackupImportPage from './pages/settings/backup_import';
import OllamaIntegrationPage from './pages/settings/Ollama';
import { useState, useEffect } from 'react';

var isBlocked: boolean = false;

export const isDirty = () => {return isBlocked};
export const setIsDirty = (state: boolean) => {isBlocked = state};

function App() {
  const navigate = useNavigate();

/* State to manage the current skin theme (e.g., 'light', 'dark') */
  const [currentSkin, setCurrentSkin] = useState<'light' | 'dark'>(() => {
    const match = document.cookie.match(/(^|;\s*)app-skin=([^;]+)/);
    if (match && (match[2] === 'light' || match[2] === 'dark')) return match[2] as 'light' | 'dark';
    return 'light';
  });

  // Apply the selected skin via data attribute on the top-level shell div.
  // Read cookie on mount
  useEffect(() => {
    const match = document.cookie.match(/(^|;\s*)app-skin=([^;]+)/);
    if (match && (match[2] === 'light' || match[2] === 'dark'))
      setCurrentSkin(match[2] as 'light' | 'dark');
  }, []);

   // Update cookie when skin changes
  useEffect(() => {
    document.cookie = `app-skin=${currentSkin}; path=/; max-age=31536000`;
  }, [currentSkin]);

   // Apply the selected skin via data attribute on the top-level shell div.
  useEffect(() => {
    document.body.setAttribute('data-skin', currentSkin);
  }, [currentSkin]);

  /* Placeholder for theme switching function - this would be triggered by a UI element */
  const handleSkinChange = (skin: 'light' | 'dark' ) => {
    setCurrentSkin(skin);
  };

  const handleOnClick = (event: any) => {
    if (isBlocked) {
      if (!window.confirm('If you leave now you will lose any unsaved changes. Are you sure?')) 
        event.preventDefault(); 
      else {
        isBlocked = false;
      }
    }
    return;
  };

  return (
    // Pass the skin context/attribute to a wrapper element that encapsulates everything
    <div className="app-shell" data-skin={currentSkin}>
      {/* HEADER with theme toggle icon */}
      <header className="app-header">
        <div>
          <h1>JobHunter UI</h1>
          <p>Track and manage your job applications.</p>
        </div>
        <nav className="top-nav">
          <Link className="menu-button" to="/" onClick={(e) => {handleOnClick(e);}} title='Home'>
            <FaHouse aria-hidden="true"/>
          </Link>
          <Link className="menu-button" to="/contacts" onClick={(e) => {handleOnClick(e);}} title='Contacts'>
            <FaIdCard aria-hidden="true"/>
          </Link>
          <Link className="menu-button" to="/settings" onClick={(e) => {handleOnClick(e);}} title='Settings'>
            <FaCog aria-hidden="true"/>
          </Link>
          <button className="menu-button-plain"
            aria-label={currentSkin === "light" ? "Switch to dark mode" : "Switch to light mode"}
            onClick={() => handleSkinChange(currentSkin === 'light' ? 'dark' : 'light')}>
            {currentSkin === 'light' ? (
              <FaMoon aria-hidden="true"/>
            ) : (
              <FaSun aria-hidden="true"/>
            )}
          </button>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/job-specs/new" element={<JobSpecCreate />} />
          <Route path="/job-specs/view/:id" element={<JobSpecView />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/sources" element={<SourcesPage />} />
          <Route path="/settings/lu_benefits" element={<LuBenefitsPage />} />
          <Route path="/settings/lu_locations" element={<LuLocationsPage />} />
          <Route path="/settings/lu_roletypes" element={<LuRoleTypesPage />} />
          <Route path="/settings/lu_workmodels" element={<LuWorkModelsPage />} />
          <Route path="/settings/tags" element={<TagsPage />} />
          <Route path="/settings/backup_export" element={<BackupExportPage />} />
          <Route path="/settings/backup_import" element={<BackupImportPage />} />
          <Route path="/settings/Ollama" element={<OllamaIntegrationPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

