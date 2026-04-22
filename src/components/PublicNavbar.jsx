import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, getRole } from '../utils/auth';
import { getSession } from '../utils/storage';
import { getAvatar } from './Avatar';

export function PublicNavbar() {
  const authenticated = isAuthenticated();
  const session = authenticated ? getSession() : null;
  const role = authenticated ? getRole() : null;

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-surface-900 transition-colors hover:text-primary-600"
        >
          <span className="text-2xl" aria-hidden="true">✍️</span>
          <span className="font-serif tracking-tight">WriteSpace</span>
        </Link>

        <div className="flex items-center gap-3">
          {authenticated && session ? (
            <>
              <Link
                to="/blogs"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-100 hover:text-primary-600"
              >
                Blogs
              </Link>
              {role === 'admin' && (
                <Link
                  to="/admin"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-100 hover:text-primary-600"
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/blogs"
                className="flex items-center gap-2 rounded-full border border-surface-200 py-1 pl-1 pr-3 transition-colors hover:bg-surface-50"
              >
                {getAvatar(session.role)}
                <span className="text-sm font-medium text-surface-800">
                  {session.displayName || session.username}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-100 hover:text-primary-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default PublicNavbar;