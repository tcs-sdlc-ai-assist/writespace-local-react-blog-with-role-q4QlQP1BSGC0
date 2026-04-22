import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as storage from './utils/storage.js';

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Helper to render the App at a specific route.
   * @param {string} route - The initial route path.
   */
  function renderAtRoute(route) {
    window.history.pushState({}, '', route);
    return render(<App />);
  }

  describe('public routes', () => {
    it('renders the landing page at /', () => {
      renderAtRoute('/');
      expect(screen.getByText('Your Space to')).toBeInTheDocument();
      expect(screen.getByText('Write')).toBeInTheDocument();
    });

    it('renders the login page at /login', () => {
      renderAtRoute('/login');
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your WriteSpace account')).toBeInTheDocument();
    });

    it('renders the register page at /register', () => {
      renderAtRoute('/register');
      expect(screen.getByText('Create an Account')).toBeInTheDocument();
      expect(screen.getByText('Join WriteSpace and start writing today')).toBeInTheDocument();
    });

    it('renders the landing page for unknown routes (catch-all redirect)', () => {
      renderAtRoute('/some-nonexistent-route');
      expect(screen.getByText('Your Space to')).toBeInTheDocument();
    });
  });

  describe('protected routes — unauthenticated users', () => {
    it('redirects /blogs to /login when not authenticated', () => {
      renderAtRoute('/blogs');
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('redirects /write to /login when not authenticated', () => {
      renderAtRoute('/write');
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('redirects /edit/:id to /login when not authenticated', () => {
      renderAtRoute('/edit/some-id');
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('redirects /blog/:id to /login when not authenticated', () => {
      renderAtRoute('/blog/some-id');
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('redirects /admin to /login when not authenticated', () => {
      renderAtRoute('/admin');
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('redirects /users to /login when not authenticated', () => {
      renderAtRoute('/users');
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });
  });

  describe('protected routes — authenticated regular user', () => {
    beforeEach(() => {
      storage.setSession({
        userId: '50',
        username: 'regularuser',
        displayName: 'Regular User',
        role: 'user',
      });
      storage.addUser({
        id: '50',
        displayName: 'Regular User',
        username: 'regularuser',
        password: 'pass1234',
        role: 'user',
        createdAt: new Date().toISOString(),
      });
    });

    it('renders the blogs page at /blogs for authenticated user', () => {
      renderAtRoute('/blogs');
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });

    it('renders the write page at /write for authenticated user', () => {
      renderAtRoute('/write');
      expect(screen.getByText('Write a New Post')).toBeInTheDocument();
    });

    it('renders the read blog page at /blog/:id for authenticated user', () => {
      storage.addPost({
        id: 'test-post-1',
        title: 'Test Blog Post',
        content: 'This is test content for the blog post.',
        authorId: '50',
        authorName: 'Regular User',
        createdAt: new Date().toISOString(),
      });
      renderAtRoute('/blog/test-post-1');
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    });

    it('redirects /admin to /blogs for non-admin user', () => {
      renderAtRoute('/admin');
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });

    it('redirects /users to /blogs for non-admin user', () => {
      renderAtRoute('/users');
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });
  });

  describe('admin routes — authenticated admin user', () => {
    beforeEach(() => {
      storage.setSession({
        userId: '1',
        username: 'admin',
        displayName: 'Site Owner',
        role: 'admin',
      });
    });

    it('renders the admin dashboard at /admin for admin user', () => {
      renderAtRoute('/admin');
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('renders the user management page at /users for admin user', () => {
      renderAtRoute('/users');
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    it('renders the blogs page at /blogs for admin user', () => {
      renderAtRoute('/blogs');
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });

    it('renders the write page at /write for admin user', () => {
      renderAtRoute('/write');
      expect(screen.getByText('Write a New Post')).toBeInTheDocument();
    });
  });

  describe('navigation elements for authenticated users', () => {
    it('shows admin navigation links for admin user', () => {
      storage.setSession({
        userId: '1',
        username: 'admin',
        displayName: 'Site Owner',
        role: 'admin',
      });
      renderAtRoute('/blogs');
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('shows standard navigation links for regular user', () => {
      storage.setSession({
        userId: '50',
        username: 'regularuser',
        displayName: 'Regular User',
        role: 'user',
      });
      storage.addUser({
        id: '50',
        displayName: 'Regular User',
        username: 'regularuser',
        password: 'pass1234',
        role: 'user',
        createdAt: new Date().toISOString(),
      });
      renderAtRoute('/blogs');
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('edit route access control', () => {
    beforeEach(() => {
      storage.addPost({
        id: 'post-by-user50',
        title: 'User 50 Post',
        content: 'Content by user 50.',
        authorId: '50',
        authorName: 'Regular User',
        createdAt: new Date().toISOString(),
      });
    });

    it('allows admin to access edit page for any post', () => {
      storage.setSession({
        userId: '1',
        username: 'admin',
        displayName: 'Site Owner',
        role: 'admin',
      });
      renderAtRoute('/edit/post-by-user50');
      expect(screen.getByText('Edit Post')).toBeInTheDocument();
    });

    it('allows post owner to access edit page for their own post', () => {
      storage.setSession({
        userId: '50',
        username: 'regularuser',
        displayName: 'Regular User',
        role: 'user',
      });
      storage.addUser({
        id: '50',
        displayName: 'Regular User',
        username: 'regularuser',
        password: 'pass1234',
        role: 'user',
        createdAt: new Date().toISOString(),
      });
      renderAtRoute('/edit/post-by-user50');
      expect(screen.getByText('Edit Post')).toBeInTheDocument();
    });
  });

  describe('blog post not found', () => {
    it('shows not found message for non-existent blog post', () => {
      storage.setSession({
        userId: '1',
        username: 'admin',
        displayName: 'Site Owner',
        role: 'admin',
      });
      renderAtRoute('/blog/nonexistent-id');
      expect(screen.getByText('Post not found')).toBeInTheDocument();
    });
  });
});