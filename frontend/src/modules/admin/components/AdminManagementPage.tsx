import React, { useMemo, useState } from 'react';
import {
  archiveElevatorThing,
  createAdminUser,
  createElevatorThing,
  listAdminUsers,
  loginAdmin,
  patchElevatorThing,
  type AdminRole,
  type AdminUser,
  type LoginResult
} from '../services/admin-api';

const roleOptions: AdminRole[] = ['platform_admin', 'building_admin', 'operator', 'viewer'];

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseProperties(value: string): Record<string, unknown> {
  if (!value.trim()) {
    return {};
  }
  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Properties must be a JSON object');
  }
  return parsed as Record<string, unknown>;
}

export function AdminManagementPage(): React.JSX.Element {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('test-admin-pass');
  const [session, setSession] = useState<LoginResult | undefined>();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState<string>();
  const [busy, setBusy] = useState(false);

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRoles, setNewUserRoles] = useState<AdminRole[]>(['building_admin']);
  const [newUserBuildings, setNewUserBuildings] = useState('L72');

  const [buildingId, setBuildingId] = useState('L72');
  const [thingId, setThingId] = useState('org.example:L72-ELEV-NEW');
  const [shaftId, setShaftId] = useState('shaft-new');
  const [policyId, setPolicyId] = useState('');
  const [patchJson, setPatchJson] = useState('{"status":"maintenance"}');

  const token = session?.token;
  const canManageUsers = useMemo(
    () => session?.user.roles.includes('platform_admin') ?? false,
    [session]
  );

  async function run(action: () => Promise<string | void>): Promise<void> {
    setBusy(true);
    setMessage(undefined);
    try {
      const result = await action();
      if (result) {
        setMessage(result);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }

  async function refreshUsers(activeToken = token): Promise<void> {
    if (!activeToken) {
      return;
    }
    setUsers(await listAdminUsers(activeToken));
  }

  function toggleRole(role: AdminRole): void {
    setNewUserRoles((current) =>
      current.includes(role) ? current.filter((item) => item !== role) : [...current, role]
    );
  }

  return (
    <div className="ops-column admin-console">
      <section className="ops-panel">
        <div className="ops-panel-head">
          <div>
            <p className="ops-label">API v1</p>
            <h3 className="ops-panel-title">Quản trị người dùng và Twin Things</h3>
          </div>
          {session ? <span className="ops-count-chip">{session.user.email}</span> : null}
        </div>

        <form
          className="admin-form admin-login-form"
          onSubmit={(event) => {
            event.preventDefault();
            void run(async () => {
              const next = await loginAdmin(email, password);
              setSession(next);
              await refreshUsers(next.token);
              return 'Signed in';
            });
          }}
        >
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </label>
          <button className="admin-action-button" type="submit" disabled={busy}>
            Sign in
          </button>
        </form>
        {message ? <p className="admin-message">{message}</p> : null}
      </section>

      <div className="admin-management-grid">
        <section className="ops-panel">
          <div className="ops-panel-head">
            <div>
              <p className="ops-label">Users</p>
              <h3 className="ops-panel-title">Platform accounts</h3>
            </div>
            <button className="admin-secondary-button" type="button" disabled={!token || busy} onClick={() => void refreshUsers()}>
              Refresh
            </button>
          </div>

          <form
            className="admin-form"
            onSubmit={(event) => {
              event.preventDefault();
              void run(async () => {
                if (!token) {
                  return 'Sign in first';
                }
                if (!canManageUsers) {
                  return 'Current user is not platform_admin';
                }
                await createAdminUser(token, {
                  email: newUserEmail,
                  password: newUserPassword,
                  roles: newUserRoles,
                  buildingIds: splitCsv(newUserBuildings)
                });
                await refreshUsers(token);
                setNewUserEmail('');
                setNewUserPassword('');
                return 'User created';
              });
            }}
          >
            <label>
              New email
              <input value={newUserEmail} onChange={(event) => setNewUserEmail(event.target.value)} type="email" />
            </label>
            <label>
              Temporary password
              <input
                value={newUserPassword}
                onChange={(event) => setNewUserPassword(event.target.value)}
                type="password"
                minLength={8}
              />
            </label>
            <fieldset className="admin-role-set">
              <legend>Roles</legend>
              {roleOptions.map((role) => (
                <label key={role}>
                  <input
                    type="checkbox"
                    checked={newUserRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                  />
                  {role}
                </label>
              ))}
            </fieldset>
            <label>
              Buildings
              <input value={newUserBuildings} onChange={(event) => setNewUserBuildings(event.target.value)} />
            </label>
            <button className="admin-action-button" type="submit" disabled={!token || busy}>
              Create user
            </button>
          </form>

          <div className="admin-user-list">
            {users.map((user) => (
              <article className="ops-list-item" key={user.userId}>
                <div>
                  <strong>{user.email}</strong>
                  <p className="ops-muted">{user.roles.join(', ')}</p>
                </div>
                <span className="ops-scene-tone ops-scene-tone-gray">{user.status}</span>
              </article>
            ))}
            {users.length === 0 ? <p className="ops-empty-inline">No users loaded</p> : null}
          </div>
        </section>

        <section className="ops-panel">
          <div className="ops-panel-head">
            <div>
              <p className="ops-label">Ditto Things</p>
              <h3 className="ops-panel-title">Elevator provisioning</h3>
            </div>
          </div>

          <form className="admin-form">
            <label>
              Building
              <input value={buildingId} onChange={(event) => setBuildingId(event.target.value)} />
            </label>
            <label>
              Thing ID
              <input value={thingId} onChange={(event) => setThingId(event.target.value)} />
            </label>
            <label>
              Shaft
              <input value={shaftId} onChange={(event) => setShaftId(event.target.value)} />
            </label>
            <label>
              Policy ID
              <input value={policyId} onChange={(event) => setPolicyId(event.target.value)} placeholder="default" />
            </label>
            <label className="admin-wide-field">
              Patch properties
              <textarea value={patchJson} onChange={(event) => setPatchJson(event.target.value)} rows={4} />
            </label>
            <div className="admin-button-row">
              <button
                className="admin-action-button"
                type="button"
                disabled={!token || busy}
                onClick={() =>
                  void run(async () => {
                    if (!token) {
                      return 'Sign in first';
                    }
                    const result = await createElevatorThing(token, { buildingId, thingId, shaftId, policyId });
                    return `Created ${result.thingId}`;
                  })
                }
              >
                Create
              </button>
              <button
                className="admin-secondary-button"
                type="button"
                disabled={!token || busy}
                onClick={() =>
                  void run(async () => {
                    if (!token) {
                      return 'Sign in first';
                    }
                    const result = await patchElevatorThing(token, {
                      buildingId,
                      thingId,
                      properties: parseProperties(patchJson)
                    });
                    return `Updated ${result.thingId}`;
                  })
                }
              >
                Patch
              </button>
              <button
                className="admin-danger-button"
                type="button"
                disabled={!token || busy}
                onClick={() =>
                  void run(async () => {
                    if (!token) {
                      return 'Sign in first';
                    }
                    const result = await archiveElevatorThing(token, { buildingId, thingId });
                    return `Archived ${result.thingId}`;
                  })
                }
              >
                Archive
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
