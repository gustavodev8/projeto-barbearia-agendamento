import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, LayoutDashboard, Sparkles, ArrowRight, Instagram, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { servicos } from "@/data/mockData";
import AdminLoginModal from "@/components/AdminLoginModal";

const LandingPage = () => {
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);

  const handleAdminClick = () => {
    if (sessionStorage.getItem("admin_auth") === "1") {
      navigate("/admin");
    } else {
      setLoginOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Bio Link Header (Minimalist) */}
      <header className="bg-white px-6 py-6 flex flex-col items-center border-b border-border/40">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-4 ring-primary/5"
        >
          <Sparkles className="w-10 h-10 text-primary" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Beleza & Estilo</h1>
        <p className="text-sm text-muted-foreground mt-1 text-center max-w-[250px]">
          Especialistas em unhas, sobrancelhas e estética avançada.
        </p>
        
        <div className="flex gap-4 mt-4">
          <a href="#" className="p-2 bg-secondary rounded-full text-primary hover:bg-primary/10 transition-colors">
            <Instagram className="w-4 h-4" />
          </a>
          <a href="#" className="p-2 bg-secondary rounded-full text-primary hover:bg-primary/10 transition-colors">
            <MapPin className="w-4 h-4" />
          </a>
          <a href="#" className="p-2 bg-secondary rounded-full text-primary hover:bg-primary/10 transition-colors">
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Hero Quick Action */}
      <main className="flex-1 max-w-md mx-auto w-full px-5 py-8 space-y-6">
        <section>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/profissionais")}
            className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
          >
            <CalendarDays className="w-5 h-5" />
            Agendar Horário
          </motion.button>
        </section>

        {/* Categories / Services Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Principais Serviços</h2>
            <button 
              onClick={() => navigate("/profissionais")}
              className="text-xs font-semibold text-primary"
            >
              Ver todos
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {servicos.slice(0, 4).map((svc, i) => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate("/profissionais")}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-white p-4 flex items-center gap-4 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img src={svc.image} alt={svc.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-sm">{svc.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{svc.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">R${svc.price}</p>
                  <ArrowRight className="w-3 h-3 text-muted-foreground/30 ml-auto mt-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trust Stats */}
        <section className="bg-secondary/50 rounded-2xl p-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">500+</p>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Clientes</p>
          </div>
          <div className="border-x border-border/60">
            <p className="text-lg font-bold text-foreground">4.9</p>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Avaliação</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">8 anos</p>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Experiência</p>
          </div>
        </section>

        {/* Location Preview (Optional but good for Insta Bio) */}
        <section className="border border-border/60 rounded-2xl p-4 flex items-center gap-4 bg-white">
          <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xs">Onde estamos</h3>
            <p className="text-[11px] text-muted-foreground">Alagoinhas, Bahia</p>
          </div>
          <button className="text-[10px] font-bold text-primary uppercase tracking-tighter">
            Como chegar
          </button>
        </section>
      </main>

      {/* Admin Quick Access (Discreet) */}
      <footer className="py-8 flex flex-col items-center gap-4">
        <button
          onClick={handleAdminClick}
          className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40 hover:text-primary transition-colors uppercase tracking-[0.2em]"
        >
          <LayoutDashboard className="w-3 h-3" />
          Acesso Administrativo
        </button>
        <div className="flex flex-col items-center gap-1 opacity-20">
          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
            Quartzus
          </p>
          <p className="text-[8px] text-muted-foreground uppercase tracking-widest">
            © {new Date().getFullYear()} Beleza & Estilo
          </p>
        </div>
      </footer>

      <AdminLoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
};

export default LandingPage;
