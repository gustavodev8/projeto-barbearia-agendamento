import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReservations } from "@/contexts/ReservationContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Sparkles, CalendarDays, TrendingUp, Users, DollarSign,
  ArrowLeft, Star, Clock, AlertTriangle, UserX, ShieldAlert,
  X, UserCheck, Timer, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type BookingStatus = "concluido" | "confirmado" | "cancelado" | "reagendamento" | "nao_compareceu";

interface AdminBooking {
  id: string; slot: string; clientName: string;
  professionalId: string; professionalName: string;
  serviceName: string; servicePrice: number;
  status: BookingStatus;
}

interface ProfessionalInfo {
  id: string; name: string; bookings: number; revenue: number;
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const TODAY_MOCK: AdminBooking[] = [
  { id: "m1", slot: "09:00 – 09:30", clientName: "Mariana Silva",   professionalId: "p1", professionalName: "Ana Oliveira",   serviceName: "Manicure Simples",     servicePrice: 35, status: "concluido"  },
  { id: "m2", slot: "09:30 – 10:00", clientName: "Fernanda Lima",   professionalId: "p2", professionalName: "Beatriz Costa",  serviceName: "Design de Sobrancelha",servicePrice: 40, status: "concluido"  },
  { id: "m3", slot: "10:00 – 10:30", clientName: "Patrícia Souza",  professionalId: "p3", professionalName: "Carla Mendes",   serviceName: "Pedicure Simples",     servicePrice: 45, status: "concluido"  },
  { id: "m4", slot: "10:30 – 11:00", clientName: "Cláudia Rocha",   professionalId: "p4", professionalName: "Juliana Silva",  serviceName: "Combo (Mão + Pé)",     servicePrice: 70, status: "concluido"  },
  { id: "m5", slot: "11:00 – 11:30", clientName: "Renata Oliveira", professionalId: "p1", professionalName: "Ana Oliveira",   serviceName: "Alongamento em Fibra", servicePrice: 150, status: "concluido" },
  { id: "m6", slot: "14:00 – 14:30", clientName: "Camila Torres",   professionalId: "p2", professionalName: "Beatriz Costa",  serviceName: "Manicure Simples",     servicePrice: 35, status: "confirmado" },
  { id: "m7", slot: "14:30 – 15:00", clientName: "Amanda Rocha",    professionalId: "p3", professionalName: "Carla Mendes",   serviceName: "Design de Sobrancelha",servicePrice: 40, status: "confirmado" },
  { id: "m8", slot: "15:00 – 15:30", clientName: "Bruna Alves",     professionalId: "p4", professionalName: "Juliana Silva",  serviceName: "Pedicure Simples",     servicePrice: 45, status: "confirmado" },
  { id: "m9", slot: "16:00 – 16:30", clientName: "Letícia Martins", professionalId: "p1", professionalName: "Ana Oliveira",   serviceName: "Combo (Mão + Pé)",     servicePrice: 70, status: "confirmado" },
];

const PROFESSIONALS_MOCK: ProfessionalInfo[] = [
  { id: "p1", name: "Ana Oliveira",  bookings: 3, revenue: 255 },
  { id: "p2", name: "Beatriz Costa", bookings: 2, revenue: 75  },
  { id: "p3", name: "Carla Mendes",  bookings: 2, revenue: 85  },
  { id: "p4", name: "Juliana Silva", bookings: 2, revenue: 115 },
];

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  concluido:      { label: "Concluído",      className: "bg-available/10 text-available border-available/30"     },
  confirmado:     { label: "Confirmado",     className: "bg-primary/10 text-primary border-primary/30"           },
  cancelado:      { label: "Cancelado",      className: "bg-unavailable/10 text-unavailable border-unavailable/30" },
  reagendamento:  { label: "Reagend.",       className: "bg-orange-100 text-orange-600 border-orange-300"        },
  nao_compareceu: { label: "Não compareceu", className: "bg-gray-100 text-gray-500 border-gray-300"              },
};

const FILTERS = ["todos", "confirmado", "concluido", "reagendamento", "nao_compareceu", "cancelado"] as const;

// ─── Componente principal ──────────────────────────────────────────────────────

const AdminPage = () => {
  const navigate = useNavigate();
  const { bookings } = useReservations();

  const [absentProfessionals,  setAbsentProfessionals]  = useState<Set<string>>(new Set());
  const [lateProfessionals,    setLateProfessionals]    = useState<Set<string>>(new Set());
  const [overrideStatus, setOverrideStatus] = useState<Record<string, BookingStatus>>({});
  const [emergencyClosed, setEmergencyClosed] = useState(false);
  const [statusFilter, setStatusFilter]     = useState<typeof FILTERS[number]>("todos");
  const [confirm, setConfirm]               = useState<{ title: string; description: string; onConfirm: () => void } | null>(null);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const realToday: AdminBooking[] = bookings
    .filter((b) => b.date === todayStr)
    .map((b) => ({
      id: b.id, slot: b.slot, clientName: b.clientName,
      professionalId: b.professionalId, professionalName: b.professionalName,
      serviceName: b.serviceName, servicePrice: b.servicePrice,
      status: "confirmado" as BookingStatus,
    }));

  const allToday: AdminBooking[] = [...realToday, ...TODAY_MOCK].map((b) => {
    if (overrideStatus[b.id])                                                 return { ...b, status: overrideStatus[b.id] };
    if (emergencyClosed)                                                      return { ...b, status: "cancelado" };
    if (absentProfessionals.has(b.professionalId) && b.status === "confirmado") return { ...b, status: "reagendamento" };
    return b;
  });

  const filtered = statusFilter === "todos" ? allToday : allToday.filter((b) => b.status === statusFilter);

  const concluded       = allToday.filter((b) => b.status === "concluido").length;
  const upcoming        = allToday.filter((b) => b.status === "confirmado").length;
  const needsReschedule = allToday.filter((b) => b.status === "reagendamento").length;
  const noShowFees      = allToday.filter((b) => b.status === "nao_compareceu").reduce((s, b) => s + Math.round(b.servicePrice * 0.5), 0);
  const revenueRealized = allToday.filter((b) => b.status === "concluido").reduce((s, b) => s + b.servicePrice, 0) + noShowFees;

  const markAbsent = (professional: ProfessionalInfo) => {
    const affected = allToday.filter((b) => b.professionalId === professional.id && b.status === "confirmado").length;
    setConfirm({
      title: `Marcar ${professional.name.split(" ")[0]} como ausente`,
      description: `${professional.name} tem ${affected} agendamento${affected !== 1 ? "s" : ""} pendente${affected !== 1 ? "s" : ""} hoje. Serão sinalizados como "Reagendamento necessário".`,
      onConfirm: () => setAbsentProfessionals((p) => new Set(p).add(professional.id)),
    });
  };

  const markLate = (professional: ProfessionalInfo) => {
    setConfirm({
      title: `Registrar atraso — ${professional.name.split(" ")[0]}`,
      description: `${professional.name} está com atraso. O primeiro horário disponível poderá ser impactado.`,
      onConfirm: () => setLateProfessionals((p) => new Set(p).add(professional.id)),
    });
  };

  const restoreProfessional = (id: string) => {
    setAbsentProfessionals((p) => { const s = new Set(p); s.delete(id); return s; });
    setLateProfessionals((p)   => { const s = new Set(p); s.delete(id); return s; });
  };

  const markNoShow = (id: string, clientName: string, servicePrice: number) => {
    const fee = Math.round(servicePrice * 0.5);
    setConfirm({
      title: "Registrar não comparecimento",
      description: `${clientName} não compareceu. Taxa de 50% (R$ ${fee},00) será cobrada pelo horário reservado.`,
      onConfirm: () => setOverrideStatus((p) => ({ ...p, [id]: "nao_compareceu" })),
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* Header Admin */}
      <header className="bg-white border-b border-border/40 px-5 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground leading-tight tracking-wide">Beleza & Estilo</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight font-bold">Painel de Gestão</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-xs font-bold text-primary px-4 py-2 bg-primary/5 rounded-full hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Sair</span>
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">

        {/* Alertas Rápidos */}
        <div className="space-y-3 mb-8">
          {emergencyClosed && (
            <div className="flex items-center justify-between gap-3 bg-destructive/5 border border-destructive/10 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-destructive shrink-0" />
                <p className="text-xs font-bold text-destructive leading-snug">
                  Fechamento emergencial ativo — agenda suspensa.
                </p>
              </div>
              <button onClick={() => setEmergencyClosed(false)} className="text-[10px] uppercase font-bold text-destructive hover:underline">
                Reativar
              </button>
            </div>
          )}
          {needsReschedule > 0 && (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 p-4 rounded-2xl">
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
              <p className="text-xs font-bold text-orange-700 leading-snug">
                {needsReschedule} agendamento{needsReschedule > 1 ? "s" : ""} precisam de atenção imediata.
              </p>
            </div>
          )}
        </div>

        {/* Grid do Painel */}
        <div className="grid lg:grid-cols-[350px_1fr] gap-8">

          {/* Coluna de Métricas e Profissionais */}
          <div className="space-y-8">
            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Métricas do Dia</h2>
              <div className="grid grid-cols-2 gap-3">
                <MetricBox label="Agendados" value={String(allToday.length)} sub={`${concluded} ok`} />
                <MetricBox label="Receita" value={`R$ ${revenueRealized}`} sub="Bruto hoje" highlight />
              </div>
            </section>

            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Equipe</h2>
              <div className="space-y-3">
                {PROFESSIONALS_MOCK.map((b) => {
                  const isAbsent = absentProfessionals.has(b.id);
                  const isLate   = lateProfessionals.has(b.id);
                  return (
                    <div key={b.id} className={cn(
                      "bg-white border rounded-2xl p-4 transition-all",
                      isAbsent ? "border-orange-200 bg-orange-50/30" : "border-border/60"
                    )}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isAbsent ? "bg-orange-100" : "bg-primary/10")}>
                            <Sparkles className={cn("w-4 h-4", isAbsent ? "text-orange-500" : "text-primary")} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{b.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground">{b.bookings} serviços hoje</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">R$ {b.revenue}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 pt-3 border-t border-border/40">
                        {isAbsent ? (
                          <button onClick={() => restoreProfessional(b.id)} className="text-[10px] font-bold text-available uppercase">Confirmar Presença</button>
                        ) : (
                          <>
                            <button onClick={() => markAbsent(b)} className="text-[10px] font-bold text-muted-foreground/60 hover:text-orange-600 uppercase">Ausente</button>
                            <button onClick={() => markLate(b)} className="text-[10px] font-bold text-muted-foreground/60 hover:text-yellow-600 uppercase">Atraso</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Agenda Detalhada */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Agenda em tempo real</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-available animate-pulse" />
                <span className="text-[10px] font-bold text-available uppercase tracking-widest">Live</span>
              </div>
            </div>

            <div className="bg-white border border-border/60 rounded-3xl overflow-hidden shadow-sm">
              {filtered.length === 0 ? (
                <div className="py-20 text-center">
                  <Clock className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-bold">Sem agendamentos no momento</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {filtered.map((b) => (
                    <div key={b.id} className={cn(
                      "p-5 flex items-center gap-6 group hover:bg-secondary/20 transition-colors",
                      b.status === "concluido" && "opacity-50"
                    )}>
                      <div className="w-16 text-center shrink-0">
                        <p className="text-sm font-extrabold text-foreground">{b.slot.split(' – ')[0]}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">{b.slot.split(' – ')[1]}</p>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-extrabold text-foreground truncate">{b.clientName}</p>
                        <p className="text-[11px] text-muted-foreground truncate font-medium">{b.professionalName} · {b.serviceName}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-primary mb-1">R${b.servicePrice}</p>
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border",
                          STATUS_CONFIG[b.status].className
                        )}>
                          {STATUS_CONFIG[b.status].label}
                        </span>
                      </div>

                      {b.status === "confirmado" && (
                        <button onClick={() => markNoShow(b.id, b.clientName, b.servicePrice)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-destructive">
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
      </main>

      {/* Modal Admin Confirm */}
      {confirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirm(null)} />
          <div className="relative bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-extrabold text-foreground mb-2">{confirm.title}</h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">{confirm.description}</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12 rounded-xl text-xs font-bold uppercase" onClick={() => setConfirm(null)}>Voltar</Button>
              <Button className="flex-1 h-12 rounded-xl text-xs font-bold uppercase" onClick={() => { confirm.onConfirm(); setConfirm(null); }}>Confirmar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricBox = ({ label, value, sub, highlight = false }: any) => (
  <div className={cn("bg-white border border-border/60 rounded-2xl p-4 shadow-sm", highlight && "bg-primary text-white border-none")}>
    <p className={cn("text-[9px] font-bold uppercase tracking-widest mb-1", highlight ? "text-white/70" : "text-muted-foreground")}>{label}</p>
    <p className="text-xl font-extrabold tracking-tight leading-none">{value}</p>
    <p className={cn("text-[9px] font-bold mt-1.5 opacity-60", highlight ? "text-white" : "text-muted-foreground")}>{sub}</p>
  </div>
);

export default AdminPage;
