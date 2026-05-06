import React, { useMemo, useState } from 'react';
import {
  createAdminUser,
  createElevatorThing,
  listAdminUsers,
  type AdminRole,
  type AdminUser
} from '../services/admin-api';
import { useSessionStore } from '../../../store/session-store';

const roleOptions: AdminRole[] = ['platform_admin', 'building_admin', 'operator', 'viewer'];
const roleLabels: Record<AdminRole, string> = {
  platform_admin: 'Quản trị nền tảng',
  building_admin: 'Quản trị tòa nhà',
  operator: 'Vận hành',
  viewer: 'Theo dõi'
};
const statusLabels: Record<string, string> = {
  active: 'Đang hoạt động',
  disabled: 'Đã khóa',
  pending: 'Chờ kích hoạt'
};

function statusLabel(status: string): string {
  return statusLabels[status.toLowerCase()] ?? 'Không xác định';
}

function statusToneClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === 'active') {
    return 'ops-scene-tone-green';
  }
  if (normalized === 'pending') {
    return 'ops-scene-tone-yellow';
  }
  if (normalized === 'disabled') {
    return 'ops-scene-tone-red';
  }
  return 'ops-scene-tone-gray';
}

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminManagementPage(): React.JSX.Element {
  const token = useSessionStore((state) => state.token);
  const roles = useSessionStore((state) => state.roles);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showThingModal, setShowThingModal] = useState(false);

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRoles, setNewUserRoles] = useState<AdminRole[]>(['building_admin']);
  const [newUserBuildings, setNewUserBuildings] = useState('L72');

  const [buildingId, setBuildingId] = useState('L72');
  const [thingId, setThingId] = useState('org.example:L72-ELEV-NEW');
  const [shaftId, setShaftId] = useState('shaft-new');
  const [policyId, setPolicyId] = useState('');

  const canManageUsers = useMemo(() => roles.includes('platform_admin'), [roles]);

  React.useEffect(() => {
    if (!token || !canManageUsers) {
      return;
    }
    void refreshUsers(token).catch(() => undefined);
  }, [canManageUsers, token]);

  async function run(action: () => Promise<string | void>): Promise<void> {
    setBusy(true);
    setMessage(undefined);
    try {
      const result = await action();
      if (result) {
        setMessage(result);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Yêu cầu thất bại');
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
            <p className="ops-label">Người dùng</p>
            <h3 className="ops-panel-title">Tài khoản người dùng</h3>
          </div>
          <div className="admin-button-row admin-button-row-inline">
            <button
              className="admin-secondary-button"
              type="button"
              disabled={!token || busy}
              onClick={() => void refreshUsers()}
            >
              Làm mới
            </button>
            <button
              className="admin-action-button"
              type="button"
              disabled={!token || busy || !canManageUsers}
              onClick={() => setShowUserModal(true)}
            >
              Thêm người dùng
            </button>
            <button
              className="admin-action-button"
              type="button"
              disabled={!token || busy}
              onClick={() => setShowThingModal(true)}
            >
              Thêm Thing
            </button>
          </div>
        </div>
        {message ? <p className="admin-message">{message}</p> : null}

        <div className="admin-table-wrap">
          <table className="admin-user-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Trạng thái</th>
                <th>Vai trò</th>
                <th>Tòa nhà</th>
                <th>Lần đăng nhập cuối</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId}>
                  <td>
                    <strong>{user.email}</strong>
                  </td>
                  <td>
                    <span className={`ops-scene-tone ${statusToneClass(user.status)}`}>
                      {statusLabel(user.status)}
                    </span>
                  </td>
                  <td>{user.roles.map((role) => roleLabels[role] ?? role).join(', ')}</td>
                  <td>{user.buildings.length > 0 ? user.buildings.join(', ') : 'Tất cả'}</td>
                  <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập'}</td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5}>Chưa có dữ liệu người dùng</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {showUserModal ? (
        <div className="admin-modal-root" role="dialog" aria-modal="true" aria-label="Thêm người dùng">
          <button className="admin-modal-backdrop" type="button" onClick={() => setShowUserModal(false)} />
          <section className="admin-modal-panel ops-panel">
          <div className="ops-panel-head">
            <div>
              <p className="ops-label">Người dùng</p>
              <h3 className="ops-panel-title">Thêm tài khoản</h3>
            </div>
            <button className="admin-secondary-button" type="button" onClick={() => setShowUserModal(false)}>
              Đóng
            </button>
          </div>

          <form
            className="admin-form"
            onSubmit={(event) => {
              event.preventDefault();
              void run(async () => {
                if (!token) {
                  return 'Vui lòng đăng nhập trước';
                }
                if (!canManageUsers) {
                  return 'Tài khoản hiện tại không có quyền quản trị nền tảng';
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
                setShowUserModal(false);
                return 'Đã tạo người dùng';
              });
            }}
          >
            <label>
              Email mới
              <input value={newUserEmail} onChange={(event) => setNewUserEmail(event.target.value)} type="email" />
            </label>
            <label>
              Mật khẩu tạm thời
              <input
                value={newUserPassword}
                onChange={(event) => setNewUserPassword(event.target.value)}
                type="password"
                minLength={8}
              />
            </label>
            <fieldset className="admin-role-set">
              <legend>Vai trò</legend>
              {roleOptions.map((role) => (
                <label key={role}>
                  <input
                    type="checkbox"
                    checked={newUserRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                  />
                  {roleLabels[role]}
                </label>
              ))}
            </fieldset>
            <label>
              Tòa nhà
              <input value={newUserBuildings} onChange={(event) => setNewUserBuildings(event.target.value)} />
            </label>
            <button className="admin-action-button" type="submit" disabled={!token || busy}>
              Tạo người dùng
            </button>
          </form>

          </section>
        </div>
      ) : null}

      {showThingModal ? (
        <div className="admin-modal-root" role="dialog" aria-modal="true" aria-label="Thêm Thing">
          <button className="admin-modal-backdrop" type="button" onClick={() => setShowThingModal(false)} />
          <section className="admin-modal-panel ops-panel">
          <div className="ops-panel-head">
            <div>
              <p className="ops-label">Ditto Things</p>
              <h3 className="ops-panel-title">Thêm Thing thang máy</h3>
            </div>
            <button className="admin-secondary-button" type="button" onClick={() => setShowThingModal(false)}>
              Đóng
            </button>
          </div>

          <form className="admin-form">
            <label>
              Tòa nhà
              <input value={buildingId} onChange={(event) => setBuildingId(event.target.value)} />
            </label>
            <label>
              Thing ID
              <input value={thingId} onChange={(event) => setThingId(event.target.value)} />
            </label>
            <label>
              Trục thang
              <input value={shaftId} onChange={(event) => setShaftId(event.target.value)} />
            </label>
            <label>
              Policy ID
              <input value={policyId} onChange={(event) => setPolicyId(event.target.value)} placeholder="mặc định" />
            </label>
            <div className="admin-button-row">
              <button
                className="admin-action-button"
                type="button"
                disabled={!token || busy}
                onClick={() =>
                  void run(async () => {
                    if (!token) {
                      return 'Vui lòng đăng nhập trước';
                    }
                    const result = await createElevatorThing(token, { buildingId, thingId, shaftId, policyId });
                    setShowThingModal(false);
                    return `Đã tạo ${result.thingId}`;
                  })
                }
              >
                Tạo Thing
              </button>
            </div>
          </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
