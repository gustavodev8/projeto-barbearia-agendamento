import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReservations } from "@/contexts/ReservationContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Scissors,
  CalendarDays,
  TrendingUp,
  Users,
  DollarSign,
  ArrowLeft,
  Star,
  Clock,
} from "lucide-react";

// ─── Dados mock para a apresentação ──────────────────────────────────────────

type BookingStatus = "concluido" | "confirmado" | "cancelado";

interface AdminBooking {
  id: string;
  slot: string;
  clientName: string;
  barberName: string;
  serviceName: string;
  servicePrice: number;
  status: BookingStatus;
}

const TODAY_MOCK: AdminBooking[] = [
  { id: "m1", slot: "09:00 – 09:30", clientName: "João Pereira",    barberName: "Carlos Silva",    serviceName: "Degradê",             servicePrice: 40, status: "concluido" },
  { id: "m2", slot: "09:30 – 10:00", clientName: "Lucas Oliveira",  barberName: "Rafael Mendes",   serviceName: "Corte Clássico",      servicePrice: 35, status: "concluido" },
  { id: "m3", slot: "10:00 – 10:30", clientName: "Pedro Costa",     barberName: "Diego Santos",    serviceName: "Barba",               servicePrice: 25, status: "concluido" },
  { id: "m4", slot: "10:30 – 11:00", clientName: "Marcos Lima",     barberName: "Lucas Ferreira",  serviceName: "Combo (Corte + Barba)", servicePrice: 55, status: "concluido" },
  { id: "m5", slot: "11:00 – 11:30", clientName: "André Santos",    barberName: "Carlos Silva",    serviceName: "Hidratação Capilar",  servicePrice: 30, status: "concluido" },
  { id: "m6", slot: "14:00 – 14:30", clientName: "Felipe Torres",   barberName: "Rafael Mendes",   serviceName: "Degradê",             servicePrice: 40, status: "confirmado" },
  { id: "m7", slot: "14:30 – 15:00", clientName: "Gabriel Rocha",   barberName: "Diego Santos",    serviceName: "Corte Clássico",      servicePrice: 35, status: "confirmado" },
  { id: "m8", slot: "15:00 – 15:30", clientName: "Rodrigo Alves",   barberName: "Lucas Ferreira",  serviceName: "Barba",               servicePrice: 25, status: "confirmado" },
  { id: "m9", slot: "16:00 – 16:30", clientName: "Bruno Martins",   barberName: "Carlos Silva",    serviceName: "Combo (Corte + Barba)", servicePrice: 55, status: "confirmado" },
];

const BARBERS_MOCK = [
  { name: "Carlos Silva",   bookings: 3, revenue: 125 },
  { name: "Rafael Mendes", bookings: 2, revenue: 75  },
  { name: "Diego Santos",  bookings: 2, revenue: 60  },
  { name: "Lucas Ferreira",bookings: 2, revenue: 80  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  concluido:  { label: "Concluído",  className: "bg-available/10 text-available border-available/30" },
  confirmado: { label: "Confirmado", className: "bg-primary/10 text-primary border-primary/30" },
  cancelado:  { label: "Cancelado",  className: "bg-unavailable/10 text-unavailable border-unavailable/30" },
};

// ─── Componente ──────────────────────────────────────────────────────────────

const AdminPage = () => {
  const navigate = useNavigate();
  const { bookings } = useReservations();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "todos">("todos");

  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Agendamentos reais de hoje convertidos para AdminBooking
  const realToday: AdminBooking[] = bookings
    .filter((b) => b.date === todayStr)
    .map((b) => ({
      id: b.id,
      slot: b.slot,
      clientName: b.clientName,
      barberName: b.barberName,
      serviceName: b.serviceName,
      servicePrice: b.servicePrice,
      status: "confirmado" as BookingStatus,
    }));

  // Combina mock + reais (reais aparecem primeiro)
  const allToday = [...realToday, ...TODAY_MOCK];

  const filtered = statusFilter === "todos"
    ? allToday
    : allToday.filter((b) => b.status === statusFilter);

  // Métricas do dia
  const totalToday   = allToday.length;
  const revenueToday = allToday.reduce((sum, b) => sum + b.servicePrice, 0);
  const concluded    = allToday.filter((b) => b.status === "concluido").length;
  const upcoming     = allToday.filter((b) => b.status === "confirmado").length;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Admin Header ── */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
            <Scissors className="w-4 h-4 text-background" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground leading-tight">Barber Time</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">
              Painel Admin
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block capitalize">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </span>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver site</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* ── Métricas do dia ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Hoje
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

            <MetricCard
              icon={<CalendarDays className="w-4 h-4" />}
              label="Agendamentos"
              value={String(totalToday)}
              sub={`${concluded} concluídos · ${upcoming} a seguir`}
            />
            <MetricCard
              icon={<DollarSign className="w-4 h-4" />}
              label="Receita do dia"
              value={`R$ ${revenueToday}`}
              sub={`${concluded} serviços realizados`}
              highlight
            />
            <MetricCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Receita do mês"
              value="R$ 6.840"
              sub="↑ 12% vs mês anterior"
            />
            <MetricCard
              icon={<Users className="w-4 h-4" />}
              label="Clientes no mês"
              value="52"
              sub="Serviço top: Degradê"
            />
          </div>
        </section>

        {/* ── Resumo por barbeiro ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Barbeiros hoje
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BARBERS_MOCK.map((b) => (
              <div key={b.name} className="bg-card border border-border rounded-md px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Scissors className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-foreground leading-tight truncate">
                    {b.name.split(" ")[0]}
                  </p>
                </div>
                <p className="text-lg font-bold text-foreground">{b.bookings}</p>
                <p className="text-[11px] text-muted-foreground">
                  agend. · <span className="text-primary font-semibold">R$ {b.revenue}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Agenda do dia ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Agenda do dia
            </p>
            {/* Filtro de status */}
            <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
              {(["todos", "confirmado", "concluido", "cancelado"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "text-[11px] font-medium px-2.5 py-1 rounded-sm transition-colors capitalize",
                    statusFilter === f
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f === "todos" ? "Todos" : statusConfig[f].label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-md overflow-hidden">
            {/* Cabeçalho da tabela */}
            <div className="hidden sm:grid grid-cols-[80px_1fr_1fr_1fr_72px_88px] gap-3 px-4 py-2.5 border-b border-border bg-muted/30">
              {["Horário", "Cliente", "Barbeiro", "Serviço", "Valor", "Status"].map((h) => (
                <p key={h} className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {h}
                </p>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Clock className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">Nenhum agendamento encontrado</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((b) => (
                  <div
                    key={b.id}
                    className={cn(
                      "grid grid-cols-1 sm:grid-cols-[80px_1fr_1fr_1fr_72px_88px] gap-1 sm:gap-3 px-4 py-3 items-center",
                      b.status === "concluido" && "opacity-60"
                    )}
                  >
                    {/* Horário */}
                    <p className="font-mono text-xs font-bold text-foreground">{b.slot}</p>

                    {/* Cliente */}
                    <p className="text-sm font-medium text-foreground truncate">{b.clientName}</p>

                    {/* Barbeiro */}
                    <p className="text-sm text-muted-foreground truncate">{b.barberName}</p>

                    {/* Serviço */}
                    <p className="text-sm text-muted-foreground truncate">{b.serviceName}</p>

                    {/* Valor */}
                    <p className="text-sm font-semibold text-foreground">
                      R$ {b.servicePrice}
                    </p>

                    {/* Status */}
                    <span className={cn(
                      "inline-flex items-center justify-center text-[10px] font-semibold px-2 py-0.5 rounded-sm border w-fit",
                      statusConfig[b.status].className
                    )}>
                      {statusConfig[b.status].label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Rodapé com total */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                <p className="text-xs text-muted-foreground">
                  {filtered.length} agendamento{filtered.length !== 1 ? "s" : ""}
                </p>
                <p className="text-sm font-bold text-primary">
                  R$ {filtered.reduce((s, b) => s + b.servicePrice, 0)},00
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Serviços mais pedidos ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Serviços mais pedidos este mês
          </p>
          <div className="bg-card border border-border rounded-md divide-y divide-border overflow-hidden">
            {[
              { name: "Degradê",              count: 18, pct: 100 },
              { name: "Corte Clássico",       count: 14, pct: 78  },
              { name: "Combo (Corte + Barba)",count: 10, pct: 56  },
              { name: "Barba",                count: 7,  pct: 39  },
              { name: "Hidratação Capilar",   count: 3,  pct: 17  },
            ].map((svc, i) => (
              <div key={svc.name} className="flex items-center gap-4 px-4 py-3">
                <span className="text-[11px] font-bold text-muted-foreground/40 w-4 shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground truncate">{svc.name}</p>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      {i === 0 && <Star className="w-3 h-3 text-primary fill-primary" />}
                      <p className="text-xs font-semibold text-muted-foreground">{svc.count}×</p>
                    </div>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded-full transition-all"
                      style={{ width: `${svc.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

// ─── Sub-componente: card de métrica ─────────────────────────────────────────

const MetricCard = ({
  icon,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) => (
  <div className={cn(
    "rounded-md border p-4",
    highlight
      ? "bg-primary text-primary-foreground border-primary/80"
      : "bg-card border-border text-foreground"
  )}>
    <div className={cn(
      "w-7 h-7 rounded-md flex items-center justify-center mb-3",
      highlight ? "bg-primary-foreground/15" : "bg-muted"
    )}>
      <span className={highlight ? "text-primary-foreground" : "text-muted-foreground"}>
        {icon}
      </span>
    </div>
    <p className={cn(
      "text-[11px] font-semibold uppercase tracking-wider mb-1",
      highlight ? "text-primary-foreground/70" : "text-muted-foreground"
    )}>
      {label}
    </p>
    <p className={cn("text-2xl font-bold leading-tight", highlight ? "text-primary-foreground" : "text-foreground")}>
      {value}
    </p>
    <p className={cn("text-[11px] mt-1", highlight ? "text-primary-foreground/60" : "text-muted-foreground")}>
      {sub}
    </p>
  </div>
);

export default AdminPage;
