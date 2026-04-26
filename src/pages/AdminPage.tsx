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
  { id: "m1", slot: "09:00 – 09:30", clientName: "Mariana Silva",   professionalId: "b1", professionalName: "Ana Oliveira",   serviceName: "Manicure Simples",     servicePrice: 35, status: "concluido"  },
  { id: "m2", slot: "09:30 – 10:00", clientName: "Fernanda Lima",   professionalId: "b2", professionalName: "Beatriz Costa",  serviceName: "Design de Sobrancelha",servicePrice: 40, status: "concluido"  },
  { id: "m3", slot: "10:00 – 10:30", clientName: "Patrícia Souza",  professionalId: "b3", professionalName: "Carla Mendes",   serviceName: "Pedicure Simples",     servicePrice: 45, status: "concluido"  },
  { id: "m4", slot: "10:30 – 11:00", clientName: "Cláudia Rocha",   professionalId: "b4", professionalName: "Juliana Silva",  serviceName: "Combo (Mão + Pé)",     servicePrice: 70, status: "concluido"  },
  { id: "m5", slot: "11:00 – 11:30", clientName: "Renata Oliveira", professionalId: "b1", professionalName: "Ana Oliveira",   serviceName: "Alongamento em Fibra", servicePrice: 150, status: "concluido" },
  { id: "m6", slot: "14:00 – 14:30", clientName: "Camila Torres",   professionalId: "b2", professionalName: "Beatriz Costa",  serviceName: "Manicure Simples",     servicePrice: 35, status: "confirmado" },
  { id: "m7", slot: "14:30 – 15:00", clientName: "Amanda Rocha",   professionalId: "b3", professionalName: "Carla Mendes",   serviceName: "Design de Sobrancelha",servicePrice: 40, status: "confirmado" },
  { id: "m8", slot: "15:00 – 15:30", clientName: "Bruna Alves",    professionalId: "b4", professionalName: "Juliana Silva",  serviceName: "Pedicure Simples",     servicePrice: 45, status: "confirmado" },
  { id: "m9", slot: "16:00 – 16:30", clientName: "Letícia Martins", professionalId: "b1", professionalName: "Ana Oliveira",   serviceName: "Combo (Mão + Pé)",     servicePrice: 70, status: "confirmado" },
];

const PROFESSIONALS_MOCK: ProfessionalInfo[] = [
  { id: "b1", name: "Ana Oliveira",  bookings: 3, revenue: 255 },
  { id: "b2", name: "Beatriz Costa", bookings: 2, revenue: 75  },
  { id: "b3", name: "Carla Mendes",  bookings: 2, revenue: 85  },
  { id: "b4", name: "Juliana Silva", bookings: 2, revenue: 115 },
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
    if (absentProfessionals.has(b.professionalId) && b.status === "confirmado")     return { ...b, status: "reagendamento" };
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
    setOverrideStatus((p) => {
      const next = { ...p };
      TODAY_MOCK.filter((b) => b.professionalId === id && b.status === "confirmado").forEach((b) => delete next[b.id]);
      return next;
    });
  };

  const markNoShow = (id: string, clientName: string, servicePrice: number) => {
    const fee = Math.round(servicePrice * 0.5);
    setConfirm({
      title: "Registrar não comparecimento",
      description: `${clientName} não compareceu. Taxa de 50% (R$ ${fee},00) será cobrada pelo horário reservado.`,
      onConfirm: () => setOverrideStatus((p) => ({ ...p, [id]: "nao_compareceu" })),
    });
  };

  const markEmergencyClosed = () => {
    setConfirm({
      title: "Fechamento emergencial",
      description: "Todos os agendamentos de hoje serão cancelados. As clientes precisarão ser contatadas para reembolso ou reagendamento.",
      onConfirm: () => setEmergencyClosed(true),
    });
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="bg-[hsl(20,30%,10%)] border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-tight tracking-wide">Beleza & Estilo</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest leading-tight">Painel Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40 hidden sm:block capitalize">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </span>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ver site</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

        {/* Alertas — full width */}
        <div className="space-y-2 mb-5">
          {emergencyClosed && (
            <div className="flex items-center justify-between gap-3 bg-unavailable/10 border border-unavailable/30 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-unavailable shrink-0" />
                <p className="text-xs font-semibold text-unavailable leading-snug">
                  Fechamento emergencial ativo — todos os agendamentos de hoje estão cancelados.
                </p>
              </div>
              <button onClick={() => setEmergencyClosed(false)} className="text-xs text-unavailable hover:underline shrink-0 font-semibold">
                Reverter
              </button>
            </div>
          )}
          {needsReschedule > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
              <p className="text-xs text-orange-700 leading-snug">
                <strong>{needsReschedule} agendamento{needsReschedule > 1 ? "s" : ""}</strong> precisam de reagendamento devido à ausência de profissional.
              </p>
            </div>
          )}
        </div>

        {/* Grid principal: coluna esquerda + coluna direita */}
        <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-6 space-y-5 lg:space-y-0">

          {/* ── COLUNA ESQUERDA ── */}
          <div className="space-y-5">

            {/* Métricas */}
            <section>
              <SectionLabel>Hoje</SectionLabel>
              <div className="grid grid-cols-2 gap-2.5">
                <MetricCard
                  icon={<CalendarDays className="w-4 h-4" />}
                  label="Agendamentos"
                  value={String(allToday.length)}
                  sub={`${concluded} concluídos · ${upcoming} a seguir`}
                />
                <MetricCard
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Receita realizada"
                  value={`R$ ${revenueRealized}`}
                  sub={noShowFees > 0 ? `${concluded} serviços · R$ ${noShowFees} em taxas` : `${concluded} serviços concluídos`}
                  highlight
                />
                <MetricCard
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Receita do mês"
                  value="R$ 8.420"
                  sub="↑ 15% vs mês anterior"
                />
                <MetricCard
                  icon={<Users className="w-4 h-4" />}
                  label="Clientes no mês"
                  value="64"
                  sub="Serviço top: Manicure"
                />
              </div>
            </section>

            {/* Profissionais */}
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <SectionLabel className="mb-0">Profissionais hoje</SectionLabel>
                <button
                  onClick={markEmergencyClosed}
                  disabled={emergencyClosed}
                  className="flex items-center gap-1 text-[11px] font-semibold text-unavailable hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Emergência
                </button>
              </div>

              <div className="space-y-2">
                {PROFESSIONALS_MOCK.map((b) => {
                  const isAbsent = absentProfessionals.has(b.id);
                  const isLate   = lateProfessionals.has(b.id);
                  const affected = allToday.filter(
                    (a) => a.professionalId === b.id && (a.status === "confirmado" || a.status === "reagendamento")
                  ).length;

                  return (
                    <div
                      key={b.id}
                      className={cn(
                        "border px-3 py-3 transition-all",
                        isAbsent ? "border-orange-300 bg-orange-50/60" :
                        isLate   ? "border-yellow-300 bg-yellow-50/40" :
                                   "border-border bg-card"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn("w-8 h-8 flex items-center justify-center shrink-0", isAbsent ? "bg-orange-100" : "bg-primary/10")}>
                            <Sparkles className={cn("w-3.5 h-3.5", isAbsent ? "text-orange-500" : "text-primary")} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground leading-tight truncate">{b.name}</p>
                            {isAbsent && <p className="text-[10px] text-orange-500 font-semibold">Ausente hoje</p>}
                            {isLate && !isAbsent && <p className="text-[10px] text-yellow-600 font-semibold">Com atraso</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">{b.bookings} agend.</p>
                            <p className="text-xs text-primary font-semibold">R$ {b.revenue}</p>
                          </div>
                          {affected > 0 && (
                            <span className="text-[10px] bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5">
                              {affected} pend.
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                        {isAbsent ? (
                          <button onClick={() => restoreProfessional(b.id)} className="flex items-center gap-1 text-xs font-semibold text-available hover:opacity-80">
                            <UserCheck className="w-3.5 h-3.5" /> Marcar como presente
                          </button>
                        ) : (
                          <>
                            <button onClick={() => markAbsent(b)} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-orange-600 transition-colors">
                              <UserX className="w-3.5 h-3.5" /> Ausente
                            </button>
                            <span className="text-border text-xs">·</span>
                            {isLate ? (
                              <button onClick={() => setLateProfessionals((p) => { const s = new Set(p); s.delete(b.id); return s; })} className="flex items-center gap-1 text-xs font-medium text-yellow-600 hover:opacity-70">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Chegou
                              </button>
                            ) : (
                              <button onClick={() => markLate(b)} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-yellow-600 transition-colors">
                                <Timer className="w-3.5 h-3.5" /> Atraso
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Serviços mais pedidos */}
            <section>
              <SectionLabel>Serviços mais pedidos</SectionLabel>
              <div className="border border-border divide-y divide-border overflow-hidden">
                {[
                  { name: "Manicure Simples",      count: 22, pct: 100 },
                  { name: "Design de Sobrancelha", count: 18, pct: 82  },
                  { name: "Pedicure Simples",      count: 15, pct: 68  },
                  { name: "Combo (Mão + Pé)",      count: 12, pct: 55  },
                  { name: "Alongamento em Fibra",  count: 8,  pct: 36  },
                ].map((svc, i) => (
                  <div key={svc.name} className="flex items-center gap-3 px-3 py-3 bg-card">
                    <span className="text-[11px] font-bold text-muted-foreground/40 w-4 shrink-0 font-mono">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-semibold text-foreground truncate">{svc.name}</p>
                        <div className="flex items-center gap-1 shrink-0 ml-3">
                          {i === 0 && <Star className="w-3 h-3 text-primary fill-primary" />}
                          <p className="text-xs font-bold text-muted-foreground">{svc.count}×</p>
                        </div>
                      </div>
                      <div className="h-1 bg-muted overflow-hidden">
                        <div className="h-full bg-primary/60" style={{ width: `${svc.pct}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>{/* fim coluna esquerda */}

          {/* ── COLUNA DIREITA — Agenda do dia ── */}
          <section className="lg:sticky lg:top-[57px] lg:self-start">
            <div className="flex items-center justify-between mb-2.5">
              <SectionLabel className="mb-0">Agenda do dia</SectionLabel>
              <span className="text-xs text-muted-foreground capitalize hidden sm:block">
                {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
              </span>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 scrollbar-none">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "text-[11px] font-semibold px-3 py-1.5 whitespace-nowrap shrink-0 transition-colors border",
                    statusFilter === f
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  {f === "todos" ? "Todos" : STATUS_CONFIG[f as BookingStatus].label}
                </button>
              ))}
            </div>

            {/* Lista */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-border bg-card">
                <Clock className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">Nenhum agendamento encontrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((b) => {
                  const professionalLate = lateProfessionals.has(b.professionalId);
                  return (
                    <div
                      key={b.id}
                      className={cn(
                        "border px-3 py-3 transition-all",
                        b.status === "concluido"      && "opacity-60 border-border bg-card",
                        b.status === "cancelado"      && "opacity-40 border-border bg-card",
                        b.status === "confirmado"     && "border-border bg-card",
                        b.status === "reagendamento"  && "border-orange-200 bg-orange-50/50",
                        b.status === "nao_compareceu" && "border-gray-200 bg-gray-50/50",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground bg-muted px-1.5 py-0.5">{b.slot}</span>
                          {professionalLate && b.status === "confirmado" && (
                            <span className="text-[10px] text-yellow-600 font-semibold">Atraso</span>
                          )}
                        </div>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 border shrink-0", STATUS_CONFIG[b.status].className)}>
                          {STATUS_CONFIG[b.status].label}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground leading-tight truncate">{b.clientName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{b.professionalName} · {b.serviceName}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-foreground">
                            R$ {b.status === "nao_compareceu" ? Math.round(b.servicePrice * 0.5) : b.servicePrice},00
                          </p>
                          {b.status === "nao_compareceu" && <p className="text-[10px] text-muted-foreground">taxa 50%</p>}
                        </div>
                      </div>

                      {b.status === "confirmado" && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <button
                            onClick={() => markNoShow(b.id, b.clientName, b.servicePrice)}
                            className="text-xs font-medium text-muted-foreground hover:text-unavailable transition-colors"
                          >
                            Registrar não comparecimento
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2.5 border border-t-0 border-border bg-muted/30">
                <p className="text-xs text-muted-foreground">{filtered.length} agendamento{filtered.length !== 1 ? "s" : ""}</p>
                <p className="text-sm font-bold text-primary">
                  R$ {filtered.reduce((s, b) => {
                    if (b.status === "cancelado" || b.status === "reagendamento") return s;
                    if (b.status === "nao_compareceu") return s + Math.round(b.servicePrice * 0.5);
                    return s + b.servicePrice;
                  }, 0)},00
                </p>
              </div>
            )}
          </section>

        </div>{/* fim grid */}
      </main>

      {/* Modal de confirmação */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirm(null)} />
          <div className="relative bg-card border border-border shadow-xl w-full sm:max-w-sm p-5 sm:rounded-none">
            <button
              onClick={() => setConfirm(null)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 bg-orange-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm leading-tight">{confirm.title}</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{confirm.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirm(null)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0"
                onClick={() => { confirm.onConfirm(); setConfirm(null); }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Subcomponentes ───────────────────────────────────────────────────────────

const SectionLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5", className)}>
    {children}
  </p>
);

const MetricCard = ({
  icon, label, value, sub, highlight = false,
}: {
  icon: React.ReactNode; label: string; value: string; sub: string; highlight?: boolean;
}) => (
  <div className={cn("border p-3.5", highlight ? "bg-primary border-primary/80" : "bg-card border-border")}>
    <div className={cn("w-7 h-7 flex items-center justify-center mb-2.5", highlight ? "bg-white/15" : "bg-muted")}>
      <span className={highlight ? "text-white" : "text-muted-foreground"}>{icon}</span>
    </div>
    <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1 leading-tight", highlight ? "text-white/70" : "text-muted-foreground")}>
      {label}
    </p>
    <p className={cn("text-xl font-extrabold leading-tight", highlight ? "text-white" : "text-foreground")}>
      {value}
    </p>
    <p className={cn("text-[10px] mt-1 leading-snug", highlight ? "text-white/60" : "text-muted-foreground")}>
      {sub}
    </p>
  </div>
);

export default AdminPage;
