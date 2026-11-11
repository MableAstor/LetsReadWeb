
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";

export default function SettingsLayout({
  title,
  description,
  children,
}) {
  const { pathname } = useLocation();

  const isSubPage = pathname.startsWith("/settings/");

  return (
    <main
      className="
        mx-auto w-full max-w-3xl min-w-0
        px-4 pt-4
        pb-[calc(100px+env(safe-area-inset-bottom))]
        sm:px-6 sm:pt-6
        lg:px-8 lg:pb-10
      "
    >
      {/* ปุ่มกลับ เฉพาะหน้าตั้งค่าย่อย */}
      {isSubPage && (
        <div className="mb-4">
          <Link
            to="/settings"
            aria-label="กลับไปหน้าตั้งค่า"
            title="กลับไปหน้าตั้งค่า"
            className="
              inline-flex h-10 w-10 items-center justify-center
              rounded-full border border-[#EEDCD3]
              bg-white/80 text-[#946B69]
              shadow-sm backdrop-blur-sm
              transition-all duration-200
              hover:bg-white hover:shadow-md
              active:scale-95
            "
          >
            <ArrowLeft size={19} strokeWidth={1.8} />
          </Link>
        </div>
      )}

      <Card
        className="
          w-full min-w-0 gap-0
          rounded-2xl
          border border-[#F0E1DA]
          bg-white py-0
          shadow-sm
        "
      >
        <CardHeader className="px-4 pt-5 pb-3 sm:px-6 sm:pt-6">
          <CardTitle className="text-lg font-bold text-[#352923] sm:text-xl">
            {title}
          </CardTitle>

          {description && (
            <CardDescription className="mt-1 text-xs leading-relaxed text-gray-500 sm:text-sm">
              {description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="min-w-0 px-4 pb-5 sm:px-6 sm:pb-6">
          {children}
        </CardContent>
      </Card>
    </main>
  );
}
