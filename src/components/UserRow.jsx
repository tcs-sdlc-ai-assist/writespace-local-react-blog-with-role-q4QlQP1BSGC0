import PropTypes from 'prop-types';
import { Avatar } from './Avatar';

export function UserRow({ user, currentUserId, onDelete }) {
  const isDefaultAdmin = user.id === '1' && user.role === 'admin';
  const isSelf = user.id === currentUserId;
  const deleteDisabled = isDefaultAdmin || isSelf;

  let deleteTooltip = 'Delete user';
  if (isDefaultAdmin) {
    deleteTooltip = 'Cannot delete the default admin';
  } else if (isSelf) {
    deleteTooltip = 'Cannot delete your own account';
  }

  const formattedDate = (() => {
    try {
      const date = new Date(user.createdAt);
      if (isNaN(date.getTime())) return 'Unknown';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  })();

  const roleBadge =
    user.role === 'admin' ? (
      <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800">
        Admin
      </span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
        User
      </span>
    );

  return (
    <div className="flex items-center justify-between rounded-lg border border-surface-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-4">
        <Avatar role={user.role} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-surface-900">
              {user.displayName}
            </span>
            {roleBadge}
          </div>
          <span className="text-xs text-surface-600">@{user.username}</span>
          <span className="mt-0.5 text-xs text-surface-500">
            Joined {formattedDate}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (!deleteDisabled) {
            onDelete(user.id);
          }
        }}
        disabled={deleteDisabled}
        title={deleteTooltip}
        aria-label={deleteTooltip}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          deleteDisabled
            ? 'cursor-not-allowed bg-surface-100 text-surface-400'
            : 'bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1'
        }`}
      >
        Delete
      </button>
    </div>
  );
}

UserRow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
    createdAt: PropTypes.string,
  }).isRequired,
  currentUserId: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};