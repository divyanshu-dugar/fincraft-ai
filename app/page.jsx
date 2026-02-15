'use client';

import HeroSection from "@/components/home/HeroSection";
import CombinedFeatures from "@/components/home/CombinedFeatures";
import Pricing from "@/components/home/Pricing";
import UseCases from "@/components/home/UseCases";
import FAQ from "@/components/home/FAQ";
import Comparison from "@/components/home/Comparison";
import Demo from "@/components/home/Demo";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <HeroSection />

      {/* Combined Financial Tools & Powerful Features Section */}
      <CombinedFeatures />

      {/* Pricing Section */}
      <Pricing />

      {/* Use Cases Section */}
      <UseCases />

      {/* FAQ Section */}
      <FAQ />

      {/* Comparison Section */}
      <Comparison />
      
      {/* Demo Section */}
      <Demo />

      {/* Footer */}
      <Footer />
    </div>
  );
}
