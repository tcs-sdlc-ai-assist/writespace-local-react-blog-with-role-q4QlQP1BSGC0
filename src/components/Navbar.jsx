import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getSession } from '../utils/storage.js';
import { logout } from '../utils/auth.js';
import { getAvatar } from './Avatar.jsx';

/**
 * Authenticated navigation bar component.
 * Displays WriteSpace brand, navigation links (Blogs, Write),
 * admin-only links (Dashboard, Users), avatar chip with display name,
 * and logout button. Adapts based on user role.
 */
export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();

  if (!session) {
    return null;
  }

  const { displayName, role } = session;
  const isAdmin = role === 'admin';

  /**
   * Handle logout action — clears session and redirects to login.
   */
  function handleLogout() {
    logout();
    navigate('/login');
  }

  /**
   * Returns active link classes based on current pathname.
   * @param {string} path - The route path to check.
   * @returns {string} Tailwind class string.
   */
  function linkClasses(path) {
    const isActive = location.pathname === path;
    return `text-sm font-medium transition-colors ${
      isActive
        ? 'text-primary-600'
        : 'text-surface-600 hover:text-primary-600'
    }`;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            to="/blogs"
            className="text-xl font-bold text-surface-900 hover:text-primary-600 transition-colors"
          >
            WriteSpace
          </Link>

          <div className="hidden items-center gap-6 sm:flex">
            <Link to="/blogs" className={linkClasses('/blogs')}>
              Blogs
            </Link>
            <Link to="/write" className={linkClasses('/write')}>
              Write
            </Link>
            {isAdmin && (
              <>
                <Link to="/admin" className={linkClasses('/admin')}>
                  Dashboard
                </Link>
                <Link to="/users" className={linkClasses('/users')}>
                  Users
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getAvatar(role)}
            <span className="hidden text-sm font-medium text-surface-800 sm:inline">
              {displayName || 'User'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md bg-surface-100 px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="flex items-center gap-4 border-t border-surface-100 px-4 py-2 sm:hidden">
        <Link to="/blogs" className={linkClasses('/blogs')}>
          Blogs
        </Link>
        <Link to="/write" className={linkClasses('/write')}>
          Write
        </Link>
        {isAdmin && (
          <>
            <Link to="/admin" className={linkClasses('/admin')}>
              Dashboard
            </Link>
            <Link to="/users" className={linkClasses('/users')}>
              Users
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;