import { Routes, Route, useLocation } from "react-router-dom";
import { Headbar } from "./components/Headbar";
import HomePage from "./pages/HomePage";
import FeedPage from "./pages/FeedPage";
import SwipePage from "./pages/SwipePage";
import LibraryPage from "./pages/LibraryPage";
import ProfilePage from "./pages/ProfilePage";
import Swipeforbooks from "./pages/Swipeforbooks";
import ResultPage from "./pages/ResultPage";
import LoginPage from "./pages/LoginPage";
import SigninPage from "./pages/SigninPage";
import LeaderboardPage from "./pages/Leaderboard";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LandingPage from "./pages/LandingPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";
import SettingsPage from "./pages/SettingsPage";
import { BottomBar } from "./components/Bottombar";
import ViralBooksPage from "./pages/ViralBooksPage";
import Top100Page from "./pages/Top100Page";
export default function App() {
  const location = useLocation();
  const showHeadbar = ![
    "/",
    "/Login",
    "/Signin",
    "/forgotpass",
    "/reset-password",
  ].includes(location.pathname);
  const isAuthPage = [
    "/Login",
    "/Signin",
    "/forgotpass",
    "/reset-password",
  ].includes(location.pathname);
  return (
    <div
      className={`min-h-screen flex flex-col w-full ${
        isAuthPage
          ? "bg-gradient-to-tr from-[#dce7f8] via-[#f7e4e5] to-[#fdedcd]"
          : "bg-[#FCD8CD]"
      }`}
    >
      {/* PC และ iPad */}
      {showHeadbar && (
        <div className="hidden md:block w-full">
          <Headbar />
        </div>
      )}

      {/* Mobile */}
      {showHeadbar && (
        <div className="md:hidden">
          <BottomBar />
        </div>
      )}

      <main
  className={`w-full min-w-0 flex-1 ${
    showHeadbar ? "pb-24 md:pb-0" : ""
  }`}
>
  <div className="mx-auto w-full min-w-0 max-w-6xl">
    <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/swipe"
            element={
              <ProtectedRoute>
                <SwipePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/swipeforbooks"
            element={
              <ProtectedRoute>
                <Swipeforbooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Result"
            element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            }
          />
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/Signin" element={<SigninPage />} />
          <Route path="/forgotpass" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route
            path="/settings/reading"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings/appearance"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings/notifications"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings/account"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings/about"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/profile"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/viral-books" element={<ViralBooksPage />} />
      <Route path="/top-100" element={<Top100Page />} />
        </Routes>
  </div>
        
      </main>
    </div>
  );
}
