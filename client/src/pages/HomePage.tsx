import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section className="page">
      <h2>Welcome to JobHunter</h2>
      <p>Use this app to monitor your job applications, manage contacts, and configure lookup data.</p>

      <div className="card-grid">
        <article className="card">
          <h3>Settings</h3>
          <p>Open the settings page to manage application metadata and lookup values.</p>
          <Link className="button" to="/settings">Go to Settings</Link>
        </article>

        <article className="card">
          <h3>Locations</h3>
          <p>View and edit the list of job locations used by job specifications.</p>
          <Link className="button" to="/settings/locations">View Locations</Link>
        </article>
      </div>
    </section>
  );
}
