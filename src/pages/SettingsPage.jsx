import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, BookOpen, Check, LockKeyhole, LogOut, Moon, Sun, UserRound } from "lucide-react";
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

// Must match the categories used by CategoryCard. Keep these labels centralized later.
const mainCategories = [
  "รักโรแมนติก", "แฟนตาซี", "กำลังภายใน", "สืบสวนสอบสวน",
  "ระทึกขวัญ/สยองขวัญ", "ไซไฟ/โลกอนาคต", "วาย (Yaoi / BL)",
  "ยูริ (Yuri / GL)", "พีเรียด/ย้อนยุค", "วรรณกรรม/ชีวิต",
];
const MAX_INTERESTS = 5;

const pageInfo = {
  "/settings/reading": ["การตั้งค่าการอ่าน", "เลือกหมวดหนังสือที่สนใจ เพื่อเตรียมใช้กับระบบแนะนำ"],
  "/settings/appearance": ["ธีมและการแสดงผล", "ปรับธีมและรูปแบบตัวอักษร"],
  "/settings/notifications": ["การแจ้งเตือน", "เลือกรูปแบบการแจ้งเตือนที่ต้องการ"],
  "/settings/profile": ["โปรไฟล์ผู้ใช้", "แก้ไขชื่อผู้ใช้ที่แสดงใน Let's Read"],
  "/settings/account": ["บัญชีและความปลอดภัย", "เปลี่ยนรหัสผ่านและออกจากระบบ"],
  "/settings/about": ["เกี่ยวกับ Let's Read", "ข้อมูลเกี่ยวกับแพลตฟอร์มค้นหาและแนะนำหนังสือ"],
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
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
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
  const [theme, setTheme] = useState(() => readSaved("letsread-theme", "light"));
  const [fontSize, setFontSize] = useState(() => readSaved("letsread-font-size", "normal"));
  const [notifications, setNotifications] = useState(() => ({
    reviews: true, rewards: true, recommendations: true,
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
      setUsername(data.user?.user_metadata?.username ?? data.user?.user_metadata?.full_name ?? "");
    });
    return () => { mounted = false; };
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
    if (interests.length === 0) return showMessage("กรุณาเลือกอย่างน้อย 1 หมวด", true);
    localStorage.setItem("letsread-interests", JSON.stringify(interests));
    showMessage("บันทึกหมวดหนังสือในเบราว์เซอร์แล้ว");
  };

  const saveNotifications = () => {
    localStorage.setItem("letsread-notifications", JSON.stringify(notifications));
    showMessage("บันทึกการตั้งค่าการแจ้งเตือนในเบราว์เซอร์แล้ว");
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!user) return showMessage("กรุณาเข้าสู่ระบบก่อน", true);
    const clean = username.trim();
    if (!clean) return showMessage("กรุณากรอกชื่อผู้ใช้", true);
    setSaving(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ data: { username: clean } });
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
    if (password.length < 6) return showMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", true);
    if (password !== confirmPassword) return showMessage("ยืนยันรหัสผ่านไม่ตรงกัน", true);
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
      navigate("/Login", { replace: true });
    } catch (error) {
      showMessage(error.message || "ออกจากระบบไม่สำเร็จ", true);
    } finally {
      setSaving(false);
    }
  };

  const [title, description] = pageInfo[pathname] ?? pageInfo["/settings/about"];

  return (
    <SettingsLayout title={title} description={description}>
      {message && (
        <Alert role="status" className={`mb-5 ${messageError ? "border-red-200 bg-red-50 text-red-700" : "border-[#F0E1DA] bg-[#FFF8F5] text-[#925943]"}`}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {pathname === "/settings/reading" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-[#352923]">หมวดหลักที่สนใจ</h2>
              <p className="mt-1 text-xs text-muted-foreground">เลือก 1–5 หมวด ให้ตรงกับหมวดของหน้า Category</p>
            </div>
            <Badge variant="secondary" className="rounded-full">{interests.length}/{MAX_INTERESTS}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {mainCategories.map((category) => {
              const selected = interests.includes(category);
              return (
                <label key={category} className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${selected ? "border-[#C78E88] bg-[#FFF4F0]" : "border-[#F0E1DA] hover:bg-[#FFF9F6]"}`}>
                  <Checkbox checked={selected} onCheckedChange={() => toggleInterest(category)} aria-label={category} />
                  <span className="min-w-0 break-words text-[#463431]">{category}</span>
                </label>
              );
            })}
          </div>
          <Button onClick={saveReading} className="w-full rounded-xl bg-[#B66D57] text-white hover:bg-[#9D5945] sm:w-auto">บันทึกการตั้งค่า</Button>
          <p className="text-xs leading-relaxed text-muted-foreground">ตอนนี้บันทึกใน localStorage เท่านั้น ยังไม่อัปเดต User Preference Vector หรือคะแนนแนะนำของ Backend</p>
        </section>
      )}

      {pathname === "/settings/appearance" && (
        <section className="space-y-6">
          <div className="space-y-3">
            <Label className="font-semibold">ธีมเว็บไซต์</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "light", label: "สว่าง", Icon: Sun },
                { value: "dark", label: "มืด", Icon: Moon },
              ].map(({ value, label, Icon }) => (
                <Button key={value} type="button" variant="outline" onClick={() => setTheme(value)} aria-pressed={theme === value}
                  className={`h-14 min-w-0 rounded-xl text-sm ${theme === value ? "border-[#B66D57] bg-[#FFF0E9] text-[#925943]" : ""}`}>
                  <Icon className="size-4" /> {label} {theme === value && <Check className="size-4" />}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Dark mode ต้องมี dark: classes ในหน้าอื่น ๆ จึงจะเปลี่ยนทั้งเว็บได้ครบ</p>
          </div>
          <Separator />
          <div className="space-y-3">
            <Label htmlFor="font-size">ขนาดตัวอักษร</Label>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger id="font-size" className="w-full max-w-xs"><SelectValue placeholder="เลือกขนาด" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="small">เล็ก</SelectItem>
                <SelectItem value="normal">ปกติ</SelectItem>
                <SelectItem value="large">ใหญ่</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">บันทึกขนาดตัวอักษรแล้ว แต่ต้องเชื่อมค่ากับ Layout หลักก่อนจึงจะเปลี่ยนขนาดทั่วเว็บไซต์</p>
          </div>
        </section>
      )}

      {pathname === "/settings/notifications" && (
        <section className="space-y-3">
          {[
            ["reviews", "รีวิวและความคิดเห็น", "กิจกรรมเกี่ยวกับรีวิวหนังสือ"],
            ["rewards", "รางวัลและ EXP", "ความสำเร็จและรางวัลจากการใช้งาน"],
            ["recommendations", "หนังสือแนะนำ", "หนังสือที่อาจตรงกับความสนใจของคุณ"],
          ].map(([key, label, detail]) => (
            <SettingRow key={key} icon={Bell} label={label} description={detail}>
              <Switch checked={Boolean(notifications[key])} onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, [key]: checked }))} aria-label={label} />
            </SettingRow>
          ))}
          <Button onClick={saveNotifications} className="mt-3 w-full rounded-xl bg-[#B66D57] text-white hover:bg-[#9D5945] sm:w-auto">บันทึกการตั้งค่า</Button>
          <p className="text-xs text-muted-foreground">บันทึกความต้องการในเบราว์เซอร์เท่านั้น ยังไม่เชื่อมการส่งแจ้งเตือนจริง</p>
        </section>
      )}

      {pathname === "/settings/profile" && (
        <section className="space-y-5">
          <div className="flex min-w-0 items-center gap-4 rounded-2xl bg-[#FFF8F5] p-4 sm:p-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#F3D5C9] text-xl font-bold text-[#865B4D] sm:size-16">
              {(username || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="break-words font-bold text-[#352923]">{username || "นักอ่าน"}</p>
              <p className="mt-1 break-all text-xs text-muted-foreground">{user?.email || "ยังไม่พบข้อมูลบัญชี"}</p>
            </div>
          </div>
          <form onSubmit={saveProfile} className="space-y-3">
            <Label htmlFor="profile-username">ชื่อผู้ใช้</Label>
            <Input id="profile-username" maxLength={40} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="กรอกชื่อผู้ใช้" className="h-11 rounded-xl" />
            <p className="text-xs text-muted-foreground">แก้ไขชื่อผู้ใช้ใน Supabase Auth user_metadata</p>
            <Button type="submit" disabled={saving || !user} className="w-full rounded-xl bg-[#B66D57] text-white hover:bg-[#9D5945] sm:w-auto">{saving ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}</Button>
          </form>
        </section>
      )}

      {pathname === "/settings/account" && (
        <div className="space-y-7">
          <form onSubmit={changePassword} className="space-y-4">
            <div className="flex items-center gap-2"><LockKeyhole className="size-4 text-[#A36D70]" /><h2 className="font-semibold">เปลี่ยนรหัสผ่าน</h2></div>
            <div className="space-y-2">
              <Label htmlFor="new-password">รหัสผ่านใหม่</Label>
              <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <Button type="submit" variant="outline" disabled={saving || !user} className="w-full rounded-xl border-[#B66D57] text-[#A35E49] sm:w-auto">เปลี่ยนรหัสผ่าน</Button>
            <p className="text-xs text-muted-foreground">การเปลี่ยนรหัสผ่านใช้ Supabase Auth; บัญชี OAuth อาจมีวิธีจัดการต่างกัน</p>
          </form>
          <Separator />
          <section className="space-y-3">
            <div className="flex items-center gap-2"><LogOut className="size-4 text-red-600" /><h2 className="font-semibold">ออกจากระบบ</h2></div>
            <p className="text-xs leading-relaxed text-muted-foreground">คุณจะต้องเข้าสู่ระบบอีกครั้งเพื่อใช้งานหน้าที่จำเป็นต้องมีบัญชี</p>
            <Button variant="outline" onClick={() => setConfirmLogout(true)} disabled={saving} className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 sm:w-auto">ออกจากระบบ</Button>
          </section>
          <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
            <AlertDialogContent className="!w-[calc(100vw-2rem)] !max-w-sm rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>ยืนยันการออกจากระบบ</AlertDialogTitle>
                <AlertDialogDescription>คุณต้องการออกจากบัญชี Let's Read ใช่หรือไม่?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={saving}>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction disabled={saving} onClick={(event) => { event.preventDefault(); logout(); }} className="bg-red-600 text-white hover:bg-red-700">ยืนยันออกจากระบบ</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {pathname === "/settings/about" && (
        <section className="space-y-4">
          <div className="flex items-center gap-4 rounded-2xl bg-[#FFF8F5] p-4 sm:p-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#F3D5C9] font-bold text-[#865B4D]">LR</div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#352923]">Let's Read</h2>
              <p className="text-xs text-muted-foreground">Discover your next favorite book</p>
            </div>
          </div>
          <SettingRow icon={BookOpen} label="เวอร์ชัน" description="เวอร์ชันโครงการ"><Badge variant="secondary">1.0.0</Badge></SettingRow>
          <div className="rounded-xl border border-[#F0E1DA] p-4">
            <h3 className="text-sm font-semibold text-[#352923]">เกี่ยวกับโครงการ</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Let's Read เป็นแพลตฟอร์มค้นหาและแนะนำหนังสือส่วนบุคคล พร้อม Feed รีวิว, Swipe, Library และ Leaderboard</p>
          </div>
        </section>
      )}
    </SettingsLayout>
  );
}
