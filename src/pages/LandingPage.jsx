import React from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../services/../utils/storage.js';
import { isAuthenticated } from '../utils/auth.js';
import PublicNavbar from '../components/PublicNavbar.jsx';
import BlogCard from '../components/BlogCard.jsx';

/**
 * Formats an ISO date string to a human-readable format.
 * @param {string} dateString - ISO date string.
 * @returns {string} Formatted date string.
 */
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

/**
 * Truncates text to a specified maximum length, appending ellipsis if needed.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - Maximum character length.
 * @returns {string} Truncated text.
 */
function truncate(text, maxLength = 120) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Feature card data for the features section.
 */
const FEATURES = [
  {
    icon: '✍️',
    title: 'Distraction-Free Writing',
    description:
      'Focus on what matters most — your words. Our clean editor removes clutter so you can write freely and creatively.',
  },
  {
    icon: '📊',
    title: 'Real-Time Stats',
    description:
      'Track your word count, character count, and reading time as you write. Stay on top of your writing goals effortlessly.',
  },
  {
    icon: '💾',
    title: 'Auto-Save & Persistence',
    description:
      'Never lose your work. WriteSpace automatically saves your drafts and posts locally so you can pick up right where you left off.',
  },
];

export default function LandingPage() {
  const authenticated = isAuthenticated();
  const allPosts = getPosts();
  const latestPosts = allPosts.slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl lg:text-6xl">
              Your Space to{' '}
              <span className="text-primary-600">Write</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-surface-600 sm:text-xl">
              A modern, distraction-free writing platform. Create, manage, and
              share your blog posts with ease. No noise — just your words.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {authenticated ? (
                <>
                  <Link
                    to="/write"
                    className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Start Writing
                  </Link>
                  <Link
                    to="/blogs"
                    className="inline-flex items-center rounded-lg border border-surface-300 bg-white px-6 py-3 text-base font-semibold text-surface-700 shadow-sm transition-colors hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Browse Blogs
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Get Started — It&apos;s Free
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center rounded-lg border border-surface-300 bg-white px-6 py-3 text-base font-semibold text-surface-700 shadow-sm transition-colors hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-surface-900 sm:text-4xl">
              Why WriteSpace?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-surface-600">
              Everything you need to write, publish, and manage your content in
              one simple platform.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="text-lg font-bold text-surface-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-surface-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      {latestPosts.length > 0 && (
        <section className="bg-surface-50 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-surface-900 sm:text-4xl">
                Latest Posts
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-surface-600">
                Check out what our community has been writing about.
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => {
                if (authenticated) {
                  return (
                    <BlogCard key={post.id} post={post} currentUser={null} />
                  );
                }

                return (
                  <Link
                    key={post.id}
                    to="/login"
                    className="flex flex-col rounded-lg border border-surface-200 bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden"
                  >
                    <div className="flex-1 p-5">
                      <h3 className="text-lg font-bold text-surface-900 line-clamp-2 hover:text-primary-600 transition-colors">
                        {post.title || 'Untitled'}
                      </h3>
                      {post.content && (
                        <p className="mt-2 text-sm text-surface-600 line-clamp-3">
                          {truncate(post.content, 150)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 border-t border-surface-100 px-5 py-3">
                      <span className="text-sm font-medium text-surface-800">
                        {post.authorName || 'Unknown'}
                      </span>
                      {post.createdAt && (
                        <span className="text-xs text-surface-500">
                          · {formatDate(post.createdAt)}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-10 text-center">
              <Link
                to={authenticated ? '/blogs' : '/login'}
                className="inline-flex items-center rounded-lg border border-primary-600 px-6 py-3 text-base font-semibold text-primary-600 transition-colors hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                View All Posts →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section (shown when no posts or always as additional CTA) */}
      {latestPosts.length === 0 && (
        <section className="bg-surface-50 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-surface-900 sm:text-4xl">
              Ready to Start Writing?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-surface-600">
              Join WriteSpace today and share your thoughts with the world. No
              setup required — just sign up and start writing.
            </p>
            <div className="mt-8">
              <Link
                to={authenticated ? '/write' : '/register'}
                className="inline-flex items-center rounded-lg bg-primary-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {authenticated ? 'Write Your First Post' : 'Create Your Account'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-surface-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">✍️</span>
              <span className="font-serif text-lg font-bold tracking-tight text-surface-900">
                WriteSpace
              </span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6">
              <Link
                to="/"
                className="text-sm font-medium text-surface-600 transition-colors hover:text-primary-600"
              >
                Home
              </Link>
              <Link
                to={authenticated ? '/blogs' : '/login'}
                className="text-sm font-medium text-surface-600 transition-colors hover:text-primary-600"
              >
                Blogs
              </Link>
              <Link
                to={authenticated ? '/write' : '/register'}
                className="text-sm font-medium text-surface-600 transition-colors hover:text-primary-600"
              >
                Write
              </Link>
              <Link
                to="/login"
                className="text-sm font-medium text-surface-600 transition-colors hover:text-primary-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-surface-600 transition-colors hover:text-primary-600"
              >
                Register
              </Link>
            </nav>
          </div>
          <div className="mt-8 border-t border-surface-100 pt-6 text-center">
            <p className="text-sm text-surface-500">
              © {new Date().getFullYear()} WriteSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}