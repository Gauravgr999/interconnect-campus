import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { AITools } from "@/components/landing/AITools";
import { Community } from "@/components/landing/Community";
import { Events } from "@/components/landing/Events";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <AITools />
      <Community />
      <Events />
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;
