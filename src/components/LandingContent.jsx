import React from "react";
import {  ArrowRight } from "lucide-react";
export default function LandingContent() {
    return (
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-8 py-12 items-center bg-white rounded-2xl shadow-sm border border-gray-100 ">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 pl-0 lg:pl-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-black leading-tight tracking-tight">
            Let's <span className="text-[#F26B50]">find</span> you
            <br />
            next <span className="text-[#34C759]">story.</span>
            <br />
            Let's <span className="text-[#2F80ED]">read</span> ,<br />
            you way.
          </h1>

          <p className="text-gray-700 text-lg sm:text-xl font-normal max-w-md pt-2">
            The wonders of reading are
            <br />
            waiting for you!
          </p>

          <div className="pt-2">
            <button className="flex items-center gap-2 px-6 py-3 bg-[#FCE4E4] hover:bg-[#fbd0d0] text-black text-lg font-medium rounded-full transition-all group">
              <span>Start Reading</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:max-w-none">
          {/* Image 1 (Top Left) */}
          <div className="overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
              alt="Book open on floral bed cover"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Image 2 (Top Right) */}
          <div className="overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600"
              alt="Book with headphones"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Image 3 (Bottom Left) */}
          <div className="overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600"
              alt="Stack of books near piano"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Image 4 (Bottom Right) */}
          <div className="overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=600"
              alt="Book open near rocks and water"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </main>
    );
  }