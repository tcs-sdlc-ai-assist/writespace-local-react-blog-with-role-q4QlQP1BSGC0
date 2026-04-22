import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPosts, deletePost } from '../utils/storage.js';
import { getSession } from '../utils/storage.js';
import { getAvatar } from '../components/Avatar.jsx';
import Navbar from '../components/Navbar.jsx';

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
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * ReadBlog page component.
 * Displays a single blog post at '/blog/:id'.
 * Shows title, author avatar, display name, date, and full content.
 * Admin sees edit/delete on all posts; user sees edit/delete only on own posts.
 * Delete requires confirmation, removes post from localStorage, redirects to blog list.
 * Invalid/missing ID shows 'Post not found' message.
 */
export default function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const session = getSession();

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }

    const posts = getPosts();
    const found = posts.find((p) => p.id === id);

    if (!found) {
      setNotFound(true);
    } else {
      setPost(found);
    }
  }, [id]);

  /**
   * Determine the author's role for avatar display.
   * @param {string} authorId - The post author's user ID.
   * @returns {'admin' | 'user'}
   */
  function getAuthorRole(authorId) {
    if (authorId === '1') return 'admin';
    if (session && session.userId === authorId && session.role === 'admin') return 'admin';
    return 'user';
  }

  /**
   * Check if the current user can edit/delete this post.
   * Admin can edit/delete all posts; user can only edit/delete own posts.
   * @returns {boolean}
   */
  function canModify() {
    if (!session || !post) return false;
    return session.role === 'admin' || session.userId === post.authorId;
  }

  /**
   * Handle post deletion after confirmation.
   */
  function handleDelete() {
    if (!post) return;
    deletePost(post.id);
    navigate('/blogs', { replace: true });
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-surface-900">Post not found</h1>
            <p className="mt-2 text-sm text-surface-600">
              The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              to="/blogs"
              className="mt-6 inline-block rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-surface-600">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  const authorRole = getAuthorRole(post.authorId);
  const showActions = canModify();

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/blogs"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-surface-600 transition-colors hover:text-primary-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blogs
        </Link>

        <article className="rounded-lg border border-surface-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-surface-900 sm:text-3xl">
            {post.title || 'Untitled'}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            {getAvatar(authorRole)}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-surface-800">
                {post.authorName || 'Unknown'}
              </span>
              {post.createdAt && (
                <span className="text-xs text-surface-500">
                  {formatDate(post.createdAt)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 whitespace-pre-wrap text-surface-700 leading-relaxed">
            {post.content}
          </div>
        </article>

        {showActions && (
          <div className="mt-6 flex items-center gap-3">
            <Link
              to={`/edit/${post.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
              Edit
            </Link>

            {!showConfirm ? (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="inline-flex items-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
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
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-surface-600">Are you sure?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="rounded-md bg-surface-100 px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-200 focus:outline-none focus:ring-2 focus:ring-surface-400 focus:ring-offset-1"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}