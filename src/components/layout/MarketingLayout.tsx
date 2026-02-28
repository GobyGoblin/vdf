import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BackToTop } from '@/components/ui/BackToTop';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};
