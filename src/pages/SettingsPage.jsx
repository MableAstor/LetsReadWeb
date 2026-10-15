
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import SettingsLayout from "../components/SettingsLayout";

const categories = [
  "นิยาย",
  "แฟนตาซี",
  "สืบสวนสอบสวน",
  "โรแมนซ์",
  "ไซไฟ",
  "พัฒนาตนเอง",
  "จิตวิทยา",
  "ประวัติศาสตร์",
];

function readSaved(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export default function SettingsPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const [interests, setInterests] = useState(
    () => readSaved("letsread-interests", [])
  );
  const [theme, setTheme] = useState(
    () => readSaved("letsread-theme", "light")
  );
  const [fontSize, setFontSize] = useState(
    () => readSaved("letsread-font-size", "normal")
  );
  const [notifications, setNotifications] = useState(
    () =>
      readSaved("letsread-notifications", {
        reviews: true,
        rewards: true,
        recommendations: true,
      })
  );

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        console.error("Get user error:", error.message);
        return;
      }

      setUser(data.user);
      setUsername(
        data.user?.user_metadata?.username ||
        data.user?.user_metadata?.full_name ||
        ""
      );
    });

    return () => {
      active = false;
    };
  }, []);

  // ใช้ class dark ของ Tailwind หากโปรเจกต์ตั้งค่า dark mode แบบ class ไว้
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("letsread-theme", JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      "letsread-font-size",
      JSON.stringify(fontSize)
    );
  }, [fontSize]);


const pageInfo = {
  "/settings/reading": {
    title: "การตั้งค่าการอ่าน",
    description: "เลือกหมวดหนังสือที่สนใจและปรับความชอบสำหรับระบบแนะนำ",
  },
  "/settings/appearance": {
    title: "ธีมและการแสดงผล",
    description: "ปรับธีมและขนาดตัวอักษรให้เหมาะกับการอ่าน",
  },
  "/settings/notifications": {
    title: "การแจ้งเตือน",
    description: "เลือกประเภทการแจ้งเตือนที่ต้องการรับ",
  },
  "/settings/profile": {
    title: "โปรไฟล์ผู้ใช้",
    description: "จัดการชื่อผู้ใช้และข้อมูลโปรไฟล์ของคุณ",
  },
  "/settings/account": {
    title: "บัญชีและความปลอดภัย",
    description: "เปลี่ยนรหัสผ่านและออกจากระบบ",
  },
  "/settings/about": {
    title: "เกี่ยวกับ Let's Read",
    description: "ข้อมูลเกี่ยวกับเว็บไซต์และโครงการ Let's Read",
  },
};


  const page = pageInfo[pathname] || pageInfo["/settings/about"];

  const toggleInterest = (category) => {
    setInterests((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const saveReading = () => {
    localStorage.setItem(
      "letsread-interests",
      JSON.stringify(interests)
    );
    setMessage("บันทึกหมวดหนังสือที่สนใจแล้ว");
  };

  const saveNotifications = () => {
    localStorage.setItem(
      "letsread-notifications",
      JSON.stringify(notifications)
    );
    setMessage("บันทึกการตั้งค่าการแจ้งเตือนแล้ว");
  };

  const saveProfile = async () => {
    if (!username.trim()) {
      setMessage("กรุณากรอกชื่อผู้ใช้");
      return;
    }

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase.auth.updateUser({
      data: { username: username.trim() },
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setUser(data.user);
    setMessage("บันทึกชื่อผู้ใช้แล้ว");
  };

  const changePassword = async () => {
    if (password.length < 6) {
      setMessage("รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setMessage("เปลี่ยนรหัสผ่านสำเร็จ");
  };

  const logout = async () => {
    const confirmed = window.confirm("ต้องการออกจากระบบหรือไม่?");
    if (!confirmed) return;

    setSaving(true);

    const { error } = await supabase.auth.signOut();

    setSaving(false);

    if (error) {
      setMessage("ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง");
      return;
    }

    navigate("/Login", { replace: true });
  };

  const toggleNotification = (key) => {
    setNotifications((current) => ({
      ...current,
      [key]: !current[key],
    }));
    setMessage("");
  };

  return (
    <SettingsLayout
      title={page.title}
      description={page.description}
    >
      {message && (
        <p
          role="status"
          className="mb-5 rounded-xl bg-[#FFF0E9] p-3 text-sm text-[#925943]"
        >
          {message}
        </p>
      )}

      {pathname === "/settings/reading" && (
        <div>
          <h2 className="mb-2 font-semibold text-gray-800">
            หมวดหนังสือที่สนใจ
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            เลือกได้มากกว่าหนึ่งหมวด และเปลี่ยนแปลงภายหลังได้
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#F0E1DA] p-4 transition hover:bg-[#FFF8F5]"
              >
                <input
                  type="checkbox"
                  checked={interests.includes(category)}
                  onChange={() => toggleInterest(category)}
                  className="h-4 w-4 accent-[#B66D57]"
                />
                <span className="text-sm text-gray-700">
                  {category}
                </span>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={saveReading}
            className="mt-6 rounded-xl bg-[#B66D57] px-5 py-3 font-medium text-white hover:bg-[#9D5945]"
          >
            บันทึกการตั้งค่า
          </button>

          <p className="mt-3 text-xs text-gray-500">
            ขณะนี้ระบบเก็บหมวดที่เลือกไว้ในเบราว์เซอร์ก่อน
            ยังไม่ได้เชื่อมกับคะแนนของระบบแนะนำหนังสือโดยตรง
          </p>
        </div>
      )}

      {pathname === "/settings/appearance" && (
        <div className="space-y-6">
          <div>
            <label className="mb-3 block font-semibold text-gray-800">
              ธีมเว็บไซต์
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "light", label: "สว่าง", icon: "☀️" },
                { value: "dark", label: "มืด", icon: "🌙" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={`rounded-xl border p-4 text-left ${
                    theme === option.value
                      ? "border-[#B66D57] bg-[#FFF0E9] text-[#925943]"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              ธีมมืดจะทำงานได้เต็มรูปแบบเมื่อเพิ่ม dark: classes
              ให้ส่วนต่าง ๆ ของเว็บไซต์แล้ว
            </p>
          </div>

          <div>
            <label
              htmlFor="font-size"
              className="mb-3 block font-semibold text-gray-800"
            >
              ขนาดตัวอักษร
            </label>
            <select
              id="font-size"
              value={fontSize}
              onChange={(event) => setFontSize(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-800"
            >
              <option value="small">เล็ก</option>
              <option value="normal">ปกติ</option>
              <option value="large">ใหญ่</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">
              บันทึกตัวเลือกไว้แล้ว แต่การเปลี่ยนขนาดตัวอักษรทั้งเว็บ
              ต้องนำค่านี้ไปใช้กับ layout เพิ่มเติม
            </p>
          </div>
        </div>
      )}

      {pathname === "/settings/notifications" && (
        <div className="space-y-3">
          {[
            {
              key: "reviews",
              label: "รีวิวและความคิดเห็น",
              description: "กิจกรรมเกี่ยวกับรีวิวหนังสือ",
            },
            {
              key: "rewards",
              label: "รางวัลและ EXP",
              description: "ความสำเร็จและรางวัลจากการใช้งาน",
            },
            {
              key: "recommendations",
              label: "หนังสือแนะนำ",
              description: "หนังสือที่อาจตรงกับความสนใจของคุณ",
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-center gap-4 rounded-xl border border-[#F0E1DA] p-4"
            >
              <span className="flex-1">
                <span className="block font-medium text-gray-800">
                  {item.label}
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  {item.description}
                </span>
              </span>
              <input
                type="checkbox"
                checked={Boolean(notifications[item.key])}
                onChange={() => toggleNotification(item.key)}
                className="h-5 w-5 accent-[#B66D57]"
              />
            </label>
          ))}

          <button
            type="button"
            onClick={saveNotifications}
            className="mt-3 rounded-xl bg-[#B66D57] px-5 py-3 font-medium text-white hover:bg-[#9D5945]"
          >
            บันทึกการตั้งค่า
          </button>

          <p className="text-xs text-gray-500">
            ตัวเลือกนี้เก็บการตั้งค่าไว้ในเบราว์เซอร์
            ยังไม่ได้เชื่อมระบบส่งการแจ้งเตือนจริง
          </p>
        </div>
      )}

      
{pathname === "/settings/profile" && (
  <section>
    <div className="mb-6 flex items-center gap-4 rounded-2xl bg-[#FFF8F5] p-5">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#F3D5C9] text-[#865B4D]">
        <span className="text-2xl font-bold">
          {(username || user?.email || "U")
            .charAt(0)
            .toUpperCase()}
        </span>
      </div>

      <div className="min-w-0">
        <h2 className="break-words text-lg font-bold text-[#352923]">
          {username || "นักอ่าน"}
        </h2>
        <p className="break-all text-sm text-gray-500">
          {user?.email || "กำลังโหลดข้อมูล..."}
        </p>
      </div>
    </div>

    <label
      htmlFor="profile-username"
      className="mb-2 block text-sm font-medium text-gray-700"
    >
      ชื่อผู้ใช้
    </label>

    <input
      id="profile-username"
      type="text"
      value={username}
      onChange={(event) => {
        setUsername(event.target.value);
        setMessage("");
      }}
      maxLength={40}
      placeholder="กรอกชื่อผู้ใช้"
      className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#B66D57]"
    />

    <p className="mt-2 text-xs text-gray-500">
      ชื่อนี้จะแสดงบนโปรไฟล์ของคุณ
    </p>

    <button
      type="button"
      onClick={saveProfile}
      disabled={saving}
      className="mt-5 rounded-xl bg-[#B66D57] px-5 py-3 font-medium text-white transition hover:bg-[#9D5945] disabled:opacity-60"
    >
      {saving ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
    </button>
  </section>
)}


      {pathname === "/settings/account" && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 font-semibold text-gray-800">
              เปลี่ยนรหัสผ่าน
            </h2>

            <label
              htmlFor="new-password"
              className="mb-2 block text-sm text-gray-600"
            >
              รหัสผ่านใหม่
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mb-4 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#B66D57]"
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />

            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm text-gray-600"
            >
              ยืนยันรหัสผ่านใหม่
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-[#B66D57]"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
            />

            <button
              type="button"
              onClick={changePassword}
              disabled={saving}
              className="mt-4 rounded-xl border border-[#B66D57] px-5 py-3 font-medium text-[#A35E49] hover:bg-[#FFF8F5] disabled:opacity-60"
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h2 className="font-semibold text-gray-800">
              ออกจากระบบ
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              คุณจะต้องเข้าสู่ระบบอีกครั้งเพื่อใช้งานหน้าที่ต้อง Login
            </p>

            <button
              type="button"
              onClick={logout}
              disabled={saving}
              className="mt-4 rounded-xl border border-red-200 px-5 py-3 font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              {saving ? "กำลังดำเนินการ..." : "ออกจากระบบ"}
            </button>
          </section>
        </div>
      )}

      {pathname === "/settings/about" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-2xl bg-[#FFF8F5] p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3D5C9] text-[#865B4D]">
              <span className="text-xl font-bold">LR</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#352923]">
                Let's Read
              </h2>
              <p className="text-sm text-gray-500">
                Discover your next favorite book
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">เวอร์ชัน</p>
            <p className="mt-1 font-medium text-gray-800">
              1.0.0 (เวอร์ชันโครงการ)
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <p className="font-medium text-gray-800">
              เกี่ยวกับโครงการ
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Let's Read เป็นเว็บไซต์สำหรับค้นหาหนังสือ
              สำรวจหนังสือที่น่าสนใจ และแบ่งปันรีวิวกับชุมชนนักอ่าน
            </p>
          </div>
        </div>
      )}
    </SettingsLayout>
  );
}
