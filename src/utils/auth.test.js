import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('auth utility', () => {
  let auth;
  let storage;

  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function loadModules() {
    storage = await import('./storage.js');
    auth = await import('./auth.js');
    return { auth, storage };
  }

  describe('login', () => {
    it('logs in the default admin with correct credentials', async () => {
      await loadModules();
      const result = auth.login('admin', 'adminpass');
      expect(result.error).toBeUndefined();
      expect(result.userId).toBe('1');
      expect(result.username).toBe('admin');
      expect(result.displayName).toBe('Site Owner');
      expect(result.role).toBe('admin');
    });

    it('sets session after successful admin login', async () => {
      await loadModules();
      auth.login('admin', 'adminpass');
      const session = storage.getSession();
      expect(session).not.toBeNull();
      expect(session.userId).toBe('1');
      expect(session.role).toBe('admin');
    });

    it('logs in a registered localStorage user', async () => {
      await loadModules();
      storage.addUser({
        id: '50',
        displayName: 'Jane Doe',
        username: 'janedoe',
        password: 'janepass',
        role: 'user',
        createdAt: new Date().toISOString(),
      });
      const result = auth.login('janedoe', 'janepass');
      expect(result.error).toBeUndefined();
      expect(result.userId).toBe('50');
      expect(result.username).toBe('janedoe');
      expect(result.displayName).toBe('Jane Doe');
      expect(result.role).toBe('user');
    });

    it('returns error for invalid username', async () => {
      await loadModules();
      const result = auth.login('nonexistent', 'somepass');
      expect(result.error).toBe('Invalid username or password');
    });

    it('returns error for invalid password', async () => {
      await loadModules();
      const result = auth.login('admin', 'wrongpassword');
      expect(result.error).toBe('Invalid username or password');
    });

    it('returns error when username is empty', async () => {
      await loadModules();
      const result = auth.login('', 'somepass');
      expect(result.error).toBe('Username and password are required');
    });

    it('returns error when password is empty', async () => {
      await loadModules();
      const result = auth.login('admin', '');
      expect(result.error).toBe('Username and password are required');
    });

    it('returns error when both fields are empty', async () => {
      await loadModules();
      const result = auth.login('', '');
      expect(result.error).toBe('Username and password are required');
    });

    it('returns error when username is null', async () => {
      await loadModules();
      const result = auth.login(null, 'somepass');
      expect(result.error).toBe('Username and password are required');
    });

    it('returns error when password is null', async () => {
      await loadModules();
      const result = auth.login('admin', null);
      expect(result.error).toBe('Username and password are required');
    });

    it('returns error when username is only whitespace', async () => {
      await loadModules();
      const result = auth.login('   ', 'somepass');
      expect(result.error).toBe('Username and password are required');
    });

    it('returns error when password is only whitespace', async () => {
      await loadModules();
      const result = auth.login('admin', '   ');
      expect(result.error).toBe('Username and password are required');
    });
  });

  describe('register', () => {
    it('registers a new user successfully', async () => {
      await loadModules();
      const result = auth.register('New User', 'newuser', 'newpass1234');
      expect(result.error).toBeUndefined();
      expect(result.username).toBe('newuser');
      expect(result.displayName).toBe('New User');
      expect(result.role).toBe('user');
      expect(result.userId).toBeDefined();
    });

    it('sets session after successful registration', async () => {
      await loadModules();
      auth.register('New User', 'newuser', 'newpass1234');
      const session = storage.getSession();
      expect(session).not.toBeNull();
      expect(session.username).toBe('newuser');
      expect(session.role).toBe('user');
    });

    it('adds the new user to storage after registration', async () => {
      await loadModules();
      const result = auth.register('New User', 'newuser', 'newpass1234');
      const users = storage.getUsers();
      const found = users.find((u) => u.id === result.userId);
      expect(found).toBeDefined();
      expect(found.username).toBe('newuser');
      expect(found.displayName).toBe('New User');
      expect(found.role).toBe('user');
    });

    it('returns error when display name is missing', async () => {
      await loadModules();
      const result = auth.register('', 'newuser', 'newpass1234');
      expect(result.error).toBe('Display name is required');
    });

    it('returns error when username is missing', async () => {
      await loadModules();
      const result = auth.register('New User', '', 'newpass1234');
      expect(result.error).toBe('Username is required');
    });

    it('returns error when password is missing', async () => {
      await loadModules();
      const result = auth.register('New User', 'newuser', '');
      expect(result.error).toBe('Password is required');
    });

    it('returns error when all fields are null', async () => {
      await loadModules();
      const result = auth.register(null, null, null);
      expect(result.error).toBe('All fields are required');
    });

    it('returns error when password is too short', async () => {
      await loadModules();
      const result = auth.register('New User', 'newuser', 'abc');
      expect(result.error).toBe('Password must be at least 4 characters');
    });

    it('returns error when passwords do not match', async () => {
      await loadModules();
      const result = auth.register('New User', 'newuser', 'newpass1234', 'differentpass');
      expect(result.error).toBe('Passwords do not match');
    });

    it('succeeds when confirmPassword matches password', async () => {
      await loadModules();
      const result = auth.register('New User', 'newuser', 'newpass1234', 'newpass1234');
      expect(result.error).toBeUndefined();
      expect(result.username).toBe('newuser');
    });

    it('returns error when username already exists', async () => {
      await loadModules();
      auth.register('First User', 'duplicate', 'pass1234');
      vi.resetModules();
      const { login: _, register: register2 } = await import('./auth.js');
      const result = register2('Second User', 'duplicate', 'pass5678');
      expect(result.error).toBe('Username already exists');
    });

    it('returns error when username matches admin (case-insensitive)', async () => {
      await loadModules();
      const result = auth.register('Impersonator', 'Admin', 'pass1234');
      expect(result.error).toBe('Username already exists');
    });

    it('returns error when display name is only whitespace', async () => {
      await loadModules();
      const result = auth.register('   ', 'newuser', 'newpass1234');
      expect(result.error).toBe('Display name is required');
    });

    it('returns error when username is only whitespace', async () => {
      await loadModules();
      const result = auth.register('New User', '   ', 'newpass1234');
      expect(result.error).toBe('Username is required');
    });

    it('returns error when password is only whitespace', async () => {
      await loadModules();
      const result = auth.register('New User', 'newuser', '    ');
      expect(result.error).toBe('Password is required');
    });
  });

  describe('logout', () => {
    it('clears the session on logout', async () => {
      await loadModules();
      auth.login('admin', 'adminpass');
      expect(storage.getSession()).not.toBeNull();
      auth.logout();
      expect(storage.getSession()).toBeNull();
    });

    it('does not throw when no session exists', async () => {
      await loadModules();
      expect(() => auth.logout()).not.toThrow();
    });
  });

  describe('isAuthenticated', () => {
    it('returns false when no session exists', async () => {
      await loadModules();
      expect(auth.isAuthenticated()).toBe(false);
    });

    it('returns true after login', async () => {
      await loadModules();
      auth.login('admin', 'adminpass');
      expect(auth.isAuthenticated()).toBe(true);
    });

    it('returns false after logout', async () => {
      await loadModules();
      auth.login('admin', 'adminpass');
      auth.logout();
      expect(auth.isAuthenticated()).toBe(false);
    });

    it('returns true after registration', async () => {
      await loadModules();
      auth.register('New User', 'newuser', 'newpass1234');
      expect(auth.isAuthenticated()).toBe(true);
    });
  });

  describe('getRole', () => {
    it('returns null when no session exists', async () => {
      await loadModules();
      expect(auth.getRole()).toBeNull();
    });

    it('returns admin for admin user', async () => {
      await loadModules();
      auth.login('admin', 'adminpass');
      expect(auth.getRole()).toBe('admin');
    });

    it('returns user for regular user', async () => {
      await loadModules();
      auth.register('Regular', 'regular', 'pass1234');
      expect(auth.getRole()).toBe('user');
    });

    it('returns null after logout', async () => {
      await loadModules();
      auth.login('admin', 'adminpass');
      auth.logout();
      expect(auth.getRole()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when no session exists', async () => {
      await loadModules();
      expect(auth.getCurrentUser()).toBeNull();
    });

    it('returns the full admin user object after admin login', async () => {
      await loadModules();
      auth.login('admin', 'adminpass');
      const user = auth.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user.id).toBe('1');
      expect(user.username).toBe('admin');
      expect(user.displayName).toBe('Site Owner');
      expect(user.role).toBe('admin');
      expect(user.password).toBe('adminpass');
    });

    it('returns the full user object after registration', async () => {
      await loadModules();
      const result = auth.register('Test Person', 'testperson', 'testpass1');
      const user = auth.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user.id).toBe(result.userId);
      expect(user.username).toBe('testperson');
      expect(user.displayName).toBe('Test Person');
      expect(user.role).toBe('user');
    });

    it('returns null after logout', async () => {
      await loadModules();
      auth.login('admin', 'adminpass');
      auth.logout();
      expect(auth.getCurrentUser()).toBeNull();
    });

    it('returns null if session user was deleted from storage', async () => {
      await loadModules();
      const result = auth.register('Temp User', 'tempuser', 'temppass1');
      storage.deleteUser(result.userId);
      const user = auth.getCurrentUser();
      expect(user).toBeNull();
    });
  });
});