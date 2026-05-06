/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const MemberDashboard = lazy(() => import('./pages/MemberDashboard'));
const MerchandisePage = lazy(() => import('./pages/MerchandisePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      <p className="text-brand font-black uppercase tracking-[0.3em] text-xs animate-pulse">3RD WAY FITNESS</p>
    </div>
  </div>
);

const PrivateRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-black text-white font-sans">
            <Navbar />
            <main>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/merchandise" element={<MerchandisePage />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <PrivateRoute>
                        <MemberDashboard />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <PrivateRoute>
                        <ProfilePage />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/admin/*" 
                    element={
                      <PrivateRoute adminOnly>
                        <AdminDashboard />
                      </PrivateRoute>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <ToastContainer />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
