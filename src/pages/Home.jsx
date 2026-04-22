import React from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../services/../utils/storage.js';
import { getSession } from '../utils/storage.js';
import Navbar from '../components/Navbar.jsx';
import BlogCard from '../components/BlogCard.jsx';

/**
 * Authenticated blog list page displayed at '/blogs'.
 * Shows all posts in a responsive grid sorted newest first.
 * Displays an empty state with CTA when no posts exist.
 */
export default function Home() {
  const session = getSession();
  const posts = getPosts();

  const currentUser = session
    ? {
        userId: session.userId,
        username: session.username,
        displayName: session.displayName,
        role: session.role,
      }
    : null;

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 sm:text-3xl">
              All Posts
            </h1>
            <p className="mt-1 text-sm text-surface-600">
              {posts.length === 0
                ? 'No posts yet. Be the first to share something!'
                : `${posts.length} post${posts.length === 1 ? '' : 's'} published`}
            </p>
          </div>
          <Link
            to="/write"
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
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
            Write a Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-surface-200 bg-white px-6 py-16 text-center shadow-sm">
            <span className="text-5xl" aria-hidden="true">
              ✍️
            </span>
            <h2 className="mt-4 text-xl font-bold text-surface-900">
              No posts yet
            </h2>
            <p className="mt-2 max-w-md text-sm text-surface-600">
              It looks like nobody has written anything yet. Start sharing your
              thoughts with the community!
            </p>
            <Link
              to="/write"
              className="mt-6 inline-flex items-center rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Write Your First Post
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} currentUser={currentUser} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}