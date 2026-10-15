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
      className={`min-h-screen flex flex-col items-center ${
        isAuthPage
          ? "bg-gradient-to-tr from-[#dce7f8] via-[#f7e4e5] to-[#fdedcd]"
          : "bg-[#FCD8CD]"
      }`}
    >
      {showHeadbar && <Headbar />}
      <main className="w-full max-w-6xl flex justify-center">
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
        </Routes>
      </main>
    </div>
  );
}
