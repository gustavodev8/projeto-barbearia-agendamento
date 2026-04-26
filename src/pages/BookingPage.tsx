import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { profissionais, servicos, timeSlots } from "@/data/mockData";
import { useReservations } from "@/contexts/ReservationContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Sparkles,
  Smartphone,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

const morningSlots = timeSlots.slice(0, 6);
const afternoonSlots = timeSlots.slice(6);

type PaymentMethod = "pix" | "credito" | "debito";

const paymentOptions: { key: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { key: "pix", label: "Pix", icon: <Smartphone className="w-4 h-4" /> },
  { key: "credito", label: "Crédito", icon: <CreditCard className="w-4 h-4" /> },
  { key: "debito", label: "Débito", icon: <CreditCard className="w-4 h-4" /> },
];

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bookings, addBooking } = useReservations();

  const professional = profissionais.find((p) => p.id === id);

  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedService = servicos.find((s) => s.id === selectedServiceId);

  const occupiedSlots = useMemo(() => {
    if (!date || !professional) return new Set<string>();
    const dateStr = format(date, "yyyy-MM-dd");
    return new Set(
      bookings
        .filter((b) => b.professionalId === professional.id && b.date === dateStr)
        .map((b) => b.slot)
    );
  }, [date, professional, bookings]);

  const handleConfirm = () => {
    if (!professional || !date || !selectedSlot || !selectedService || !clientName.trim()) return;
    addBooking({
      id: `b-${Date.now()}`,
      professionalId: professional.id,
      professionalName: professional.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      date: format(date, "yyyy-MM-dd"),
      slot: selectedSlot,
      clientName: clientName.trim(),
    });
    setShowSuccess(true);
  };

  if (!professional) return null;

  return (
    <div className="min-h-screen bg-secondary/30 pb-20 font-sans">
      <Header />
      
      <main className="max-w-md mx-auto px-5 py-8">
        {/* Progress Header */}
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
          <div className="w-10" /> {/* Spacer */}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: SERVICE */}
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

              <div className="space-y-3">
                {servicos.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedServiceId(svc.id)}
                    className={cn(
                      "w-full text-left rounded-3xl border p-4 transition-all flex items-center gap-4",
                      selectedServiceId === svc.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/5"
                        : "border-border/60 bg-white hover:border-primary/20"
                    )}
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0">
                      <img src={svc.image} alt={svc.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-sm">{svc.name}</p>
                      <p className="text-[11px] text-muted-foreground">{svc.durationMinutes} min</p>
                    </div>
                    <p className="font-bold text-primary text-sm">R${svc.price}</p>
                  </button>
                ))}
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

          {/* STEP 2: DATE & TIME */}
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
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => {
                      const isOccupied = occupiedSlots.has(slot.label);
                      const isSelected = selectedSlot === slot.label;
                      return (
                        <button
                          key={slot.label}
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
                        </button>
                      );
                    })}
                  </div>
                </div>
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

          {/* STEP 3: PAYMENT & DATA */}
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
                  <span className="text-sm font-bold text-foreground">{date ? format(date, "dd/MM/yyyy") : ""} às {selectedSlot.split(' – ')[0]}</span>
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
                disabled={!clientName.trim()} 
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
              >
                Finalizar Agendamento
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

      {/* Modal de sucesso */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-[90vw] sm:max-w-sm rounded-[40px] p-8 border-none overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-32 bg-primary/10 -z-10" />
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-xl shadow-primary/10">
              <CheckCircle2 className="w-12 h-12 text-available" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">Tudo pronto!</h2>
            <p className="text-sm text-muted-foreground mb-8">Seu horário foi reservado com sucesso. Te esperamos em breve!</p>
            <Button onClick={() => navigate("/")} className="w-full h-14 rounded-2xl text-lg font-bold">
              Voltar ao Início
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingPage;
