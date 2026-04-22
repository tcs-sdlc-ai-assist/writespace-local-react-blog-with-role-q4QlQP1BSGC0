/**
 * Storage utility module for WriteSpace
 * Manages localStorage CRUD operations for users, posts, and session data.
 * Keys: writespace_users, writespace_posts, writespace_session
 */

const KEYS = {
  USERS: 'writespace_users',
  POSTS: 'writespace_posts',
  SESSION: 'writespace_session',
};

const DEFAULT_ADMIN = {
  id: '1',
  displayName: 'Site Owner',
  username: 'admin',
  password: 'adminpass',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

/**
 * Check if localStorage is available and functional.
 * @returns {boolean}
 */
export function isLocalStorageAvailable() {
  try {
    const testKey = '__writespace_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely read and parse a JSON value from localStorage.
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
function safeGet(key, fallback) {
  if (!isLocalStorageAvailable()) {
    return fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    // Corrupted data — remove and return fallback
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return fallback;
  }
}

/**
 * Safely write a JSON value to localStorage.
 * @param {string} key
 * @param {*} value
 */
function safeSet(key, value) {
  if (!isLocalStorageAvailable()) {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/**
 * Initialize default admin user if not already present.
 */
function initializeDefaults() {
  if (!isLocalStorageAvailable()) {
    return;
  }
  const users = safeGet(KEYS.USERS, []);
  const adminExists = Array.isArray(users) && users.some((u) => u.id === '1' && u.role === 'admin');
  if (!adminExists) {
    const updatedUsers = Array.isArray(users) ? users : [];
    // Remove any corrupted admin entry
    const filtered = updatedUsers.filter((u) => u.id !== '1');
    filtered.unshift(DEFAULT_ADMIN);
    safeSet(KEYS.USERS, filtered);
  }

  // Ensure posts key exists
  const posts = safeGet(KEYS.POSTS, null);
  if (!Array.isArray(posts)) {
    safeSet(KEYS.POSTS, []);
  }
}

// Run initialization on module load
initializeDefaults();

// --- Users ---

/**
 * Get all users from localStorage.
 * @returns {Array<Object>}
 */
export function getUsers() {
  const users = safeGet(KEYS.USERS, []);
  return Array.isArray(users) ? users : [];
}

/**
 * Add a new user to localStorage.
 * @param {Object} user
 */
export function addUser(user) {
  const users = getUsers();
  users.push(user);
  safeSet(KEYS.USERS, users);
}

/**
 * Update an existing user by id.
 * @param {Object} updatedUser
 */
export function updateUser(updatedUser) {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedUser };
    safeSet(KEYS.USERS, users);
  }
}

/**
 * Delete a user by id.
 * @param {string} userId
 */
export function deleteUser(userId) {
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== userId);
  safeSet(KEYS.USERS, filtered);
}

// --- Posts ---

/**
 * Get all posts from localStorage, sorted by createdAt descending.
 * @returns {Array<Object>}
 */
export function getPosts() {
  const posts = safeGet(KEYS.POSTS, []);
  const arr = Array.isArray(posts) ? posts : [];
  return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Add a new post to localStorage.
 * @param {Object} post
 */
export function addPost(post) {
  const posts = safeGet(KEYS.POSTS, []);
  const arr = Array.isArray(posts) ? posts : [];
  arr.push(post);
  safeSet(KEYS.POSTS, arr);
}

/**
 * Update an existing post by id.
 * @param {Object} updatedPost
 */
export function updatePost(updatedPost) {
  const posts = safeGet(KEYS.POSTS, []);
  const arr = Array.isArray(posts) ? posts : [];
  const index = arr.findIndex((p) => p.id === updatedPost.id);
  if (index !== -1) {
    arr[index] = { ...arr[index], ...updatedPost };
    safeSet(KEYS.POSTS, arr);
  }
}

/**
 * Delete a post by id.
 * @param {string} postId
 */
export function deletePost(postId) {
  const posts = safeGet(KEYS.POSTS, []);
  const arr = Array.isArray(posts) ? posts : [];
  const filtered = arr.filter((p) => p.id !== postId);
  safeSet(KEYS.POSTS, filtered);
}

// --- Session ---

/**
 * Get the current session from localStorage.
 * @returns {Object|null}
 */
export function getSession() {
  const session = safeGet(KEYS.SESSION, null);
  if (session && typeof session === 'object' && session.userId && session.username && session.role) {
    return session;
  }
  return null;
}

/**
 * Set the current session in localStorage.
 * @param {Object} session - { userId, username, displayName, role }
 */
export function setSession(session) {
  safeSet(KEYS.SESSION, session);
}

/**
 * Clear the current session from localStorage.
 */
export function clearSession() {
  if (!isLocalStorageAvailable()) {
    return;
  }
  try {
    localStorage.removeItem(KEYS.SESSION);
  } catch {
    // ignore
  }
}