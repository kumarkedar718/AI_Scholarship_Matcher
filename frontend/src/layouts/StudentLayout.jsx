import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { StudentSidebar } from '../components/common/Sidebar';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const StudentLayout = () => {
  const { isAuthenticated, isStudent, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Authenticating student session..." />;
  }

  if (!isAuthenticated || !isStudent) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <StudentSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};
