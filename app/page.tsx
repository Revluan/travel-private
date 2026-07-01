import { Navbar } from "@/components/home/navbar";
import { WindowSection } from "@/components/home/window-section";
import { FeaturesSection } from "@/components/home/features-section";
import { HighlightsSection } from "@/components/home/highlights-section";
import { CTASection } from "@/components/home/cta-section";
import { Footer } from "@/components/home/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <WindowSection />
      <FeaturesSection />
      <HighlightsSection />
      <CTASection />
      <Footer />
    </>
  );
}
