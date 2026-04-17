import { useNavigate } from "react-router-dom";
import { CalendarDays, LayoutDashboard, Scissors, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { barbeiros } from "@/data/mockData";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">

      {/* Header */}
      <header className="bg-[hsl(20,30%,10%)] border-b border-white/10 px-5 sm:px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 text-white font-bold text-lg tracking-widest uppercase"
        >
          <Scissors className="w-5 h-5 text-primary" />
          Barber Time
        </button>
        <nav className="flex items-center gap-6">
          <button
            onClick={() => navigate("/meus-agendamentos")}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors uppercase tracking-wider"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Agendamentos</span>
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </nav>
      </header>

      {/* Page title */}
      <div className="bg-[hsl(20,30%,10%)] px-5 sm:px-8 pt-8 pb-10">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-xs text-primary uppercase tracking-[0.2em] font-semibold flex items-center gap-2 mb-4">
            <span className="inline-block w-6 h-px bg-primary" />
            Passo 1 de 3
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Escolha seu barbeiro
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Selecione um profissional para iniciar o agendamento
          </p>
        </motion.div>
      </div>

      {/* Barber list */}
      <main className="max-w-4xl mx-auto w-full px-5 sm:px-8 py-8 flex-1">
        <div className="divide-y divide-border border-t border-border">
          {barbeiros.map((barber, i) => (
            <motion.button
              key={barber.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => navigate(`/barbeiros/${barber.id}`)}
              className="w-full flex items-center gap-4 sm:gap-6 py-4 sm:py-5 text-left group hover:bg-accent/40 transition-colors px-2 -mx-2"
            >
              {/* Photo */}
              <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden">
                <img
                  src={barber.image}
                  alt={barber.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-foreground text-base sm:text-lg tracking-tight group-hover:text-primary transition-colors">
                    {barber.name}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 ${
                      barber.available
                        ? "text-available bg-available/10"
                        : "text-unavailable bg-unavailable/10"
                    }`}
                  >
                    {barber.available ? "Disponível" : "Indisponível"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {barber.description}
                </p>
              </div>

              {/* Arrow */}
              <ArrowRight className="shrink-0 w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </motion.button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center sm:justify-between gap-1 text-xs text-muted-foreground text-center">
        <span>© {new Date().getFullYear()} Barber Time</span>
        <span className="uppercase tracking-widest">Todos os direitos reservados</span>
      </footer>
    </div>
  );
};

export default Home;
