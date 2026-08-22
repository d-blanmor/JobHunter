import { setting_keys } from '../../config';
import { useEffect, useMemo, useState } from 'react';
import { FaRegArrowAltCircleRight, FaRegArrowAltCircleDown, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getSetting, saveSetting } from '../../api/app_settings';
import { checkFileSystem, listFiles } from '../../api/system/fileSystem'
import { systemImportFile, rolesImportFile } from '../../api/backup';
import { DEFAULT_PAGE_SIZE } from '../../config';

const PAGE_SIZE = DEFAULT_PAGE_SIZE;

export default function BackupImportPage() {
  const navigate = useNavigate();

  // Behaviour
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [origRepository, setOrigRepository] = useState<string>('');
  const [repository, setRepository] = useState<string>('');
  const [repository_Notes, setRepository_Notes] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showRoles, setShowRoles] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState('');
  const [searchFileSettings, setSearchFileSettings] = useState('');
  const [settingItems, setSettingItems] = useState<string[]>([]);
  const [settingPage, setSettingPage] = useState(1);
  const [searchFileRoles, setSearchFileRoles] = useState('');
  const [roleItems, setRoleItems] = useState<string[]>([]);
  const [rolePage, setRolePage] = useState(1);
  const [fileSourceSetting, setFileSourceSetting] = useState<string>('');
  const [fileSourceRole, setFileSourceRole] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const directory = await getSetting(setting_keys.BACKUP.Repository);
        setActionMessage('');
        if (directory && directory.Value != '') {
          const [
            _settingFiles, 
            _roleFiles,
          ] = await Promise.all([
            listFiles(directory.Value, 'settings_'),
            listFiles(directory.Value, 'roles_'),
          ]);
          setOrigRepository(directory.Value);
          setRepository(directory.Value);
          setRepository_Notes(directory.Notes);
          setSettingItems(_settingFiles.outcome);
          setRoleItems(_roleFiles.outcome);
        } 
      } 
      catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load import');
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

            const [
              _settingFiles, 
              _roleFiles,
            ] = await Promise.all([
              listFiles(repository, 'settings_'),
              listFiles(repository, 'roles_'),
            ]);
            setSettingItems(_settingFiles.outcome);
            setRoleItems(_roleFiles.outcome);
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

  const filteredSettingItems = useMemo(() => {
    return settingItems.filter((settingItem) => {
      if (searchFileSettings && !settingItem.toLowerCase().includes(searchFileSettings.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [settingItems, searchFileSettings]);

  const filteredRoleItems = useMemo(() => {
    return roleItems.filter((roleItem) => {

      if (searchFileRoles && !roleItem.toLowerCase().includes(searchFileRoles.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [roleItems, searchFileRoles]);

  const totalSettingPages = Math.max(1, Math.ceil(filteredSettingItems.length / PAGE_SIZE));
  const pagedSettingItems = filteredSettingItems.slice((settingPage - 1) * PAGE_SIZE, settingPage * PAGE_SIZE);
  const totalRolePages = Math.max(1, Math.ceil(filteredRoleItems.length / PAGE_SIZE));
  const pagedRoleItems = filteredRoleItems.slice((rolePage - 1) * PAGE_SIZE, rolePage * PAGE_SIZE);

  const handlePageChange = (table: string, target: number) => {
    if (table.toLowerCase() == 'settings') {
      setSettingPage(Math.max(1, Math.min(target, totalSettingPages)));
    }
    else if (table.toLowerCase() == 'roles') {
      setRolePage(Math.max(1, Math.min(target, totalRolePages)));
    }
  };

  const handleRowClick = (table: string, value: string) => {
    if (table.toLowerCase() == 'settings') {
      setFileSourceSetting(value);
    }
    else if (table.toLowerCase() == 'roles') {
      setFileSourceRole(value);
    }
  };

  async function handleImport(field: string) {
    setLoading(true);
    setError(null);

    try {
      if (repository && repository != '') {
        if (field.toLowerCase() == 'settings') {
          if (fileSourceSetting && fileSourceSetting != '') {
            const result = await systemImportFile(`${repository}${fileSourceSetting}`);
            setFileSourceSetting('');
            setShowSettings(false);
            setActionMessage(`Settings imported from ${repository}${fileSourceSetting}`);
          }
        }
        else if (field.toLowerCase() == 'roles') {
          if (fileSourceRole && fileSourceRole != '') {
            const result = await rolesImportFile(`${repository}${fileSourceRole}`);
            setFileSourceRole('');
            setShowRoles(false);
            setActionMessage(`Roles imported from ${repository}${fileSourceRole}`);
          }
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
              <span className="settings-title">Restore Backup</span>
              <p className="settings-subtitle">Import settings and entities from json files</p>
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
              {showSettings ? (
                <div className="settings-field">
                  <span className="settings-field-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowSettings(false)}>
                    <h4 className="section-heading"><FaRegArrowAltCircleDown /> Hide Settings to Import</h4>
                  </span>

                  <>
                    <div className="settings-filters">
                      <div className="settings-filter">
                        <label>Setting backup files</label>
                      </div>
                      <div className="settings-filter">
                        <input className="settings-filter" value={searchFileSettings} onChange={(event) => setSearchFileSettings(event.target.value)} placeholder="Filter file" />
                      </div>
                    </div>

                    <div className="settings-table">
                      {pagedSettingItems.length === 0 && (
                        <div className="settings-row settings-empty-row">
                          <div className="settings-cell settings-paged-cell">
                            No file found.
                          </div>
                        </div>
                      )}
                      {pagedSettingItems.map((item) => (
                        <div key={item} className="settings-row settings-row-clickable" onClick={() => handleRowClick('settings', item)}>
                          {item ? (
                            <span className="settings-cell-item">{item}</span>
                          ) : (
                            <span className="settings-cell-item-empty">—</span>
                          )}
                          <span className="settings-row-actions">
                            <button type="button"
                                    className={`settings-action-button settings-action-button-delete`}
                                    title="Delete backup"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    disabled>
                              <FaTrashAlt />
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                    {totalSettingPages && totalSettingPages > 1 ? (
                      <div className="settings-pagination">
                        <button className="settings-button settings-secondary-button" onClick={() => handlePageChange('settings', 1)} disabled={settingPage === 1}>
                          First
                        </button>
                        <button className="settings-button settings-secondary-button" onClick={() => handlePageChange('settings',settingPage - 1)} disabled={settingPage === 1}>
                          Previous
                        </button>
                        <span>
                          Page {settingPage} / {totalSettingPages}
                        </span>
                        <button className="settings-button settings-secondary-button" onClick={() => handlePageChange('settings',settingPage + 1)} disabled={settingPage === totalSettingPages}>
                          Next
                        </button>
                        <button className="settings-button settings-secondary-button" onClick={() => handlePageChange('settings',totalSettingPages)} disabled={settingPage === totalSettingPages}>
                          Last
                        </button>
                      </div>
                    ) : ( <div className="settings-pagination"/> )}
                  </>

                  <input id='SettingsSource' className="settings-field" value={fileSourceSetting} hidden />
                  {fileSourceSetting && fileSourceSetting != '' ? (
                    <button className="settings-button" onClick={(e) => handleImport("settings")}>Import Settings!</button>
                  ) : (
                    ''
                  )}
                </div>
              ) : (
                <div className="settings-field">
                  <span className="settings-field-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowSettings(true)}>
                    <h4 className="section-heading"><FaRegArrowAltCircleRight /> Show Settings to Import</h4>
                  </span>
                </div>
              )}

              {showRoles ? (
                <div className="settings-field">
                  <span className="settings-field-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowRoles(false)}>
                    <h4 className="section-heading"><FaRegArrowAltCircleDown /> Hide Roles to Import</h4>
                  </span>

                  <>
                    <div className="settings-filters">
                      <div className="settings-filter">
                        <label>Roles backup files</label>
                      </div>
                      <div className="settings-filter">
                        <input className="settings-filter" value={searchFileRoles} onChange={(event) => setSearchFileRoles(event.target.value)} placeholder="Filter file" />
                      </div>
                    </div>

                    <div className="settings-table">
                      {pagedRoleItems.length === 0 && (
                        <div className="settings-row settings-empty-row">
                          <div className="settings-cell settings-paged-cell">
                            No file found.
                          </div>
                        </div>
                      )}
                      {pagedRoleItems.map((item) => (
                        <div key={item} className="settings-row settings-row-clickable" onClick={() => handleRowClick('roles', item)}>
                          {item ? (
                            <span className="settings-cell-item">{item}</span>
                          ) : (
                            <span className="settings-cell-item-empty">—</span>
                          )}
                          <span className="settings-row-actions">
                            <button type="button"
                                    className={`settings-action-button settings-action-button-delete`}
                                    title="Delete backup"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    disabled>
                              <FaTrashAlt />
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                    {totalRolePages && totalRolePages > 1 ? (
                      <div className="settings-pagination">
                        <button className="settings-button settings-secondary-button" onClick={() => handlePageChange('roles', 1)} disabled={rolePage === 1}>
                          First
                        </button>
                        <button className="settings-button settings-secondary-button" onClick={() => handlePageChange('roles',rolePage - 1)} disabled={rolePage === 1}>
                          Previous
                        </button>
                        <span>
                          Page {rolePage} / {totalRolePages}
                        </span>
                        <button className="settings-button settings-secondary-button" onClick={() => handlePageChange('roles',rolePage + 1)} disabled={rolePage === totalRolePages}>
                          Next
                        </button>
                        <button className="settings-button settings-secondary-button" onClick={() => handlePageChange('roles',totalRolePages)} disabled={rolePage === totalRolePages}>
                          Last
                        </button>
                      </div>
                    ) : ( <div className="settings-pagination"/> )}
                  </>

                  <input id='RolesSource' className="settings-field" value={fileSourceRole} hidden />
                  {fileSourceRole && fileSourceRole != '' ? (
                    <button className="settings-button" onClick={(e) => handleImport("roles")}>Import Roles</button>
                  ) : (
                    ''
                  )}
                </div>
              ) : ( 
                <div className="settings-field">
                  <span className="settings-field-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowRoles(true)}>
                    <h4 className="section-heading"><FaRegArrowAltCircleRight /> Show Roles to Import</h4>
                  </span>
                </div>
              )}

              {actionMessage ? (
                <div className="settings-field">
                  <input id="Message" value={actionMessage} placeholder="" disabled />
                </div>
              ) : ( '' )}

            </>
          ) : (
            ''
          )}
        </div>
      )}

    </section>
  );
}
