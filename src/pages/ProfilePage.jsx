
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  BookOpen,
  Palette,
  Bell,
  ShieldCheck,
  Info,
  ChevronRight,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const settingItems = [
  {
    title: "โปรไฟล์ผู้ใช้",
    description: "จัดการชื่อและข้อมูลส่วนตัว",
    path: "/settings/account",
    Icon: UserRound,
  },
  {
    title: "การตั้งค่าการอ่านและระบบแนะนำ",
    description: "ปรับความสนใจและหมวดหนังสือ",
    path: "/settings/reading",
    Icon: BookOpen,
  },
  {
    title: "ธีมและการแสดงผล",
    description: "ตั้งค่าธีมและขนาดตัวอักษร",
    path: "/settings/appearance",
    Icon: Palette,
  },
  {
    title: "การแจ้งเตือน",
    description: "จัดการการแจ้งเตือนของเว็บไซต์",
    path: "/settings/notifications",
    Icon: Bell,
  },
  {
    title: "บัญชีและความปลอดภัย",
    description: "จัดการรหัสผ่านและออกจากระบบ",
    path: "/settings/profile",
    Icon: ShieldCheck,
  },
  {
    title: "เกี่ยวกับแอป",
    description: "ข้อมูลและรายละเอียด Let's Read",
    path: "/settings/about",
    Icon: Info,
  },
];

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        console.error("Get user error:", error.message);
        return;
      }

      setUser(data.user);
    });

    return () => {
      active = false;
    };
  }, []);

  const username =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "นักอ่าน";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-10">
      <section className="rounded-3xl border border-[#F0E1DA] bg-[#FFF8F5] p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#F3D5C9] text-[#865B4D]">
            <UserRound size={40} />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#352923]">
              {username}
            </h1>

            <p className="mt-1 break-all text-sm text-gray-500">
              {user?.email || "กำลังโหลดข้อมูล..."}
            </p>

            <p className="mt-2 text-sm text-[#A56B57]">
              Let's Read Member
            </p>
          </div>
        </div>
      </section>

      <section className="mt-7">
        <h2 className="mb-4 text-lg font-bold text-[#352923]">
          ตั้งค่าแอปพลิเคชัน
        </h2>

        <div className="overflow-hidden rounded-2xl border border-[#F0E1DA] bg-white">
          {settingItems.map(({ title, description, path, Icon }, index) => (
            <Link
              key={`${title}-${index}`}
              to={path}
              className="flex items-center gap-4 border-b border-[#F5EAE5] p-4 no-underline transition last:border-b-0 hover:bg-[#FFF8F5] sm:p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBEAE4] text-[#A66B57]">
                <Icon size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#352923]">
                  {title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {description}
                </p>
              </div>

              <ChevronRight
                size={20}
                className="shrink-0 text-gray-400"
              />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
