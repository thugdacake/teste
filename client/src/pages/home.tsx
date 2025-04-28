import React from "react";
import Header from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";
import HeroSection from "@/components/home/hero-section";
import AboutSection from "@/components/home/about-section";
import FeaturesSection from "@/components/home/features-section";
import NewsSection from "@/components/home/news-section";
import JoinSection from "@/components/home/join-section";
import StaffSection from "@/components/home/staff-section";
import ServerStats from "@/components/home/server-stats";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      <Header />
      
      <main className="flex-grow">
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <ServerStats />
        <NewsSection />
        <JoinSection />
        <StaffSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
