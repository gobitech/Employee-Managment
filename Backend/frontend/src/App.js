// src/App.js
import React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';

// MUI Imports
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

// Your Component Imports
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div>
      {/* NEW: Professional AppBar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Payroll System
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">Register</Button>
          <Button color="inherit" component={RouterLink} to="/login">Login</Button>
        </Toolbar>
      </AppBar>

      {/* Page content will be rendered below the AppBar */}
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
    </div>
  );
}

export default App;