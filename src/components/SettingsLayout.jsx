
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SettingsLayout({
  title,
  description,
  children,
}) {
  const navigate = useNavigate();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-10">
      <button
        type="button"
        onClick={() => navigate("/profile")}
        className="mb-5 flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
      >
        <ArrowLeft size={18} />
        กลับไปหน้า Profile
      </button>

      <section className="rounded-3xl border border-[#F0E1DA] bg-white p-5 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-[#352923]">
          {title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          {description}
        </p>

        <div className="mt-7">{children}</div>
      </section>
    </main>
  );
}
