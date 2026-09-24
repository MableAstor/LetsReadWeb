import { Routes, Route } from "react-router-dom";
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
export default function App() {
  return (
    <div className="min-h-screen bg-[#FCD8CD] p-4 flex flex-col items-center">
      <Headbar />
      <main className="w-full max-w-6xl mt-6 flex justify-center">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/swipe" element={<SwipePage />} />
          <Route path="/swipeforbooks" element={<Swipeforbooks />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/Result" element={<ResultPage />} />
          <Route path="/Login"element={<LoginPage/>}/>
          <Route path ="/forgotpass"element={<ForgotPasswordPage/>}/>
        </Routes>
      </main>
    </div>
  );
}