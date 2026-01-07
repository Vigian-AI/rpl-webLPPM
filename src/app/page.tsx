import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/home/hero-section';
import { InfoSection } from '@/components/home/info-section';
import { AnnouncementSection } from '@/components/home/announcement-section';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <InfoSection />
        <AnnouncementSection />
      </main>
      <Footer />
    </div>
  );
}
