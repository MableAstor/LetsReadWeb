
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Bell,
  Compass,
  Heart,
  Layers3,
  LibraryBig,
  Trophy,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Headbar = () => {
  const location = useLocation();

  const navigation = [
    { label: "Home", icon: Compass, path: "/home" },
    { label: "Feed", icon: Heart, path: "/feed" },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { label: "Swipe", icon: Layers3, path: "/swipe" },
    { label: "Library", icon: LibraryBig, path: "/library" },
    { label: "Profile", icon: UserRound, path: "/profile" },
  ];

  return (
    <header className="sticky top-0 z-40 hidden w-full border-b border-[#F0E4DF] bg-[#FFFAF6]/95 backdrop-blur-md md:block">
      {/* จัดเนื้อหาทั้งหมดให้อยู่ตรงกลางจอ */}
      <div className="mx-auto flex h-[76px] w-full max-w-7xl items-center gap-4 px-4 lg:gap-8 lg:px-10">

        {/* Logo */}
        <Link
          to="/home"
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#F6DDD6] text-[#87575B]">
            <BookOpen className="size-5" />
          </span>

          <span>
            <span className="block whitespace-nowrap font-serif text-xl font-bold tracking-tight">
              let's read.
            </span>
            <span className="block whitespace-nowrap text-[10px] tracking-wider text-[#A38B87]">
              YOUR NEXT CHAPTER
            </span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex min-w-0 flex-1 items-center justify-center gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[#F7E4DE] font-medium text-[#8A575B]"
                    : "text-[#8D7775] hover:bg-[#F8EEEA]"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Notification and Profile */}
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="การแจ้งเตือน"
            className="rounded-xl text-[#85676A]"
          >
            <Bell className="size-5" />
          </Button>

          <Link to="/profile">
            <div className="flex size-10 items-center justify-center rounded-full bg-pink-100 text-pink-600 font-semibold text-[#765B83]">
              J
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
