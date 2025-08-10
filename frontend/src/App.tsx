import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import TaxCalculator from './components/TaxCalculator';
import TaxHistory from './components/TaxHistory';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';

function App() {
  return (
    <AuthProvider>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Header />
        <Routes>
          <Route path="/login" element={
            <Container maxWidth="xl" sx={{ py: 3 }}>
              <Login />
            </Container>
          } />
          <Route path="/signup" element={
            <Container maxWidth="xl" sx={{ py: 3 }}>
              <Signup />
            </Container>
          } />
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={
            <Container maxWidth="xl" sx={{ py: 3 }}>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Container>
          } />
          <Route path="/calculator" element={
            <Container maxWidth="xl" sx={{ py: 3 }}>
              <ProtectedRoute>
                <TaxCalculator />
              </ProtectedRoute>
            </Container>
          } />
          <Route path="/history" element={
            <Container maxWidth="xl" sx={{ py: 3 }}>
              <ProtectedRoute>
                <TaxHistory />
              </ProtectedRoute>
            </Container>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </AuthProvider>
  );
}

export default App;
