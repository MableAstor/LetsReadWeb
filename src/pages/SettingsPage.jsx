import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link} from "react-router-dom";
import {
  Bell,
  BookOpen,
  Check,
  LockKeyhole,
  LogOut,
  Moon,
  Sun,
  UserRound,
  ChevronRight,
  Palette,
  ShieldCheck,
  Info,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import SettingsLayout from "../components/SettingsLayout";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";



const pageInfo = {
  "/settings": ["ตั้งค่า", "จัดการบัญชีและปรับแต่งการใช้งาน"],
  "/settings/reading": [
    "การตั้งค่าการอ่าน",
    "เลือกหมวดหนังสือที่สนใจ เพื่อเตรียมใช้กับระบบแนะนำ",
  ],
  "/settings/appearance": ["ธีมและการแสดงผล", "ปรับธีมและรูปแบบตัวอักษร"],
  "/settings/notifications": [
    "การแจ้งเตือน",
    "เลือกรูปแบบการแจ้งเตือนที่ต้องการ",
  ],
  "/settings/profile": ["โปรไฟล์ผู้ใช้", "แก้ไขชื่อผู้ใช้ที่แสดงใน Let's Read"],
  "/settings/account": ["บัญชีและความปลอดภัย", "เปลี่ยนรหัสผ่านและออกจากระบบ"],
  "/settings/about": [
    "เกี่ยวกับ Let's Read",
    "ข้อมูลเกี่ยวกับแพลตฟอร์มค้นหาและแนะนำหนังสือ",
  ],
};

function readSaved(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function SettingRow({ icon: Icon, label, description, children }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-[#F0E1DA] bg-white p-3 sm:p-4">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-[#A36D70]" />}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#463431]">{label}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const [interests, setInterests] = useState(() => {
    const saved = readSaved("letsread-interests", []);
    return Array.isArray(saved) ? saved : [];
  });
  const [theme, setTheme] = useState(() =>
    readSaved("letsread-theme", "light"),
  );
  const [fontSize, setFontSize] = useState(() =>
    readSaved("letsread-font-size", "normal"),
  );
  const [notifications, setNotifications] = useState(() => ({
    reviews: true,
    rewards: true,
    recommendations: true,
    ...readSaved("letsread-notifications", {}),
  }));

  const showMessage = (text, isError = false) => {
    setMessage(text);
    setMessageError(isError);
  };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        showMessage(`ไม่สามารถโหลดผู้ใช้ได้: ${error.message}`, true);
        return;
      }
      setUser(data.user ?? null);
      if (data.user?.id) {
        supabase.from("User")
          .select("User_Name, User_Avatar_URL")
          .eq("auth_user_id", data.user.id)
          .maybeSingle()
          .then(({ data: profileRow, error: profileError }) => {
            if (profileError) console.error("[Settings] Profile:", profileError);
            if (mounted) setProfile(profileRow ?? null);
          });
      }
      setUsername(
        data.user?.user_metadata?.username ??
          data.user?.user_metadata?.full_name ??
          "",
      );
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Persist only local UI preferences; dark classes work only on screens that support them.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("letsread-theme", JSON.stringify(theme));
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("letsread-font-size", JSON.stringify(fontSize));
  }, [fontSize]);

  const toggleInterest = (category) => {
    if (interests.includes(category)) {
      setInterests((prev) => prev.filter((x) => x !== category));
      setMessage("");
      return;
    }
    if (interests.length >= MAX_INTERESTS) {
      showMessage(`เลือกหมวดหลักได้สูงสุด ${MAX_INTERESTS} หมวด`, true);
      return;
    }
    setInterests((prev) => [...prev, category]);
    setMessage("");
  };

  const saveReading = () => {
    if (interests.length === 0)
      return showMessage("กรุณาเลือกอย่างน้อย 1 หมวด", true);
    localStorage.setItem("letsread-interests", JSON.stringify(interests));
    showMessage("บันทึกหมวดหนังสือในเบราว์เซอร์แล้ว");
  };

  const saveNotifications = () => {
    localStorage.setItem(
      "letsread-notifications",
      JSON.stringify(notifications),
    );
    showMessage("บันทึกการตั้งค่าการแจ้งเตือนในเบราว์เซอร์แล้ว");
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!user) return showMessage("กรุณาเข้าสู่ระบบก่อน", true);
    const clean = username.trim();
    if (!clean) return showMessage("กรุณากรอกชื่อผู้ใช้", true);
    setSaving(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { username: clean },
      });
      if (error) throw error;
      setUser(data.user);
      showMessage("บันทึกชื่อผู้ใช้ในบัญชีแล้ว");
    } catch (error) {
      showMessage(error.message || "บันทึกไม่สำเร็จ", true);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (!user) return showMessage("กรุณาเข้าสู่ระบบก่อน", true);
    if (password.length < 6)
      return showMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", true);
    if (password !== confirmPassword)
      return showMessage("ยืนยันรหัสผ่านไม่ตรงกัน", true);
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setConfirmPassword("");
      showMessage("เปลี่ยนรหัสผ่านสำเร็จ");
    } catch (error) {
      showMessage(error.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ", true);
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    setSaving(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setConfirmLogout(false);
      setUser(null);
      navigate("/", { replace: true });
    } catch (error) {
      showMessage(error.message || "ออกจากระบบไม่สำเร็จ", true);
    } finally {
      setSaving(false);
    }
  };

  const [title, description] =
    pageInfo[pathname] ?? pageInfo["/settings/about"];

  return (
    <SettingsLayout title={title} description={description}>
      {message && (
        <Alert
          role="status"
          className={`mb-5 ${messageError ? "border-red-200 bg-red-50 text-red-700" : "border-[#F0E1DA] bg-[#FFF8F5] text-[#925943]"}`}
        >
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {(pathname === "/settings" || pathname === "/settings/") && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="group flex w-full items-center gap-4 rounded-3xl border border-[#F0E1DA] bg-[#FFF8F5] p-5 text-left shadow-sm transition hover:border-[#D9AAA5] hover:shadow-md sm:p-6"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#F3D5C9] text-2xl font-bold text-[#865B4D] shadow-sm sm:h-20 sm:w-20">
              {profile?.User_Avatar_URL ? (
                <img src={profile.User_Avatar_URL} alt="รูปโปรไฟล์" className="h-full w-full object-cover" />
              ) : (
                (profile?.User_Name || username || user?.email || "U").charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#A36D70]">โปรไฟล์ของฉัน</p>
              <h2 className="mt-1 truncate text-lg font-bold text-[#352923] sm:text-xl">
                {profile?.User_Name || username || "นักอ่าน"}
              </h2>
              <p className="mt-1 truncate text-xs text-gray-500 sm:text-sm">
                {user?.email || "เข้าสู่ระบบเพื่อดูโปรไฟล์"}
              </p>
              <p className="mt-2 text-xs font-medium text-[#A36D70]">แตะเพื่อจัดการรูปโปรไฟล์ กรอบรูป และรางวัล</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#A36D70] transition group-hover:translate-x-1" />
          </button>
          <div>
            <h2 className="mb-3 text-base font-bold text-[#352923]">การตั้งค่าของฉัน</h2>
            <div className="overflow-hidden rounded-2xl border border-[#F0E1DA] bg-white">
              {[
                { path: "/settings/account", title: "บัญชีและความปลอดภัย", description: "รหัสผ่านและออกจากระบบ", Icon: ShieldCheck },
                { path: "/settings/about", title: "เกี่ยวกับ Let's Read", description: "ข้อมูลแอปพลิเคชัน", Icon: Info },
              ].map(({ path, title, description, Icon }) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => navigate(path)}
                  className="flex w-full items-center gap-3 border-b border-[#F5EAE5] p-4 text-left transition last:border-0 hover:bg-[#FFF8F5]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBEAE4] text-[#A36D70]"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#352923]">{title}</span><span className="mt-1 block text-xs text-gray-500">{description}</span></span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {pathname === "/settings/profile" && (
        <div className="rounded-2xl border border-[#F0E1DA] bg-[#FFF8F5] p-5">
          <h2 className="font-semibold text-[#352923]">โปรไฟล์ผู้ใช้</h2>
          <p className="mt-2 text-sm text-gray-600">จัดการรูปโปรไฟล์ กรอบรูป และรางวัลได้ที่หน้าโปรไฟล์หลัก</p>
          <Button onClick={() => navigate("/profile")} className="mt-4 rounded-xl bg-[#A36D70] text-white hover:bg-[#8F5C60]">ไปที่โปรไฟล์ของฉัน <ChevronRight className="ml-1 h-4 w-4" /></Button>
        </div>
      )}

        
      {pathname === "/settings/account" && (
        
        <div className="space-y-7">
          
          <form onSubmit={changePassword} className="space-y-4">
            
            <div className="flex items-center gap-2">
              <LockKeyhole className="size-4 text-[#A36D70]" />
              <h2 className="font-semibold">เปลี่ยนรหัสผ่าน</h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">รหัสผ่านใหม่</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={saving || !user}
              className="w-full rounded-xl border-[#B66D57] text-[#A35E49] sm:w-auto"
            >
              เปลี่ยนรหัสผ่าน
            </Button>
            <p className="text-xs text-muted-foreground">
              การเปลี่ยนรหัสผ่านใช้ Supabase Auth; บัญชี OAuth
              อาจมีวิธีจัดการต่างกัน
            </p>
          </form>
          <Separator />
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <LogOut className="size-4 text-red-600" />
              <h2 className="font-semibold">ออกจากระบบ</h2>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              คุณจะต้องเข้าสู่ระบบอีกครั้งเพื่อใช้งานหน้าที่จำเป็นต้องมีบัญชี
            </p>
            <Button
              variant="outline"
              onClick={() => setConfirmLogout(true)}
              disabled={saving}
              className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 sm:w-auto"
            >
              ออกจากระบบ
            </Button>
          </section>
          <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
            <AlertDialogContent className="!w-[calc(100vw-2rem)] !max-w-sm rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>ยืนยันการออกจากระบบ</AlertDialogTitle>
                <AlertDialogDescription>
                  คุณต้องการออกจากบัญชี Let's Read ใช่หรือไม่?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={saving}>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction
                  disabled={saving}
                  onClick={(event) => {
                    event.preventDefault();
                    logout();
                  }}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  ยืนยันออกจากระบบ
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {pathname === "/settings/about" && (
        <section className="space-y-4">
          <div className="flex items-center gap-4 rounded-2xl bg-[#FFF8F5] p-4 sm:p-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#F3D5C9] font-bold text-[#865B4D]">
              LR
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#352923]">Let's Read</h2>
              <p className="text-xs text-muted-foreground">
                Discover your next favorite book
              </p>
            </div>
          </div>
          <SettingRow
            icon={BookOpen}
            label="เวอร์ชัน"
            description="เวอร์ชันโครงการ"
          >
            <Badge variant="secondary">1.0.0</Badge>
          </SettingRow>
          <div className="rounded-xl border border-[#F0E1DA] p-4">
            <h3 className="text-sm font-semibold text-[#352923]">
              เกี่ยวกับโครงการ
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Let's Read เป็นแพลตฟอร์มค้นหาและแนะนำหนังสือส่วนบุคคล พร้อม Feed
              รีวิว, Swipe, Library และ Leaderboard
            </p>
          </div>
        </section>
      )}
    </SettingsLayout>
  );
}
