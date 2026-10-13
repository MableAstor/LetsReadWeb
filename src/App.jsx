import { Routes, Route, useLocation } from "react-router-dom";
import { Headbar } from "./components/Headbar";
import HomePage from "./pages/HomePage";
import FeedPage from "./pages/FeedPage";
import SwipePage from "./pages/SwipePage";
import LibraryPage from "./pages/LibraryPage";
import ProfilePage from "./pages/ProfilePage";
import Swipeforbooks from "./pages/Swipeforbooks";
import ResultPage from"./pages/ResultPage"; 
import LoginPage from"./pages/LoginPage";
import SigninPage from"./pages/SigninPage";
import LeaderboardPage from "./pages/Leaderboard";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LandingPage from "./pages/LandingPage";
export default function App() {
  const location = useLocation();
  const showHeadbar = !["/", "/Login", "/Signin", "/forgotpass"].includes(location.pathname);
  const isAuthPage = ["/Login", "/Signin", "/forgotpass"].includes(location.pathname);
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
          <Route path="/home" element={<HomePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/swipe" element={<SwipePage />} />
          <Route path="/swipeforbooks" element={<Swipeforbooks />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/Result" element={<ResultPage />} />
          <Route path="/Login"element={<LoginPage/>}/>
          <Route path="/Signin"element={<SigninPage/>}/>
          <Route path ="/forgotpass"element={<ForgotPasswordPage/>}/>
        </Routes>
      </main>
    </div>
  );
}