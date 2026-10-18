
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        <Link
          to="/Login"
          className={cn(
            buttonVariants({ variant: "secondary", size: "default" }),
            "h-9 rounded-full bg-gray-200/70 px-4 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-200 sm:px-5"
          )}
        >
          Log in
        </Link>

        <Link
          to="/Signin"
          className={cn(
            buttonVariants({ variant: "default", size: "default" }),
            "h-9 rounded-full bg-[#FCE4E4] px-4 text-sm font-semibold text-gray-800 transition-colors hover:bg-[#fbd0d0] sm:px-5"
          )}
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
