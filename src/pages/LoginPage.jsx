
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, X } from "lucide-react";

import FacebookIcon from "../assets/facebook-logo.png";
import LineIcon from "../assets/line-logo.png";
import GoogleIcon from "../assets/google-logo.png";

import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");

  const handleClose = () => {
    navigate(-1);
  };

  // Social Login: Google, Facebook, LINE
  const handleSocialLogin = async (provider) => {
    if (loading || socialLoading) return;

    setSocialLoading(provider);

    try {
      const options = {
        redirectTo: `${window.location.origin}/home`,
        skipBrowserRedirect: true,
      };

      if (provider === "google") {
        options.queryParams = {
          prompt: "select_account",
        };
      }

      const { data, error } =
        await supabase.auth.signInWithOAuth({
          provider,
          options,
        });

      if (error) throw error;

      if (!data?.url) {
        throw new Error(
          "Supabase ไม่ได้ส่ง URL สำหรับเข้าสู่ระบบกลับมา"
        );
      }

      window.location.assign(data.url);
    } catch (error) {
      console.error("[Social Login] Error:", error);

      const providerName =
        provider === "google"
          ? "Google"
          : provider === "facebook"
            ? "Facebook"
            : "LINE";

      alert(
        `เข้าสู่ระบบด้วย ${providerName} ไม่สำเร็จ\n${
          error?.message || "กรุณาลองใหม่อีกครั้ง"
        }`
      );

      setSocialLoading("");
    }
  };

  // Email + Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || socialLoading) return;

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(
          result.message ||
            "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล"
        );
        return;
      }

      const { session, profile } = result;

      if (
        !session?.access_token ||
        !session?.refresh_token
      ) {
        alert(
          "ไม่พบข้อมูล Session กรุณาลองเข้าสู่ระบบใหม่"
        );
        return;
      }

      if (!profile) {
        alert(
          "เข้าสู่ระบบได้ แต่ไม่พบโปรไฟล์ทดลอง กรุณาตรวจสอบ Backend"
        );
        return;
      }

      const { error: sessionError } =
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

      if (sessionError) {
        console.error(
          "[Login] Set session error:",
          sessionError.message
        );

        alert("ไม่สามารถบันทึกสถานะเข้าสู่ระบบได้");
        return;
      }

      alert("เข้าสู่ระบบสำเร็จ");
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("[Login] Unexpected error:", error);

      alert(
        "ไม่สามารถเชื่อมต่อ Backend ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่"
      );
    } finally {
      setLoading(false);
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
      id: "custom:line-oauth",
      label: "LINE",
      image: LineIcon,
      className:
        "border-0 bg-gradient-to-r from-[#06C755] to-[#97f2a9] hover:opacity-90",
    },
  ];

  return (
    
<main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-tr from-[#dce7f8] via-[#f7e4e5] to-[#fdedcd] px-3 py-6 sm:px-6 sm:py-10">

      <Card className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl sm:rounded-[2rem]">
        {/* Close */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClose}
          aria-label="Go back"
          className="absolute right-3 top-3 z-10 rounded-full text-gray-600 hover:bg-gray-100 hover:text-black sm:right-5 sm:top-5"
        >
          <X className="h-5 w-5" />
        </Button>

        <CardContent className="grid grid-cols-1 gap-8 p-5 pt-14 sm:p-8 sm:pt-16 md:grid-cols-2 md:items-center md:gap-10 md:p-10 lg:gap-14 lg:p-14">
          {/* Left: Branding */}
          <section className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center text-black sm:h-24 sm:w-24">
              <BookOpen
                className="h-full w-full"
                strokeWidth={1.5}
              />
            </div>

            <h1 className="text-2xl font-semibold tracking-wide text-black sm:text-3xl">
              Let’s Read
            </h1>

            <p className="mt-2 text-sm font-bold text-gray-900 sm:text-base">
              Welcome back, reader!
            </p>

            <p className="mt-1 max-w-xs text-sm leading-6 text-gray-600">
              Ready to find your next favorite book?
            </p>
          </section>

          {/* Right: Login Form */}
          <section className="w-full min-w-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>

                <Input
                  id="login-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={isDisabled}
                  className="h-11 rounded-lg border-gray-200 bg-gray-100 focus-visible:ring-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">
                  Password
                </Label>

                <Input
                  id="login-password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={isDisabled}
                  className="h-11 rounded-lg border-gray-200 bg-gray-100 focus-visible:ring-blue-400"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => navigate("/Signin")}
                  className="font-semibold text-gray-800 hover:underline"
                >
                  Create Account
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/forgotpass")}
                  className="font-semibold text-gray-700 underline underline-offset-2 hover:text-blue-600"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isDisabled}
                className="h-11 w-full rounded-lg bg-[#dcdcdc] font-bold text-black hover:bg-gray-300"
              >
                {loading ? "Logging in..." : "Log in"}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <Separator className="flex-1" />

              <span className="shrink-0 text-xs font-semibold text-gray-600">
                Log in with
              </span>

              <Separator className="flex-1" />
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              {socialProviders.map((provider) => (
                <Button
                  key={provider.id}
                  type="button"
                  variant="outline"
                  disabled={isDisabled}
                  onClick={() =>
                    handleSocialLogin(provider.id)
                  }
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
                      : `Log in with ${provider.label}`}
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
