import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { VerifyEmailPage } from './pages/public/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Student Pages
import { BrowseScholarships } from './pages/student/BrowseScholarships';
import { ScholarshipDetailsPage } from './pages/student/ScholarshipDetailsPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ProfilePage } from './pages/student/ProfilePage';
import { AIRecommendationsPage } from './pages/student/AIRecommendationsPage';
import { AISearchPage } from './pages/student/AISearchPage';
import { SavedScholarshipsPage } from './pages/student/SavedScholarshipsPage';
import { ApplicationsTrackerPage } from './pages/student/ApplicationsTrackerPage';
import { NotificationsPage } from './pages/student/NotificationsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { ManageScholarships } from './pages/admin/ManageScholarships';
import { ScholarshipEditorPage } from './pages/admin/ScholarshipEditorPage';
import { ManageStudents } from './pages/admin/ManageStudents';

export function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/scholarships" element={<BrowseScholarships />} />
              <Route path="/scholarships/:id" element={<ScholarshipDetailsPage />} />
              <Route path="/student/ai-search" element={<AISearchPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Protected Student Routes */}
            <Route element={<StudentLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<ProfilePage />} />
              <Route path="/student/recommendations" element={<AIRecommendationsPage />} />
              <Route path="/student/saved" element={<SavedScholarshipsPage />} />
              <Route path="/student/applications" element={<ApplicationsTrackerPage />} />
              <Route path="/student/notifications" element={<NotificationsPage />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
              <Route path="/admin/scholarships" element={<ManageScholarships />} />
              <Route path="/admin/scholarships/new" element={<ScholarshipEditorPage />} />
              <Route path="/admin/scholarships/edit/:id" element={<ScholarshipEditorPage />} />
              <Route path="/admin/students" element={<ManageStudents />} />
            </Route>
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
