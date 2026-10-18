
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function LandingPageHeader() {
  return (
    <header className="mx-auto my-4 flex w-full max-w-6xl items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm sm:px-8">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2"
        aria-label="Let's Read Home"
      >
        <BookOpen className="h-7 w-7 text-black stroke-[1.5]" />

        <span className="text-xl font-bold tracking-tight text-black">
          Let's Read
        </span>
      </Link>

      {/* Auth Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          asChild
          variant="secondary"
          className="rounded-full bg-gray-200/70 px-4 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-200 sm:px-5"
        >
          <Link to="/Login">Log in</Link>
        </Button>

        <Button
          asChild
          className="rounded-full bg-[#FCE4E4] px-4 text-sm font-semibold text-gray-800 transition-colors hover:bg-[#fbd0d0] sm:px-5"
        >
          <Link to="/Signin">Sign in</Link>
        </Button>
      </div>
    </header>
  );
}
