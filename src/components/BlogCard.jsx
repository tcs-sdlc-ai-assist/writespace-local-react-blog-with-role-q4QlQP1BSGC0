import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getAvatar } from './Avatar';

/**
 * Truncates content to a specified maximum length, appending ellipsis if needed.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - Maximum character length.
 * @returns {string} Truncated text.
 */
function truncate(text, maxLength = 150) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Formats an ISO date string to a human-readable format.
 * @param {string} dateString - ISO date string.
 * @returns {string} Formatted date string.
 */
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
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
 * BlogCard component displays a blog post preview in a card layout.
 * Shows title, excerpt, date, author avatar/name, and an edit icon
 * for admins (all posts) or the post owner.
 *
 * @param {{ post: Object, currentUser: Object|null }} props
 */
export function BlogCard({ post, currentUser }) {
  const { id, title, content, createdAt, authorId, authorName } = post;

  const excerpt = truncate(content, 150);

  const authorRole = currentUser && currentUser.userId === authorId && currentUser.role === 'admin'
    ? 'admin'
    : currentUser && authorId === '1'
      ? 'admin'
      : 'user';

  const canEdit =
    currentUser &&
    (currentUser.role === 'admin' || currentUser.userId === authorId);

  return (
    <div className="flex flex-col rounded-lg border border-surface-200 bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden">
      <Link to={`/blog/${id}`} className="flex-1 p-5">
        <h3 className="text-lg font-bold text-surface-900 line-clamp-2 hover:text-primary-600 transition-colors">
          {title || 'Untitled'}
        </h3>
        {excerpt && (
          <p className="mt-2 text-sm text-surface-600 line-clamp-3">
            {excerpt}
          </p>
        )}
      </Link>
      <div className="flex items-center justify-between border-t border-surface-100 px-5 py-3">
        <div className="flex items-center gap-2">
          {getAvatar(authorRole)}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-surface-800">
              {authorName || 'Unknown'}
            </span>
            {createdAt && (
              <span className="text-xs text-surface-500">
                {formatDate(createdAt)}
              </span>
            )}
          </div>
        </div>
        {canEdit && (
          <Link
            to={`/edit/${id}`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-surface-500 hover:bg-surface-100 hover:text-primary-600 transition-colors"
            title="Edit post"
            aria-label="Edit post"
            onClick={(e) => e.stopPropagation()}
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
        )}
      </div>
    </div>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    authorId: PropTypes.string.isRequired,
    authorName: PropTypes.string.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
  }),
};

BlogCard.defaultProps = {
  currentUser: null,
};

export default BlogCard;