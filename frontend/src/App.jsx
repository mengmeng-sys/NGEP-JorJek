import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { OnlineProvider } from "@/context/OnlineContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/shared/Navbar";

// Core Pages
import HomePage from "@/pages/HomePage";
import PostDetailPage from "@/pages/PostDetailPage";
import TagFeedPage from "@/pages/TagFeedPage";
import SearchPage from "@/pages/SearchPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ExplorePage from "@/pages/ExplorePage";
import SavedPage from "@/pages/SavedPage";
import SettingsPage from "@/pages/SettingsPage";
import PopularPage from "@/pages/PopularPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import UserProfilePage from "@/pages/UserProfilePage";
import RequestSessionPage from "@/pages/RequestSessionPage";

// Dedicated Authentication & Onboarding Pages
import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import SignupPage from "@/pages/auth/SignupPage";
import OtpVerificationPage from "@/pages/auth/OtpVerificationPage";
import TechInterestsPage from "@/pages/auth/TechInterestsPage";
import MfaSetupPage from "@/pages/auth/MfaSetupPage";

// Admin Dashboard
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminOverviewPage from "@/pages/admin/AdminOverviewPage";
import UserDirectoryPage from "@/pages/admin/UserDirectoryPage";
import ModerationFeedPage from "@/pages/admin/ModerationFeedPage";
import MentorPipelinePage from "@/pages/admin/MentorPipelinePage";
import TagsTopicsPage from "@/pages/admin/TagsTopicsPage";
import BackupRecoveryPage from "@/pages/admin/BackupRecoveryPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <OnlineProvider>
            <AppRoutes />
          </OnlineProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Split out from App so it can call useAuth() — AuthProvider is created by
// App itself, so App's own body sits outside that context; a child does not.
function AppRoutes() {
  const { pathname } = useLocation();
  const { isAdmin, loading } = useAuth();
  const hideNavbar = pathname.startsWith('/auth/login')
    || pathname.startsWith('/auth/signup')
    || pathname.startsWith('/auth/forgot-password')
    || pathname.startsWith('/auth/verify-otp')
    || pathname.startsWith('/auth/tech-interests')
    || pathname.startsWith('/auth/mfa-setup')
    || pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#FBFBFB] dark:bg-gray-950 transition-colors">
      {/* Global Responsive Header (hidden on auth pages) */}
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Core Feeds & Discovery */}
        <Route path="/" element={<HomePage />} />
        <Route path="/popular" element={<PopularPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/saved" element={<SavedPage />} />

        {/* Discussions & Posts */}
        <Route path="/posts" element={<Navigate to="/" replace />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/tags/:tag" element={<TagFeedPage />} />

        {/* User Profiles & Management */}
        <Route path="/user/:username" element={<UserProfilePage />} />
        <Route path="/user" element={<UserProfilePage />} />
        <Route path="/profile" element={<Navigate to="/user" replace />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Mentoring Sessions */}
        <Route path="/request-session/:mentorId" element={<RequestSessionPage />} />

        {/* Platform Info & Footer */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Utility Views */}
        <Route path="/search" element={<SearchPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Authentication Flow */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/verify-otp" element={<OtpVerificationPage />} />
        <Route path="/auth/tech-interests" element={<TechInterestsPage />} />
        <Route path="/auth/mfa-setup" element={<MfaSetupPage />} />

        {/* Canonical Redirects */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="users" element={<UserDirectoryPage />} />
          <Route path="moderation" element={<ModerationFeedPage />} />
          <Route path="mentors" element={<MentorPipelinePage />} />
          <Route path="tags" element={<TagsTopicsPage />} />
          <Route path="backup" element={<BackupRecoveryPage />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
