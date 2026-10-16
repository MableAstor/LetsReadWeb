
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "./ui/button";
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
  const navigate = useNavigate();

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
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => navigate("/profile")}
        className="
          mb-4 h-9 rounded-xl
          px-2 text-xs
          text-muted-foreground
          hover:text-foreground
          sm:text-sm
        "
      >
        <ArrowLeft className="h-4 w-4" />
        กลับไปหน้า Profile
      </Button>

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
          <CardTitle
            className="
              text-lg font-bold
              text-[#352923]
              sm:text-xl
            "
          >
            {title}
          </CardTitle>

          {description && (
            <CardDescription
              className="
                mt-1 text-xs leading-relaxed
                text-gray-500 sm:text-sm
              "
            >
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
