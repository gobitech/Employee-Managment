// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token, redirect to the login page
    return <Navigate to="/login" />;
  }

  // If there is a token, render the child component (e.g., Dashboard)
  return children;
}

export default ProtectedRoute;