import { Routes, Route } from "react-router-dom";
import { Headbar } from "./components/Headbar";
import HomePage from "./pages/HomePage";
import FeedPage from "./pages/FeedPage";
import SwipePage from "./pages/SwipePage";
import LibraryPage from "./pages/LibraryPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Headbar />
      <main className="max-w-6xl mx-auto mt-6 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/swipe" element={<SwipePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}