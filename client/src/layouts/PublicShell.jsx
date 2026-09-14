import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PublicShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
