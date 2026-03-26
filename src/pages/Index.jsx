import { MedicalScanner } from "@/components/MedicalScanner";
import { Navbar } from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden bg-slate-950 font-outfit">
      {/* Dynamic Animated Background Mesh */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-black pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] z-0 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[128px] z-0 animate-pulse-slow pointer-events-none"></div>
      
      <div className="relative z-10 w-full flex flex-col h-full">
        <Navbar />
        <div className="flex-1 w-full">
          <MedicalScanner />
        </div>
      </div>
    </div>
  );
};

export default Index;
