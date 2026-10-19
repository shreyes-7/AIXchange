import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PublicShell({ children }) {
  return (
    <div className="min-h-screen bg-[#05070B] text-[#F4F7FC] flex flex-col selection:bg-[#4F7DFF]/30 selection:text-[#40D9F2]">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
