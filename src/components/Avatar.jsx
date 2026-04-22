import React from 'react';
import PropTypes from 'prop-types';

/**
 * Returns a styled avatar JSX element based on the user's role.
 * Admin: crown emoji (👑) with violet background.
 * User: book emoji (📖) with indigo background.
 * @param {'admin' | 'user'} role - The role of the user.
 * @returns {JSX.Element} A styled avatar element.
 */
export function getAvatar(role) {
  if (role === 'admin') {
    return (
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-200 text-violet-800 text-sm font-semibold select-none"
        title="Admin"
        aria-label="Admin avatar"
      >
        👑
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-200 text-indigo-800 text-sm font-semibold select-none"
      title="User"
      aria-label="User avatar"
    >
      📖
    </span>
  );
}

/**
 * Avatar React component that renders a role-based avatar.
 * @param {{ role: 'admin' | 'user', className: string }} props
 */
export function Avatar({ role, className }) {
  return (
    <span className={className || ''}>
      {getAvatar(role)}
    </span>
  );
}

Avatar.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']).isRequired,
  className: PropTypes.string,
};

Avatar.defaultProps = {
  className: '',
};

export default Avatar;