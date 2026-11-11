import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import { Headbar } from "./components/Headbar";
import { BottomBar } from "./components/Bottombar";

import HomePage from "./pages/HomePage";
import FeedPage from "./pages/FeedPage";
import SwipePage from "./pages/SwipePage";
import LibraryPage from "./pages/LibraryPage";
import ProfilePage from "./pages/ProfilePage";
import Swipeforbooks from "./pages/Swipeforbooks";
import ResultPage from "./pages/ResultPage";
import LoginPage from "./pages/LoginPage";
import SigninPage from "./pages/SigninPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LeaderboardPage from "./pages/Leaderboard";
import SettingsPage from "./pages/SettingsPage";
import ViralBooksPage from "./pages/ViralBooksPage";
import Top100Page from "./pages/Top100Page";

export default function App() {
  const location = useLocation();
  const isAuthPage = ["/login", "/signin", "/forgotpass", "/reset-password"].includes(location.pathname.toLowerCase());
  const showNavigation = !isAuthPage;

  return (
    <div className={`min-h-screen flex flex-col w-full ${isAuthPage
      ? "bg-gradient-to-tr from-[#dce7f8] via-[#f7e4e5] to-[#fdedcd]"
      : "bg-[#FCD8CD]"}`}>
      {showNavigation && <div className="hidden md:block w-full"><Headbar /></div>}
      {showNavigation && <div className="md:hidden"><BottomBar /></div>}
      <main className={`w-full min-w-0 flex-1 ${showNavigation ? "pb-24 md:pb-0" : ""}`}>
        <div className="mx-auto w-full min-w-0 max-w-6xl">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/swipe" element={<SwipePage />} />
            <Route path="/swipeforbooks" element={<Swipeforbooks />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/Result" element={<ResultPage />} />
            <Route path="/viral-books" element={<ViralBooksPage />} />
            <Route path="/top-100" element={<Top100Page />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/reading" element={<SettingsPage />} />
            <Route path="/settings/appearance" element={<SettingsPage />} />
            <Route path="/settings/notifications" element={<SettingsPage />} />
            <Route path="/settings/account" element={<SettingsPage />} />
            <Route path="/settings/about" element={<SettingsPage />} />
            <Route path="/settings/profile" element={<Navigate to="/profile" replace />} />
            <Route path="/Login" element={<LoginPage />} />
            <Route path="/Signin" element={<SigninPage />} />
            <Route path="/forgotpass" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
