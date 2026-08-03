import { Link } from 'react-router-dom';

export default function SettingsPage() {
  return (
    <section className="page">
      {/* Replaced H2 with structured headings and card containers */}
      <h2 className="settings-title">Sources Management</h2>
      <div className="setting-card">
        <Link to="/settings/sources" className="settings-link settings-link--primary">Sources</Link>
      </div>

      {/* ... existing code for other sections will follow this pattern */}

      <h2 className="settings-title mt-8">Tag Management</h2>
      <div className="setting-card">
        <Link to="/settings/tags" className="settings-link settings-link--primary">Tags</Link>
      </div>
      {/* ... existing code for other sections will follow this pattern */}

      <h2 className="settings-title mt-8">Lookup Settings</h2>
      <div className="setting-grid">
        <div className="setting-card"><Link to="/settings/lu_benefits" className="settings-link settings-link--primary">Benefits</Link></div>
        <div className="setting-card"><Link to="/settings/lu_locations" className="settings-link settings-link--primary">Locations</Link></div>
        <div className="setting-card"><Link to="/settings/lu_roletypes" className="settings-link settings-link--primary">Role Types</Link></div>
        <div className="setting-card"><Link to="/settings/lu_workmodels" className="settings-link settings-link--primary">Work Models</Link></div>
      </div>
      <h2 className="settings-title mt-8">Integrations</h2>
      <div className="setting-grid">
        <div className="setting-card"><Link to="/settings/ollama" className="settings-link settings-link--primary">Ollama Integration</Link></div>
      </div>
    </section>
  );
}

