import { Link } from 'react-router-dom';

export default function SettingsPage() {
  return (
    <section className="page">
      <h2>Lookup Settings </h2>
      <div className="settings-list">
        <Link className="settings-link" to="/settings/lu_benefits">Benefits</Link>
      </div>
      <div className="settings-list">
        <Link className="settings-link" to="/settings/lu_locations">Locations</Link>
      </div>
      <div className="settings-list">
        <Link className="settings-link" to="/settings/lu_roletypes">Role Types</Link>
      </div>
      <div className="settings-list">
        <Link className="settings-link" to="/settings/lu_workmodels">Work Models</Link>
      </div>
      <br/>
      <div className="settings-list">
        <Link className="settings-link" to="/settings/tags">Tag Management</Link>
      </div>
    </section>
  );
}
