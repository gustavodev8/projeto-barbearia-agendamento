import { useNavigate } from "react-router-dom";
import { useReservations } from "@/contexts/ReservationContext";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import Header from "@/components/Header";
import { CalendarDays, Clock, MapPin, X, Sparkles, AlertCircle, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const MyReservations = () => {
  const { bookings, cancelBooking } = useReservations();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Meus Horários</h1>
          <p className="text-sm text-muted-foreground mt-2">Acompanhe e gerencie seus agendamentos.</p>
        </header>

        {bookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] p-10 text-center border border-border/40 shadow-sm"
          >
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="w-10 h-10 text-primary/30" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Nada por aqui ainda</h2>
            <p className="text-sm text-muted-foreground mb-8">Você ainda não tem agendamentos confirmados.</p>
            <Button 
              onClick={() => navigate("/profissionais")} 
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
            >
              Agendar agora
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl border border-border/60 p-6 shadow-sm relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-0 translate-x-12 -translate-y-12 transition-transform group-hover:scale-150" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-extrabold text-lg text-foreground">{b.serviceName}</h3>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest mt-0.5">{b.professionalName}</p>
                    </div>
                    <button 
                      onClick={() => cancelBooking(b.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      title="Cancelar"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">
                          {format(parseISO(b.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">{b.slot.split(' – ')[0]}</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-slate-900 rounded-2xl text-center relative overflow-hidden group">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Código de Validação</p>
                    <p className="text-2xl font-black text-white tracking-[0.3em]">{b.validationCode}</p>
                  </div>

                  <a 
                    href={`https://wa.me/5575999999999?text=${encodeURIComponent(`Olá, gostaria de falar sobre meu agendamento:\n\nServiço: ${b.serviceName}\nData: ${b.date}\nCódigo: ${b.validationCode}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full py-3 rounded-2xl border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Cancelar ou Remarcar
                  </a>
                </div>
              </motion.div>
            ))}

            <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-5 flex gap-4 mt-8">
              <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />
              <p className="text-[13px] text-orange-700 leading-relaxed">
                <strong>Precisa desmarcar?</strong> Por favor, cancele com pelo menos 2h de antecedência para liberar o horário para outra cliente.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="p-10 text-center flex flex-col items-center gap-1 opacity-20">
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

export default MyReservations;
