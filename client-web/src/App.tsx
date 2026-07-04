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

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>JobHunter UI</h1>
          <p>Track and manage your job applications.</p>
        </div>
        <nav className="top-nav">
          <Link to="/">Home</Link>
          <Link to="/contacts">Contacts</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/lu_benefits" element={<LuBenefitsPage />} />
          <Route path="/settings/lu_locations" element={<LuLocationsPage />} />
          <Route path="/settings/lu_roletypes" element={<LuRoleTypesPage />} />
          <Route path="/settings/lu_workmodels" element={<LuWorkModelsPage />} />
          <Route path="/settings/tags" element={<TagsPage />} />
          <Route path="/job-specs/new" element={<JobSpecCreate />} />
          <Route path="/job-specs/view/:id" element={<JobSpecView />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
