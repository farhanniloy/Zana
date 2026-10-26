"use client"
import { useEffect, useState } from 'react';
import styles from './userManager.module.css';

export default function UserManager(){
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchUsers = async ()=>{
    setLoading(true);
    try{
      const res = await fetch('/api/admin/users');
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Failed');
      setUsers(j.users || []);
    }catch(e){ setMessage('Error fetching users: '+e.message); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchUsers(); }, []);

  const changeRole = async (email, role) => {
    try{
      const res = await fetch('/api/admin/change-role', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, role }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Failed');
      setMessage('Role updated');
      fetchUsers();
    }catch(e){ setMessage('Error: '+e.message); }
  };

  const changeUsername = async (email, username) => {
    try{
      const res = await fetch('/api/admin/change-username', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, username }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Failed');
      setMessage('Username updated');
      fetchUsers();
    }catch(e){ setMessage('Error: '+e.message); }
  };

  return (
    <section className={styles.manager} aria-labelledby="users-heading">
      <h2 id="users-heading" className={styles.heading}>Users</h2>
      {message && <div className={styles.message} role="status">{message}</div>}
      {loading ? <div>Loading...</div> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Email</th><th>Name</th><th>Username</th><th>Role</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.email}>
                  <td data-label="Email" className={styles.email}>{u.email}</td>
                  <td data-label="Name">{u.name || '—'}</td>
                  <td data-label="Username">
                    <div className={styles.usernameControls}>
                      <input
                        defaultValue={u.username || ''}
                        id={`username-${u.id}`}
                        aria-label={`Username for ${u.email}`}
                      />
                      <button
                        type="button"
                        onClick={() => changeUsername(u.email, document.getElementById(`username-${u.id}`).value)}
                        aria-label={`Save username for ${u.email}`}
                      >
                        Save
                      </button>
                    </div>
                  </td>
                  <td data-label="Role">
                    <select
                      defaultValue={u.role}
                      onChange={(e) => changeRole(u.email, e.target.value)}
                      aria-label={`Role for ${u.email}`}
                    >
                      <option value="USER">USER</option>
                      <option value="MODERATOR">MODERATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td data-label="Actions">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
