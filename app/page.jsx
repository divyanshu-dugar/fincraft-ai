'use client';

import HeroSection from "@/components/home/HeroSection";
import FinancialTools from "@/components/home/FinancialTools";
// import TechStack from "@/components/home/TechStack";
import Github from "@/components/home/GitHub";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <HeroSection />

      {/* Financial Tools Section */}
      <FinancialTools />

      {/* Tech Stack Section */}
      {/* <TechStack /> */}

      {/* GitHub Section */}
      <Github/>
    </div>
  );
}
