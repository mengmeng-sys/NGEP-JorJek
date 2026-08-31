import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "@/components/shared/Navbar";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import PostDetailPage from "@/pages/PostDetailPage";
import TagFeedPage from "@/pages/TagFeedPage";
import ProfilePage from "@/pages/ProfilePage";
import SearchPage from "@/pages/SearchPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ExplorePage from "@/pages/ExplorePage";
import SavedPage from "@/pages/SavedPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Navbar appears on every page */}
      <Navbar isLoggedIn={true} userInitials="YO" />
      
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/posts" element={<Navigate to="/" replace />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/tags/:tag" element={<TagFeedPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/saved" element={<SavedPage />} />
        </Routes>
    </div>
  );
}