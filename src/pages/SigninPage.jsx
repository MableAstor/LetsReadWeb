
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff, X } from "lucide-react";

import FacebookIcon from "../assets/facebook-logo.png";
import LineIcon from "../assets/line-logo.png";
import GoogleIcon from "../assets/google-logo.png";

import { supabase } from "../lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Register with email and password
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || socialLoading) return;

    if (formData.password !== formData.confirmPassword) {
      alert("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(
          result.message || "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่"
        );
        return;
      }

      alert("สมัครสมาชิกสำเร็จ");
      navigate("/Login");
    } catch (error) {
      console.error("[Register] Error:", error);
      alert("ไม่สามารถเชื่อมต่อ Server ได้");
    } finally {
      setLoading(false);
    }
  };

  // Social login
  const handleSocialLogin = async (provider) => {
    if (loading || socialLoading) return;

    setSocialLoading(provider);

    try {
      const { data, error } =
        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/home`,
            skipBrowserRedirect: true,
          },
        });

      if (error) throw error;

      if (!data?.url) {
        throw new Error("ไม่พบ URL สำหรับเข้าสู่ระบบ");
      }

      window.location.assign(data.url);
    } catch (error) {
      console.error("[Social Login] Error:", error);
      alert(`เข้าสู่ระบบไม่สำเร็จ: ${error.message}`);
      setSocialLoading("");
    }
  };

  const isDisabled = loading || Boolean(socialLoading);

  const socialProviders = [
    {
      id: "facebook",
      label: "Facebook",
      image: FacebookIcon,
      className:
        "border-0 bg-gradient-to-r from-[#1877F2] to-[#92bcf7] hover:opacity-90",
    },
    {
      id: "google",
      label: "Google",
      image: GoogleIcon,
      className:
        "border border-gray-100 bg-gradient-to-r from-[#feeef1] via-[#d7e5fa] to-[#d6f6db] hover:opacity-90",
    },
    {
      id: "custom:line",
      label: "LINE",
      image: LineIcon,
      className:
        "border-0 bg-gradient-to-r from-[#06C755] to-[#97f2a9] hover:opacity-90",
    },
  ];

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#FCE4E4] via-[#E8EEFF] to-[#D6F6DB] px-3 py-6 font-sans sm:px-6 sm:py-10">
      <Card className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl sm:rounded-[2rem]">
        {/* Close button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="absolute right-3 top-3 z-10 rounded-full text-gray-600 hover:bg-gray-100 hover:text-black sm:right-5 sm:top-5"
        >
          <X className="h-5 w-5" />
        </Button>

        <CardContent className="grid grid-cols-1 gap-7 p-5 pt-14 sm:p-8 sm:pt-16 md:grid-cols-2 md:items-center md:gap-10 md:p-10 lg:gap-14 lg:p-14">
          {/* Branding */}
          <section className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center text-black sm:h-24 sm:w-24">
              <BookOpen className="h-full w-full" strokeWidth={1.5} />
            </div>

            <h1 className="text-2xl font-semibold tracking-wide text-black sm:text-3xl">
              Let’s Read
            </h1>

            <h2 className="mt-2 text-sm font-bold text-black sm:text-base">
              Welcome to Let’s Read!
            </h2>

            <p className="mt-1 max-w-xs text-sm leading-6 text-gray-600">
              Your next favorite story is waiting for you.
            </p>
          </section>

          {/* Registration form */}
          <section className="w-full min-w-0">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  disabled={isDisabled}
                  className="h-11 rounded-lg border-gray-200 bg-gray-100 focus-visible:ring-blue-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="register-username">Username</Label>
                <Input
                  id="register-username"
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                  disabled={isDisabled}
                  className="h-11 rounded-lg border-gray-200 bg-gray-100 focus-visible:ring-blue-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="register-password">Password</Label>

                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    disabled={isDisabled}
                    className="h-11 rounded-lg border-gray-200 bg-gray-100 pr-11 focus-visible:ring-blue-400"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isDisabled}
                    className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-gray-500 hover:bg-transparent hover:text-gray-800"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="register-confirm-password">
                  Confirm Password
                </Label>

                <div className="relative">
                  <Input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    disabled={isDisabled}
                    className="h-11 rounded-lg border-gray-200 bg-gray-100 pr-11 focus-visible:ring-blue-400"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    disabled={isDisabled}
                    className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-gray-500 hover:bg-transparent hover:text-gray-800"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isDisabled}
                className="h-11 w-full rounded-lg bg-[#dcdcdc] font-bold text-black hover:bg-gray-300"
              >
                {loading ? "Creating account..." : "Sign in"}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="shrink-0 text-xs font-semibold text-gray-600">
                Sign in with
              </span>
              <Separator className="flex-1" />
            </div>

            {/* Social login */}
            <div className="space-y-3">
              {socialProviders.map((provider) => (
                <Button
                  key={provider.id}
                  type="button"
                  variant="outline"
                  disabled={isDisabled}
                  onClick={() => handleSocialLogin(provider.id)}
                  className={`grid h-12 w-full grid-cols-[28px_minmax(0,1fr)_28px] items-center rounded-xl px-4 text-xs font-semibold text-black shadow-sm transition sm:text-sm ${provider.className}`}
                >
                  <img
                    src={provider.image}
                    alt=""
                    aria-hidden="true"
                    className="h-7 w-7 object-contain"
                  />

                  <span className="truncate text-center">
                    {socialLoading === provider.id
                      ? "Connecting..."
                      : `Sign in with ${provider.label}`}
                  </span>

                  <span aria-hidden="true" />
                </Button>
              ))}
            </div>
          </section>
        </CardContent>
      </Card>
    </main>
  );
}
