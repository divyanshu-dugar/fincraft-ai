'use client';

import HeroSection from "@/components/home/HeroSection";
import FinancialTools from "@/components/home/FinancialTools";
// import TechStackSection from "@/components/home/TechStack";
import Github from "@/components/home/GitHub";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Financial Tools Section */}
      <FinancialTools />

      {/* Tech Stack Section */}
      {/* <TechStackSection /> */}

      {/* GitHub Section */}
      {/* <Github/> */}
    </div>
  );
}
