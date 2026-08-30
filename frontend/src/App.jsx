import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/shared/Navbar";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import NewPostPage from "@/pages/NewPostPage";
import PostDetailPage from "@/pages/PostDetailPage";
import TagFeedPage from "@/pages/TagFeedPage";
import ProfilePage from "@/pages/ProfilePage";
import SearchPage from "@/pages/SearchPage";
import NotificationsPage from "@/pages/NotificationsPage";

// All routes live here instead of in a file-based app/ directory (that's
// a Next.js convention we're not using). Add a new page by creating it
// under src/pages/ and registering the route below.
export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/posts/new" element={<NewPostPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/tags/:tag" element={<TagFeedPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </>
  );
}
