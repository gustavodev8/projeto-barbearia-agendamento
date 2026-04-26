import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Professional, Service, timeSlots } from "@/data/mockData";
import { useReservations } from "@/contexts/ReservationContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Smartphone,
  CalendarDays,
  Clock,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

const paymentOptions: { key: "pix" | "credito" | "debito"; label: string; icon: React.ReactNode }[] = [
  { key: "pix", label: "Pix", icon: <Smartphone className="w-4 h-4" /> },
  { key: "credito", label: "Crédito", icon: <CreditCard className="w-4 h-4" /> },
  { key: "debito", label: "Débito", icon: <CreditCard className="w-4 h-4" /> },
];

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bookings, addBooking } = useReservations();

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credito" | "debito">("pix");
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationCode, setValidationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Busca profissional e serviços do Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      
      // Busca profissional
      const { data: profData } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', id)
        .single();
      
      if (profData) setProfessional(profData);

      // Busca serviços
      const { data: servData } = await supabase
        .from('services')
        .select('*')
        .eq('available', true);
      
      if (servData) {
        // Formata os preços que vêm como string/decimal do banco
        const formattedServices = servData.map(s => ({
          ...s,
          price: Number(s.price),
          durationMinutes: s.duration_minutes
        }));
        setServicesList(formattedServices);
      }
      
      setLoadingData(false);
    };

    fetchData();
  }, [id]);

  const selectedService = servicesList.find((s) => s.id === selectedServiceId);

  const occupiedSlots = useMemo(() => {
    if (!date || !professional || !bookings) return new Set<string>();
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      return new Set(
        bookings
          .filter((b) => b.professionalId === professional.id && b.date === dateStr)
          .map((b) => b.slot)
      );
    } catch (e) {
      return new Set<string>();
    }
  }, [date, professional, bookings]);

  const handleConfirm = async () => {
    if (!professional || !date || !selectedSlot || !selectedService || !clientName.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const formattedCode = `${code.slice(0, 3)} ${code.slice(3)}`;
    
    const success = await addBooking({
      id: `temp-${Date.now()}`,
      professionalId: professional.id,
      professionalName: professional.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      date: format(date, "yyyy-MM-dd"),
      slot: selectedSlot,
      clientName: clientName.trim(),
      validationCode: formattedCode,
    });

    if (success) {
      setValidationCode(formattedCode);
      setShowSuccess(true);
    } else {
      alert("Erro ao realizar agendamento. Tente novamente.");
    }
    setIsSubmitting(false);
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Carregando agenda...</p>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-foreground">Profissional não encontrada</h2>
        <Button onClick={() => navigate("/")} className="mt-4">Voltar ao Início</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 pb-20 font-sans">
      <Header />
      
      <main className="max-w-md mx-auto px-5 py-8">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => step === 1 ? navigate("/profissionais") : setStep(step - 1)}
            className="w-10 h-10 rounded-full bg-white border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  step === s ? "w-8 bg-primary" : "w-3 bg-border/60"
                )} 
              />
            ))}
          </div>
          <div className="w-10" />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <header>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">O que vamos fazer?</h1>
                <p className="text-sm text-muted-foreground mt-1">Selecione o serviço com {professional.name.split(' ')[0]}.</p>
              </header>

              <div className="space-y-4">
                {servicesList.map((svc, i) => {
                  const isSelected = selectedServiceId === svc.id;
                  return (
                    <motion.button
                      key={svc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedServiceId(svc.id)}
                      className={cn(
                        "w-full text-left rounded-[32px] p-5 transition-all duration-300 flex items-center gap-5 relative group",
                        isSelected
                          ? "bg-white border-2 border-primary shadow-2xl shadow-primary/10 scale-[1.02]"
                          : "bg-white border border-border/40 hover:border-primary/30 hover:shadow-md shadow-sm"
                      )}
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg z-10"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="relative w-20 h-20 shrink-0">
                        <div className={cn(
                          "w-full h-full rounded-[24px] overflow-hidden shadow-inner bg-slate-100 transition-transform duration-500",
                          isSelected ? "scale-110" : "group-hover:scale-105"
                        )}>
                          {svc.image && (
                            <img src={svc.image} alt={svc.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={cn(
                            "font-black text-base tracking-tight transition-colors",
                            isSelected ? "text-primary" : "text-slate-900"
                          )}>
                            {svc.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-2 font-medium">
                          {svc.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                             <Clock className="w-3.5 h-3.5 text-primary" />
                             {svc.durationMinutes} min
                          </div>
                          <div className="text-base font-black text-primary">
                            R${svc.price}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <Button 
                onClick={() => setStep(2)} 
                disabled={!selectedServiceId} 
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
              >
                Continuar
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <header>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Quando será?</h1>
                <p className="text-sm text-muted-foreground mt-1">Escolha o melhor dia e horário.</p>
              </header>

              <div className="bg-white rounded-3xl border border-border/60 p-4 shadow-sm">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => { setDate(d); setSelectedSlot(""); }}
                  disabled={(d) => d < new Date(new Date().setHours(0,0,0,0)) || d.getDay() === 0}
                  locale={ptBR}
                  className="mx-auto"
                />
              </div>

              {date && (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.03
                      }
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => {
                      const isOccupied = occupiedSlots.has(slot.label);
                      const isSelected = selectedSlot === slot.label;
                      return (
                        <motion.button
                          key={slot.label}
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0 }
                          }}
                          disabled={isOccupied}
                          onClick={() => setSelectedSlot(slot.label)}
                          className={cn(
                            "py-3 px-2 rounded-xl border text-xs font-bold transition-all",
                            isOccupied && "bg-secondary text-muted-foreground/30 border-border line-through opacity-50",
                            !isOccupied && !isSelected && "bg-white border-border text-foreground hover:border-primary/40",
                            isSelected && "bg-primary border-primary text-white shadow-md shadow-primary/20"
                          )}
                        >
                          {slot.label.split(' – ')[0]}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <Button 
                onClick={() => setStep(3)} 
                disabled={!date || !selectedSlot} 
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
              >
                Confirmar Horário
              </Button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <header>
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Quase lá!</h1>
                <p className="text-sm text-muted-foreground mt-1">Confira os detalhes e confirme.</p>
              </header>

              <div className="bg-white rounded-3xl border border-border/60 p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-4 border-b border-border/40">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Serviço</span>
                  <span className="text-sm font-bold text-foreground">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border/40">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Data</span>
                  <span className="text-sm font-bold text-foreground">{date ? format(date, "dd/MM/yyyy") : ""} às {selectedSlot?.split(' – ')[0]}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Valor</span>
                  <span className="text-lg font-extrabold text-primary uppercase">R${selectedService?.price}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Seu Nome</Label>
                  <Input
                    id="clientName"
                    placeholder="Como podemos te chamar?"
                    className="h-14 rounded-2xl border-border/60 px-4 focus-visible:ring-primary/20"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Pagamento</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentOptions.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setPaymentMethod(opt.key)}
                        className={cn(
                          "flex flex-col items-center gap-2 py-3 rounded-2xl border text-[10px] font-bold uppercase transition-all",
                          paymentMethod === opt.key
                            ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/5"
                            : "border-border/60 bg-white text-muted-foreground"
                        )}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleConfirm} 
                disabled={!clientName.trim() || isSubmitting} 
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
              >
                {isSubmitting ? "Finalizando..." : "Finalizar Agendamento"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-12 text-center flex flex-col items-center gap-1 opacity-10">
          <p className="text-[8px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
            Quartzus
          </p>
        </footer>
      </main>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-[40px] p-0 border-none overflow-hidden bg-white shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-48 bg-primary -z-10" />
          
          <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-2xl animate-bounce">
              <CheckCircle2 className="w-14 h-14 text-available" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Agendado!</h2>
            <p className="text-white/80 text-sm font-medium mb-8">Seu horário de beleza está confirmado.</p>

            {/* Ticket Card */}
            <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-8">
              <div className="p-6 bg-slate-50/50 border-b border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Código de Validação</p>
                <p className="text-5xl font-black text-slate-900 tracking-[0.1em]">{validationCode}</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-left">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Onde será</p>
                    <p className="text-sm font-black text-slate-800">Alagoinhas, Bahia</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data e Hora</p>
                    <p className="text-sm font-black text-slate-800">{date ? format(date, "dd/MM/yy") : ""} às {selectedSlot?.split(' – ')[0]}</p>
                  </div>
                </div>
              </div>

              {/* Mega Alert Print - Optimized for Mobile */}
              <div className="bg-primary px-4 py-3 flex items-center justify-center gap-3">
                <Smartphone className="w-4 h-4 text-white shrink-0" />
                <p className="text-white font-black text-[10px] sm:text-xs uppercase tracking-tight leading-tight text-center">
                  Tire um PRINT desta tela e mostre <br className="hidden sm:block"/> no dia do atendimento!
                </p>
              </div>
            </div>

            <div className="space-y-4 w-full">
              <Button 
                onClick={() => navigate("/meus-agendamentos")} 
                className="w-full h-16 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-transform"
              >
                Concluído
              </Button>
              
              <a 
                href="https://wa.me/5575999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Precisa de ajuda? Chame no Zap
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingPage;
