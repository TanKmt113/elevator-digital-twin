import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginAdmin, requestDevAdminSession } from '../../modules/admin/services/admin-api';
import { useSessionStore } from '../../store/session-store';

export function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSessionStore((state) => state.token);
  const setSession = useSessionStore((state) => state.setSession);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [buildingId, setBuildingId] = React.useState('L72');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const from =
    typeof location.state === 'object' &&
    location.state &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/overview';

  if (token) {
    return <Navigate to={from} replace />;
  }

  async function submit(action: () => Promise<{ token: string; user: { roles: string[] } }>): Promise<void> {
    setBusy(true);
    setError(undefined);
    try {
      const session = await action();
      setSession(session.token, session.user.roles.join(', '), session.user.roles);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <span className="admin-brand-mark">K</span>
          <div>
            <p className="admin-brand-eyebrow">Keangnam</p>
            <h1>Digital Twin</h1>
          </div>
        </div>
        <div>
          <p className="ops-label">Secure access</p>
          <h2 className="login-title">Đăng nhập hệ thống vận hành</h2>
        </div>

        <form
          className="login-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(() => loginAdmin(email, password));
          }}
        >
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
            />
          </label>
          <label>
            Building
            <input value={buildingId} onChange={(event) => setBuildingId(event.target.value)} />
          </label>
          {error ? <p className="login-error">{error}</p> : null}
          <div className="login-actions">
            <button className="admin-action-button" type="submit" disabled={busy}>
              Login
            </button>
            <button
              className="admin-secondary-button"
              type="button"
              disabled={busy}
              onClick={() => void submit(() => requestDevAdminSession(buildingId))}
            >
              Dev admin
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
