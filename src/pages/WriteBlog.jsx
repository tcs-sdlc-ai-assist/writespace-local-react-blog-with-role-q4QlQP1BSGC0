import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAuthenticated, getRole } from '../utils/auth.js';
import { getSession } from '../utils/storage.js';
import { getPosts, addPost, updatePost } from '../utils/storage.js';
import { Navbar } from '../components/Navbar.jsx';

/**
 * Generate a simple unique ID.
 * @returns {string} A unique identifier string.
 */
function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
}

/**
 * WriteBlog page component.
 * Create mode at '/write'; edit mode at '/edit/:id'.
 * Form with title and content fields, validation, and character counter.
 * In edit mode, loads existing post and enforces ownership.
 * On save, persists to localStorage and redirects to post reader.
 * Cancel button routes back. Guests redirected to login.
 */
export default function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  const TITLE_MAX_LENGTH = 200;
  const CONTENT_MAX_LENGTH = 10000;

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    if (isEditMode) {
      const session = getSession();
      const posts = getPosts();
      const post = posts.find((p) => p.id === id);

      if (!post) {
        setError('Post not found');
        setInitialLoading(false);
        return;
      }

      const isAdmin = session && session.role === 'admin';
      const isOwner = session && session.userId === post.authorId;

      if (!isAdmin && !isOwner) {
        navigate('/blogs', { replace: true });
        return;
      }

      setTitle(post.title || '');
      setContent(post.content || '');
      setInitialLoading(false);
    }
  }, [id, isEditMode, navigate]);

  /**
   * Handle form submission for creating or updating a blog post.
   * @param {React.FormEvent} e
   */
  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setError('Title is required');
      return;
    }

    if (!trimmedContent) {
      setError('Content is required');
      return;
    }

    if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      setError(`Title must be ${TITLE_MAX_LENGTH} characters or less`);
      return;
    }

    if (trimmedContent.length > CONTENT_MAX_LENGTH) {
      setError(`Content must be ${CONTENT_MAX_LENGTH} characters or less`);
      return;
    }

    const session = getSession();
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);

    if (isEditMode) {
      updatePost({
        id,
        title: trimmedTitle,
        content: trimmedContent,
      });
      setLoading(false);
      navigate(`/blog/${id}`, { replace: true });
    } else {
      const newPostId = generateId();
      const newPost = {
        id: newPostId,
        title: trimmedTitle,
        content: trimmedContent,
        createdAt: new Date().toISOString(),
        authorId: session.userId,
        authorName: session.displayName || session.username,
      };
      addPost(newPost);
      setLoading(false);
      navigate(`/blog/${newPostId}`, { replace: true });
    }
  }

  /**
   * Handle cancel action — navigate back to blogs list.
   */
  function handleCancel() {
    if (isEditMode && id) {
      navigate(`/blog/${id}`);
    } else {
      navigate('/blogs');
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-surface-500">Loading post…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-surface-900">
            {isEditMode ? 'Edit Post' : 'Write a New Post'}
          </h1>
          <p className="mt-1 text-sm text-surface-600">
            {isEditMode
              ? 'Update your blog post below.'
              : 'Share your thoughts with the world.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-surface-700"
              >
                Title
              </label>
              <span className="text-xs text-surface-500">
                {title.length}/{TITLE_MAX_LENGTH}
              </span>
            </div>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title"
              maxLength={TITLE_MAX_LENGTH}
              className="mt-1 block w-full rounded-lg border border-surface-300 px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-surface-700"
              >
                Content
              </label>
              <span className="text-xs text-surface-500">
                {content.length}/{CONTENT_MAX_LENGTH}
              </span>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post content here…"
              rows={16}
              maxLength={CONTENT_MAX_LENGTH}
              className="mt-1 block w-full rounded-lg border border-surface-300 px-4 py-3 text-sm text-surface-900 placeholder-surface-400 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-surface-200 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md bg-surface-100 px-4 py-2.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`rounded-md px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                loading
                  ? 'cursor-not-allowed bg-primary-400'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {loading
                ? 'Saving…'
                : isEditMode
                  ? 'Update Post'
                  : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}