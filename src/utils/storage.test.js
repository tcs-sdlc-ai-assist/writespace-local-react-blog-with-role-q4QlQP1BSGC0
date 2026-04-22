import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('storage utility', () => {
  let storage;

  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function loadStorage() {
    storage = await import('./storage.js');
    return storage;
  }

  describe('default admin initialization', () => {
    it('creates a default admin user on first load', async () => {
      await loadStorage();
      const users = storage.getUsers();
      const admin = users.find((u) => u.id === '1');
      expect(admin).toBeDefined();
      expect(admin.username).toBe('admin');
      expect(admin.role).toBe('admin');
      expect(admin.displayName).toBe('Site Owner');
    });

    it('does not duplicate admin on subsequent loads', async () => {
      await loadStorage();
      vi.resetModules();
      const storage2 = await import('./storage.js');
      const users = storage2.getUsers();
      const admins = users.filter((u) => u.id === '1' && u.role === 'admin');
      expect(admins).toHaveLength(1);
    });
  });

  describe('isLocalStorageAvailable', () => {
    it('returns true when localStorage is functional', async () => {
      await loadStorage();
      expect(storage.isLocalStorageAvailable()).toBe(true);
    });

    it('returns false when localStorage throws', async () => {
      await loadStorage();
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('Storage disabled');
      };
      expect(storage.isLocalStorageAvailable()).toBe(false);
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('Users CRUD', () => {
    it('returns an array of users including the default admin', async () => {
      await loadStorage();
      const users = storage.getUsers();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(1);
    });

    it('adds a new user', async () => {
      await loadStorage();
      const newUser = {
        id: '100',
        displayName: 'Test User',
        username: 'testuser',
        password: 'testpass',
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      storage.addUser(newUser);
      const users = storage.getUsers();
      const found = users.find((u) => u.id === '100');
      expect(found).toBeDefined();
      expect(found.username).toBe('testuser');
    });

    it('updates an existing user', async () => {
      await loadStorage();
      storage.addUser({
        id: '200',
        displayName: 'Original',
        username: 'original',
        password: 'pass',
        role: 'user',
        createdAt: new Date().toISOString(),
      });
      storage.updateUser({ id: '200', displayName: 'Updated Name' });
      const users = storage.getUsers();
      const updated = users.find((u) => u.id === '200');
      expect(updated.displayName).toBe('Updated Name');
      expect(updated.username).toBe('original');
    });

    it('does nothing when updating a non-existent user', async () => {
      await loadStorage();
      const before = storage.getUsers().length;
      storage.updateUser({ id: 'nonexistent', displayName: 'Ghost' });
      const after = storage.getUsers().length;
      expect(after).toBe(before);
    });

    it('deletes a user by id', async () => {
      await loadStorage();
      storage.addUser({
        id: '300',
        displayName: 'To Delete',
        username: 'deleteme',
        password: 'pass',
        role: 'user',
        createdAt: new Date().toISOString(),
      });
      expect(storage.getUsers().find((u) => u.id === '300')).toBeDefined();
      storage.deleteUser('300');
      expect(storage.getUsers().find((u) => u.id === '300')).toBeUndefined();
    });

    it('does nothing when deleting a non-existent user', async () => {
      await loadStorage();
      const before = storage.getUsers().length;
      storage.deleteUser('nonexistent');
      const after = storage.getUsers().length;
      expect(after).toBe(before);
    });
  });

  describe('Posts CRUD', () => {
    it('returns an empty array when no posts exist', async () => {
      await loadStorage();
      const posts = storage.getPosts();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts).toHaveLength(0);
    });

    it('adds a new post', async () => {
      await loadStorage();
      const post = {
        id: 'p1',
        title: 'Test Post',
        content: 'Hello world',
        authorId: '1',
        createdAt: new Date().toISOString(),
      };
      storage.addPost(post);
      const posts = storage.getPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0].title).toBe('Test Post');
    });

    it('returns posts sorted by createdAt descending', async () => {
      await loadStorage();
      storage.addPost({
        id: 'p-old',
        title: 'Old Post',
        content: 'old',
        authorId: '1',
        createdAt: '2023-01-01T00:00:00.000Z',
      });
      storage.addPost({
        id: 'p-new',
        title: 'New Post',
        content: 'new',
        authorId: '1',
        createdAt: '2024-06-01T00:00:00.000Z',
      });
      storage.addPost({
        id: 'p-mid',
        title: 'Mid Post',
        content: 'mid',
        authorId: '1',
        createdAt: '2023-06-01T00:00:00.000Z',
      });
      const posts = storage.getPosts();
      expect(posts[0].id).toBe('p-new');
      expect(posts[1].id).toBe('p-mid');
      expect(posts[2].id).toBe('p-old');
    });

    it('updates an existing post', async () => {
      await loadStorage();
      storage.addPost({
        id: 'p2',
        title: 'Original Title',
        content: 'content',
        authorId: '1',
        createdAt: new Date().toISOString(),
      });
      storage.updatePost({ id: 'p2', title: 'Updated Title' });
      const posts = storage.getPosts();
      const updated = posts.find((p) => p.id === 'p2');
      expect(updated.title).toBe('Updated Title');
      expect(updated.content).toBe('content');
    });

    it('does nothing when updating a non-existent post', async () => {
      await loadStorage();
      storage.addPost({
        id: 'p3',
        title: 'Only Post',
        content: 'content',
        authorId: '1',
        createdAt: new Date().toISOString(),
      });
      storage.updatePost({ id: 'nonexistent', title: 'Ghost' });
      const posts = storage.getPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0].title).toBe('Only Post');
    });

    it('deletes a post by id', async () => {
      await loadStorage();
      storage.addPost({
        id: 'p4',
        title: 'Delete Me',
        content: 'content',
        authorId: '1',
        createdAt: new Date().toISOString(),
      });
      expect(storage.getPosts().find((p) => p.id === 'p4')).toBeDefined();
      storage.deletePost('p4');
      expect(storage.getPosts().find((p) => p.id === 'p4')).toBeUndefined();
    });

    it('does nothing when deleting a non-existent post', async () => {
      await loadStorage();
      storage.addPost({
        id: 'p5',
        title: 'Stay',
        content: 'content',
        authorId: '1',
        createdAt: new Date().toISOString(),
      });
      storage.deletePost('nonexistent');
      expect(storage.getPosts()).toHaveLength(1);
    });
  });

  describe('Session management', () => {
    it('returns null when no session exists', async () => {
      await loadStorage();
      const session = storage.getSession();
      expect(session).toBeNull();
    });

    it('sets and retrieves a session', async () => {
      await loadStorage();
      const sessionData = {
        userId: '1',
        username: 'admin',
        displayName: 'Site Owner',
        role: 'admin',
      };
      storage.setSession(sessionData);
      const session = storage.getSession();
      expect(session).toEqual(sessionData);
    });

    it('clears the session', async () => {
      await loadStorage();
      storage.setSession({
        userId: '1',
        username: 'admin',
        displayName: 'Site Owner',
        role: 'admin',
      });
      expect(storage.getSession()).not.toBeNull();
      storage.clearSession();
      expect(storage.getSession()).toBeNull();
    });

    it('returns null for an invalid session object missing required fields', async () => {
      await loadStorage();
      storage.setSession({ userId: '1' });
      const session = storage.getSession();
      expect(session).toBeNull();
    });

    it('returns null for a non-object session value', async () => {
      await loadStorage();
      localStorage.setItem('writespace_session', JSON.stringify('not-an-object'));
      const session = storage.getSession();
      expect(session).toBeNull();
    });
  });

  describe('graceful fallback for corrupted localStorage', () => {
    it('returns empty array for corrupted users data', async () => {
      localStorage.setItem('writespace_users', '{invalid json');
      await loadStorage();
      const users = storage.getUsers();
      expect(Array.isArray(users)).toBe(true);
    });

    it('returns empty array for corrupted posts data', async () => {
      localStorage.setItem('writespace_posts', '{invalid json');
      await loadStorage();
      const posts = storage.getPosts();
      expect(Array.isArray(posts)).toBe(true);
    });

    it('returns null for corrupted session data', async () => {
      localStorage.setItem('writespace_session', '{invalid json');
      await loadStorage();
      const session = storage.getSession();
      expect(session).toBeNull();
    });
  });

  describe('graceful fallback for unavailable localStorage', () => {
    it('getUsers returns empty array when localStorage is unavailable', async () => {
      await loadStorage();
      const originalSetItem = Storage.prototype.setItem;
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.setItem = () => {
        throw new Error('Storage disabled');
      };
      Storage.prototype.getItem = () => {
        throw new Error('Storage disabled');
      };
      const users = storage.getUsers();
      expect(Array.isArray(users)).toBe(true);
      expect(users).toHaveLength(0);
      Storage.prototype.setItem = originalSetItem;
      Storage.prototype.getItem = originalGetItem;
    });

    it('getPosts returns empty array when localStorage is unavailable', async () => {
      await loadStorage();
      const originalSetItem = Storage.prototype.setItem;
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.setItem = () => {
        throw new Error('Storage disabled');
      };
      Storage.prototype.getItem = () => {
        throw new Error('Storage disabled');
      };
      const posts = storage.getPosts();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts).toHaveLength(0);
      Storage.prototype.setItem = originalSetItem;
      Storage.prototype.getItem = originalGetItem;
    });

    it('getSession returns null when localStorage is unavailable', async () => {
      await loadStorage();
      const originalSetItem = Storage.prototype.setItem;
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.setItem = () => {
        throw new Error('Storage disabled');
      };
      Storage.prototype.getItem = () => {
        throw new Error('Storage disabled');
      };
      const session = storage.getSession();
      expect(session).toBeNull();
      Storage.prototype.setItem = originalSetItem;
      Storage.prototype.getItem = originalGetItem;
    });

    it('clearSession does not throw when localStorage is unavailable', async () => {
      await loadStorage();
      const originalRemoveItem = Storage.prototype.removeItem;
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.removeItem = () => {
        throw new Error('Storage disabled');
      };
      Storage.prototype.setItem = () => {
        throw new Error('Storage disabled');
      };
      expect(() => storage.clearSession()).not.toThrow();
      Storage.prototype.removeItem = originalRemoveItem;
      Storage.prototype.setItem = originalSetItem;
    });
  });
});