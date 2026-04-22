import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getRole } from '../utils/auth.js';
import { getSession, getUsers, addUser, deleteUser } from '../utils/storage.js';
import Navbar from '../components/Navbar.jsx';
import { UserRow } from '../components/UserRow.jsx';

/**
 * Generate a simple unique ID.
 * @returns {string} A unique identifier string.
 */
function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
}

/**
 * Admin-only user management page.
 * Displays all users in a list with avatar, display name, username, role badge,
 * created date, and delete button. Includes a form to create new users.
 * Non-admins are redirected to '/blogs'. Unauthenticated users to '/login'.
 */
export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    if (getRole() !== 'admin') {
      navigate('/blogs', { replace: true });
      return;
    }
    refreshUsers();
  }, [navigate]);

  /**
   * Reload users from localStorage.
   */
  function refreshUsers() {
    const allUsers = getUsers();
    setUsers(allUsers);
  }

  /**
   * Handle create user form submission.
   * Validates fields, checks username uniqueness, adds user to storage.
   * @param {React.FormEvent} e
   */
  function handleCreateUser(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedDisplayName = displayName.trim();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedDisplayName || !trimmedUsername || !trimmedPassword) {
      setError('All fields are required');
      return;
    }

    if (trimmedPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    const existingUsers = getUsers();
    const usernameExists = existingUsers.some(
      (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
    );

    if (usernameExists) {
      setError('Username already exists');
      return;
    }

    const newUser = {
      id: generateId(),
      displayName: trimmedDisplayName,
      username: trimmedUsername,
      password: trimmedPassword,
      role: role,
      createdAt: new Date().toISOString(),
    };

    addUser(newUser);
    refreshUsers();

    setDisplayName('');
    setUsername('');
    setPassword('');
    setRole('user');
    setSuccess(`User "${trimmedDisplayName}" created successfully`);

    setTimeout(() => setSuccess(''), 3000);
  }

  /**
   * Handle delete user action. Shows confirmation first, then deletes.
   * @param {string} userId
   */
  function handleDelete(userId) {
    if (confirmDeleteId === userId) {
      deleteUser(userId);
      refreshUsers();
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(userId);
      setTimeout(() => setConfirmDeleteId(null), 5000);
    }
  }

  const session = getSession();
  const currentUserId = session ? session.userId : '';

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-surface-900">User Management</h1>
          <p className="mt-1 text-sm text-surface-600">
            Manage user accounts, create new users, and remove existing ones.
          </p>
        </div>

        {/* Create User Form */}
        <div className="mb-8 rounded-lg border border-surface-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-surface-900">Create New User</h2>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="create-displayName"
                  className="block text-sm font-medium text-surface-700"
                >
                  Display Name
                </label>
                <input
                  id="create-displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  className="mt-1 block w-full rounded-lg border border-surface-300 px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="create-username"
                  className="block text-sm font-medium text-surface-700"
                >
                  Username
                </label>
                <input
                  id="create-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="mt-1 block w-full rounded-lg border border-surface-300 px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="create-password"
                  className="block text-sm font-medium text-surface-700"
                >
                  Password
                </label>
                <input
                  id="create-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className="mt-1 block w-full rounded-lg border border-surface-300 px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="create-role"
                  className="block text-sm font-medium text-surface-700"
                >
                  Role
                </label>
                <select
                  id="create-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-surface-300 px-4 py-2.5 text-sm text-surface-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Create User
              </button>
            </div>
          </form>
        </div>

        {/* Users List */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-surface-900">
            All Users ({users.length})
          </h2>

          {users.length === 0 ? (
            <div className="rounded-lg border border-surface-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-surface-600">No users found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="relative">
                  {confirmDeleteId === user.id ? (
                    <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
                      <p className="text-sm font-medium text-red-800">
                        Are you sure you want to delete <strong>{user.displayName}</strong>?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-100 focus:outline-none focus:ring-2 focus:ring-surface-500 focus:ring-offset-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <UserRow
                      user={user}
                      currentUserId={currentUserId}
                      onDelete={handleDelete}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}