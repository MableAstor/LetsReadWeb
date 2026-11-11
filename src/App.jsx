
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

  const isAuthPage = [
    "/Login",
    "/Signin",
    "/forgotpass",
    "/reset-password",
  ].includes(location.pathname);

  // แสดงแถบนำทางทุกหน้าที่ไม่ใช่หน้า Authentication
  const showNavigation = !isAuthPage;

  return (
    <div
      className={`min-h-screen flex flex-col w-full ${
        isAuthPage
          ? "bg-gradient-to-tr from-[#dce7f8] via-[#f7e4e5] to-[#fdedcd]"
          : "bg-[#FCD8CD]"
      }`}
    >
      {/* Desktop และ iPad */}
      {showNavigation && (
        <div className="hidden md:block w-full">
          <Headbar />
        </div>
      )}

      {/* Mobile */}
      {showNavigation && (
        <div className="md:hidden">
          <BottomBar />
        </div>
      )}

      <main
        className={`w-full min-w-0 flex-1 ${
          showNavigation ? "pb-24 md:pb-0" : ""
        }`}
      >
        <div className="mx-auto w-full min-w-0 max-w-6xl">
          <Routes>
            {/* เปิดเว็บมาเข้าหน้า Home เลย */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* หน้าหลัก: เข้าดูได้โดยไม่ต้อง Login */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/swipe" element={<SwipePage />} />
            <Route path="/swipeforbooks" element={<Swipeforbooks />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/Result" element={<ResultPage />} />

            {/* หน้าหนังสือ */}
            <Route path="/viral-books" element={<ViralBooksPage />} />
            <Route path="/top-100" element={<Top100Page />} />

            {/* หน้า Settings เปิดดูได้ แต่การบันทึกค่าต้อง Login */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/reading" element={<SettingsPage />} />
            <Route path="/settings/appearance" element={<SettingsPage />} />
            <Route path="/settings/notifications" element={<SettingsPage />} />
            <Route path="/settings/account" element={<SettingsPage />} />
            <Route path="/settings/about" element={<SettingsPage />} />
            <Route path="/settings/profile" element={<SettingsPage />} />

            {/* Authentication */}
            <Route path="/Login" element={<LoginPage />} />
            <Route path="/Signin" element={<SigninPage />} />
            <Route path="/forgotpass" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* URL ที่ไม่มีอยู่ */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
