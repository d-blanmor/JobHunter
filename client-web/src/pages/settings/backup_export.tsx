 import { setting_keys } from '../../config';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSetting, saveSetting } from '../../api/app_settings';
import { checkFileSystem } from '../../api/system/fileSystem'
import { systemExportFile, rolesExportFile } from '../../api/backup';

export default function BackupExportPage() {
  const navigate = useNavigate();

  // Behaviour
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [origRepository, setOrigRepository] = useState('');
  const [repository, setRepository] = useState('');
  const [repository_Notes, setRepository_Notes] = useState('');
  const [settingsActionMessage, setSettingsActionMessage] = useState('');
  const [rolesActionMessage, setRolesActionMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const directory = await getSetting(setting_keys.BACKUP.Repository);
        if (!mounted) return;
        setSettingsActionMessage('');
        setRolesActionMessage('');
        if (directory && directory != '') {
          setOrigRepository(directory.Value);
          setRepository(directory.Value);
          setRepository_Notes(directory.Notes);
        }
      } 
      catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } 
      finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleFieldEdit = (field: string, value: string) => {
    if (field.toLowerCase() == 'repository') {
      setRepository(value);
    } 
  }

  const handleSubmit = async () => {
    setError(null);

    try 
    {
      setLoading(true);
      if (repository && repository != '') {
        const regexpLastCharacter = /\\$/; // check if the path ends with '\'

        if (!repository.match(regexpLastCharacter)) {
            setRepository(repository + '\\');
        }
        const folderExists = await checkFileSystem(repository);

        if (folderExists.state == 200) {
          if (folderExists.outcome == 'True') {
            await saveSetting (setting_keys.BACKUP.Repository, repository, repository_Notes);
          }
          else {
            setError('Folder doesn\'t exists. Select a valid directory');
          }
        }
        else {
          setError(`Error checking the folder: ${folderExists.message}`);
        }
      }
    } 
    catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } 
    finally {
      setLoading(false);
    }
  };

  const validRepository = () => {
    if (repository && repository != '') {
      return true;
    }
    return false;
  }

  async function handleExport (field: string) {
    setLoading(true);
    setError(null);

    try {
      let date_time = new Date();
      const fileName = "_" + String(date_time.getFullYear()) + String(("0" + (date_time.getMonth() + 1)).slice(-2)) + String(("0" + date_time.getDate()).slice(-2)) + String(date_time.getHours()) + String(date_time.getMinutes()) + ".json"

      if (repository && repository != '') {
        if (field.toLowerCase() == 'settings') {
          const result = await systemExportFile(`${repository}settings${fileName}`);
          setSettingsActionMessage(`Settings exported to ${repository}settings${fileName}`);
        }
        else if (field.toLowerCase() == 'roles') {
          const result = await rolesExportFile(`${repository}roles${fileName}`);
          setRolesActionMessage(`Settings exported to ${repository}roles${fileName}`);
        }
      }
    } 
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export');
    } 
    finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      {loading && (
        <div className="page-header-row">
          <div>
            <h2 className="settings-title"><p>Loading page...</p></h2>
          </div>
        </div>
      )}
      {error && (
        <div className="page-header-row">
          <div>
            <h2 className="settings-title"><p className="error">{error}</p></h2>
          </div>
          <button className="action-button" onClick={() => navigate(-1)}>Back</button>
        </div>
      )}

      {!loading && !error &&  (
        <div className="settings-view">
          <div className="page-header-action">
            <button className="action-button" onClick={() => navigate(-1)}>Back</button>
          </div>
          <div className="page-header-row">
            <div>
              <span className="settings-title">Create Backup</span>
              <p className="settings-subtitle">Export settings and entities to json files</p>
            </div>
          </div>

          <div className="settings">
            <div className="settings-field">
              <input id="Repository" required value={repository} placeholder="Backups Repository" onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
            </div>

            {repository && repository != '' && repository != origRepository ? (
              <div className="settings-field">
                <button className="settings-button" onClick={() => handleSubmit()}>Update Repository</button>
              </div>
            ) : (
              ''
            )}
          </div>

          {validRepository() ? (
            <>
              <div className="settings-field">
                {!settingsActionMessage ? (
                  <button className="settings-button" onClick={() => handleExport("settings")}>Export Settings to settings_yyyymmddhhmm.json</button>
                ) : ( 
                  <div className="settings-field">
                    <input id="Message" value={settingsActionMessage} placeholder="" disabled />
                  </div>
                )}
              </div>

              <div className="settings-field">
                {!rolesActionMessage ? (
                  <button className="settings-button" onClick={() => handleExport("roles")}>Export Roles roles_yyyymmddhhmm.json</button>
                ) : ( 
                  <div className="settings-field">
                    <input id="Message" value={rolesActionMessage} placeholder="" disabled />
                  </div>
                )}
              </div>

            </>
          ) : (
            ''
          )}
        </div>
      )}

    </section>
  );
}
