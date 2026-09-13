import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
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

// Dedicated Authentication & Onboarding Pages
import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import SignupPage from "@/pages/auth/SignupPage";
import OtpVerificationPage from "@/pages/auth/OtpVerificationPage";
import TechInterestsPage from "@/pages/auth/TechInterestsPage";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#FBFBFB]">
        {/* Global Responsive Header */}
        <Navbar />

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

          {/* Canonical Redirects */}
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}