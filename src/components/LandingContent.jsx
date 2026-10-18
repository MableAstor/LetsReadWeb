
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function LandingContent() {
  const navigate = useNavigate();

  return (
    <main className="grid w-full grid-cols-1 items-center gap-8 rounded-2xl border border-gray-100 bg-white px-4 py-8 shadow-sm sm:px-8 sm:py-12 lg:grid-cols-2">
      {/* Left Content */}
      <div className="flex flex-col items-center space-y-6 text-center lg:items-start lg:pl-8 lg:text-left">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-black sm:text-5xl lg:text-6xl">
          Let's <span className="text-[#F26B50]">find</span> you
          <br />
          next <span className="text-[#34C759]">story.</span>
          <br />
          Let's <span className="text-[#2F80ED]">read</span>,
          <br />
          your way.
        </h1>

        <p className="max-w-md pt-2 text-lg font-normal text-gray-700 sm:text-xl">
          The wonders of reading are
          <br />
          waiting for you!
        </p>

        <div className="pt-2">
          <Button
            onClick={() => navigate("/Login")}
            className="group h-auto gap-2 rounded-full bg-[#FCE4E4] px-6 py-3 text-lg font-medium text-black transition-all hover:bg-[#fbd0d0]"
          >
            <span>Start Reading</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>

      {/* Right Images */}
      <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-3 sm:gap-4 lg:max-w-none">
        <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
            alt="Book open on floral bed cover"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600"
            alt="Book with headphones"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600"
            alt="Stack of books near piano"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=600"
            alt="Book open near rocks and water"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>
    </main>
  );
}
