import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getRole } from '../utils/auth';

/**
 * Route guard component that checks session in localStorage via auth utility.
 * Redirects unauthenticated users to '/login'.
 * Supports adminOnly prop to redirect non-admins to '/blogs'.
 * Wraps children or renders Outlet.
 *
 * @param {{ adminOnly: boolean, children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function ProtectedRoute({ adminOnly, children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && getRole() !== 'admin') {
    return <Navigate to="/blogs" replace />;
  }

  return children ? children : <Outlet />;
}

ProtectedRoute.propTypes = {
  adminOnly: PropTypes.bool,
  children: PropTypes.node,
};

ProtectedRoute.defaultProps = {
  adminOnly: false,
  children: null,
};

export default ProtectedRoute;