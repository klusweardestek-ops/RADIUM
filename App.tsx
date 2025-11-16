
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';
import SongDetailsPage from './pages/SongDetailsPage';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.ADMIN]}>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/song/:songId"
          element={
            <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.ADMIN]}>
              <SongDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.ADMIN]}>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Layout>
  );
};

export default App;