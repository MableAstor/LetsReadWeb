import { NavLink } from "react-router-dom";
import {
  Compass,
  UserRound,
  Heart,
  Layers3,
  LibraryBig,
  Trophy,
} from "lucide-react";

const menus = [
  { label: "Home", icon: Compass, path: "/home" },
  { label: "Feed", icon: Heart, path: "/feed" },
  { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
  { label: "Swipe", icon: Layers3, path: "/swipe" },
  { label: "Library", icon: LibraryBig, path: "/library" },
  { label: "Profile", icon: UserRound, path: "/profile" },
];

export function BottomBar() {
  return (
    <nav className=" fixed bottom-0 left-0 z-50 w-full border-t border-[#edc5ba]  bg-[#FFFAF6]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        {menus.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs transition-colors ${
                isActive
                  ? "bg-[#F7E4DE] font-semibold text-[#8A575B]"
                  : "text-[#8D7775] hover:bg-[#F8EEEA]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                {isActive && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
