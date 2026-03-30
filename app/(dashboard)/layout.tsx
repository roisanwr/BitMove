import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-container-lowest text-white font-body">
      <Sidebar />
      <TopBar />
      <main className="md:ml-64 pt-20 md:pt-24 p-4 md:p-8 min-h-screen transition-all duration-300">
        {children}
      </main>
      
      {/* UI Overlay Elements (Optional HUD effect) */}
      <div className="hidden md:block fixed bottom-4 right-4 z-50 pointer-events-none">
        <div className="bg-surface-container-high/60 backdrop-blur-md p-4 border border-outline-variant/30 font-headline text-[8px] uppercase tracking-widest text-primary leading-tight shadow-[0_0_10px_rgba(142,255,113,0.1)]">
          <span className="animate-pulse">●</span> LINK SECURE<br/>
          HUD_VER: 4.82.0-ELITE<br/>
          SECURITY: LEVEL 5
        </div>
      </div>
    </div>
  );
}
