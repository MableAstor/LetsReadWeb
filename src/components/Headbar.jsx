import { Link, useLocation } from "react-router-dom";
import bookIcon from "../assets/Book-open.png";
import profileIcon from "../assets/profile-icon.png";

export const Headbar = () => {
  const location = useLocation(); 
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Feed", path: "/feed" },
    { name: "Swipe", path: "/swipe" },
    { name: "Library", path: "/library" },
  ];

  return (
    <header className="flex w-full max-w-6xl items-center justify-between rounded-2xl bg-white px-8 py-3 shadow-sm mx-auto my-4 border border-gray-100">
      
  
      <Link to="/" className="flex items-center gap-3 no-underline text-black">
        <img src={bookIcon} alt="Book Icon" className="h-7 w-7" />
        <span className="text-xl font-bold tracking-tight">Let&apos;s Read</span>
      </Link>

      <nav>
        <ul className="flex items-center gap-6 list-none m-0 p-0">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`no-underline text-base transition-all ${
                    isActive
                      ? "font-bold text-black"
                      : "font-normal text-gray-700 hover:text-black"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ปุ่ม Profile ไปหน้า /profile */}
      <Link to="/profile" className="flex items-center justify-center">
        <img src={profileIcon} alt="Profile Icon" className="h-8 w-8" />
      </Link>

    </header>
  );
};