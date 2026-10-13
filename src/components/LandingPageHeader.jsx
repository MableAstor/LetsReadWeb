import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPageHeader() {
  return (
    <header className="flex w-full max-w-6xl items-center justify-between rounded-2xl bg-white px-8 py-3 shadow-sm mx-auto my-4 border border-gray-100">
      
      <div className="flex items-center gap-2">
        <BookOpen className="w-7 h-7 text-black stroke-[1.5]" />

        <span className="text-xl font-bold tracking-tight text-black">
          Let's Read
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/Login">
          <button className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-800 bg-gray-200/70 hover:bg-gray-200 transition-colors">
            Log in
          </button>
        </Link>

        <Link to="/Signin">
          <button className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-800 bg-[#FCE4E4] hover:bg-[#fbd0d0] transition-colors">
            Sign in
          </button>
        </Link>
      </div>

    </header>
  );
}