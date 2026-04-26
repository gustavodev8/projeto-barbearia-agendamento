import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Professional } from "@/data/mockData";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";

const Home = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessionals = async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('available', true);
      
      if (!error && data) {
        setList(data);
      }
      setLoading(false);
    };

    fetchProfessionals();
  }, []);

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-8">
        <header className="mb-8">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-2"
          >
            <span className="w-8 h-px bg-primary" />
            Passo 1 de 2
          </motion.div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Escolha sua profissional</h1>
          <p className="text-sm text-muted-foreground mt-2">Nossas especialistas estão prontas para cuidar de você.</p>
        </header>

        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-muted-foreground animate-pulse font-bold uppercase tracking-widest text-xs">
              Carregando especialistas...
            </div>
          ) : list.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              Nenhuma profissional disponível no momento.
            </div>
          ) : (
            list.map((professional, i) => (
              <motion.button
                key={professional.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/profissionais/${professional.id}`)}
                className="w-full bg-white border border-border/60 rounded-3xl p-4 flex items-center gap-5 group hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all text-left"
              >
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-secondary">
                    <img
                      src={professional.image}
                      alt={professional.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  {professional.available && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-available border-4 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                    {professional.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                    {professional.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                      Ver Agenda
                    </span>
                    <ArrowRight className="w-3 h-3 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </main>

      <footer className="p-8 text-center flex flex-col items-center gap-1 opacity-20">
        <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
          Quartzus
        </p>
        <p className="text-[8px] text-muted-foreground uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} Beleza & Estilo
        </p>
      </footer>
    </div>
  );
};

export default Home;
