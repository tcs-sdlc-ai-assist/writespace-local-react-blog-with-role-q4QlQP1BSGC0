/**
 * Authentication utility module for WriteSpace
 * Manages login, registration, logout, and session queries.
 * Uses storage.js for all data access.
 */

import {
  getUsers,
  addUser,
  getSession,
  setSession,
  clearSession,
} from './storage.js';

/**
 * Generate a simple unique ID.
 * @returns {string} A unique identifier string.
 */
function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
}

/**
 * Attempt to log in a user with the given credentials.
 * Checks the hard-coded admin account first, then localStorage users.
 * @param {string} username - The username to authenticate.
 * @param {string} password - The password to authenticate.
 * @returns {{ userId: string, username: string, displayName: string, role: 'admin' | 'user' } | { error: string }}
 */
export function login(username, password) {
  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    return { error: 'Username and password are required' };
  }

  const users = getUsers();
  const user = users.find(
    (u) => u.username === trimmedUsername && u.password === trimmedPassword
  );

  if (!user) {
    return { error: 'Invalid username or password' };
  }

  const session = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };

  setSession(session);
  return session;
}

/**
 * Register a new user account.
 * Validates all fields, checks username uniqueness, creates the user, and sets the session.
 * @param {string} displayName - The display name for the new user.
 * @param {string} username - The desired username.
 * @param {string} password - The desired password.
 * @param {string} [confirmPassword] - Password confirmation (optional, validated if provided).
 * @returns {{ userId: string, username: string, displayName: string, role: 'user' } | { error: string }}
 */
export function register(displayName, username, password, confirmPassword) {
  if (!displayName || !username || !password) {
    return { error: 'All fields are required' };
  }

  const trimmedDisplayName = displayName.trim();
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedDisplayName) {
    return { error: 'Display name is required' };
  }

  if (!trimmedUsername) {
    return { error: 'Username is required' };
  }

  if (!trimmedPassword) {
    return { error: 'Password is required' };
  }

  if (trimmedPassword.length < 4) {
    return { error: 'Password must be at least 4 characters' };
  }

  if (confirmPassword !== undefined && trimmedPassword !== confirmPassword.trim()) {
    return { error: 'Passwords do not match' };
  }

  const users = getUsers();
  const usernameExists = users.some(
    (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
  );

  if (usernameExists) {
    return { error: 'Username already exists' };
  }

  const newUser = {
    id: generateId(),
    displayName: trimmedDisplayName,
    username: trimmedUsername,
    password: trimmedPassword,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  addUser(newUser);

  const session = {
    userId: newUser.id,
    username: newUser.username,
    displayName: newUser.displayName,
    role: newUser.role,
  };

  setSession(session);
  return session;
}

/**
 * Log out the current user by clearing the session.
 */
export function logout() {
  clearSession();
}

/**
 * Check if a user is currently authenticated.
 * @returns {boolean} True if a valid session exists.
 */
export function isAuthenticated() {
  const session = getSession();
  return session !== null;
}

/**
 * Get the role of the currently authenticated user.
 * @returns {'admin' | 'user' | null} The user's role, or null if not authenticated.
 */
export function getRole() {
  const session = getSession();
  if (!session) {
    return null;
  }
  return session.role;
}

/**
 * Get the full user object for the currently authenticated user.
 * @returns {Object | null} The user object from storage, or null if not found/authenticated.
 */
export function getCurrentUser() {
  const session = getSession();
  if (!session) {
    return null;
  }

  const users = getUsers();
  const user = users.find((u) => u.id === session.userId);
  return user || null;
}