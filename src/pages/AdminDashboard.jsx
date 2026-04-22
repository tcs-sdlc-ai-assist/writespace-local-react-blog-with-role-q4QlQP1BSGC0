import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getRole } from '../utils/auth.js';
import { getSession } from '../utils/storage.js';
import { getPosts, getUsers, deletePost } from '../utils/storage.js';
import { Navbar } from '../components/Navbar.jsx';
import { StatCard } from '../components/StatCard.jsx';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    if (getRole() !== 'admin') {
      navigate('/blogs', { replace: true });
      return;
    }

    setPosts(getPosts());
    setUsers(getUsers());
  }, [navigate]);

  const session = getSession();

  if (!session || session.role !== 'admin') {
    return null;
  }

  const totalPosts = posts.length;
  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalRegularUsers = users.filter((u) => u.role === 'user').length;

  const recentPosts = posts.slice(0, 5);

  function handleDeletePost(postId) {
    if (!postId) return;
    deletePost(postId);
    setPosts(getPosts());
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      {/* Gradient Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-primary-100">
            Welcome back, {session.displayName || 'Admin'}. Here&apos;s an overview of your site.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Posts"
            value={totalPosts}
            icon="📝"
            color="blue"
          />
          <StatCard
            label="Total Users"
            value={totalUsers}
            icon="👥"
            color="green"
          />
          <StatCard
            label="Admins"
            value={totalAdmins}
            icon="👑"
            color="purple"
          />
          <StatCard
            label="Regular Users"
            value={totalRegularUsers}
            icon="📖"
            color="yellow"
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-surface-900">Quick Actions</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link
              to="/write"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Write New Post
            </Link>
            <Link
              to="/users"
              className="inline-flex items-center gap-2 rounded-lg bg-surface-100 px-5 py-2.5 text-sm font-semibold text-surface-700 shadow-sm transition-colors hover:bg-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0zm6 4a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Manage Users
            </Link>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-surface-900">Recent Posts</h2>
            <Link
              to="/blogs"
              className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
            >
              View all →
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="mt-4 rounded-lg border border-surface-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-surface-600">
                No posts yet. Start by writing your first post!
              </p>
              <Link
                to="/write"
                className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
              >
                Write a Post
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between rounded-lg border border-surface-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/blog/${post.id}`}
                      className="text-sm font-semibold text-surface-900 hover:text-primary-600 transition-colors line-clamp-1"
                    >
                      {post.title || 'Untitled'}
                    </Link>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-xs text-surface-500">
                        by {post.authorName || 'Unknown'}
                      </span>
                      {post.createdAt && (
                        <span className="text-xs text-surface-400">
                          {formatDate(post.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <Link
                      to={`/edit/${post.id}`}
                      className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                      title="Edit post"
                      aria-label="Edit post"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      title="Delete post"
                      aria-label="Delete post"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}