import { Link } from 'react-router-dom';

export default function SettingsPage() {
  return (
    <section className="page">
      <h2>Settings</h2>
      <p>Configure the application and manage lookup entities.</p>
      <div className="settings-list">
        <Link className="settings-link" to="/settings/locations">Locations</Link>
      </div>
    </section>
  );
}
