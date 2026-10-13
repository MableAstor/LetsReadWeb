import React from "react";
import {  ArrowRight } from "lucide-react";
import LandingPageHeader from "../components/LandingPageHeader";
import LandingPageContent from "../components/LandingContent";

export default function LandingPage() {
  return (
    <div className="flex w-full max-w-6xl flex-col items-center justify-center rounded-2xl  px-8 py-3  mx-auto my-4 ">
      <LandingPageHeader />
      <LandingPageContent />
    </div>
  );
}
