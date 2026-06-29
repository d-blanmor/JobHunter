import { Route, Routes, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import LocationsPage from './pages/LocationsPage';
import JobSpecCreate from './pages/JobSpecCreate';

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
          <Link to="/settings">Settings</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/locations" element={<LocationsPage />} />
          <Route path="/job-specs/new" element={<JobSpecCreate />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
