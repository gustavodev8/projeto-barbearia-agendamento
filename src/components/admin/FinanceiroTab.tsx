import { useMemo } from "react";
import { format, subDays, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, TrendingUp, Target, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminBooking } from "@/types/admin";

interface Props {
  bookings: AdminBooking[];
}

const fmt = (v: number) =>
  `R$ ${v.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

const FinanceiroTab = ({ bookings }: Props) => {
  const today    = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const monthStart = format(startOfMonth(today), "yyyy-MM-dd");

  const metrics = useMemo(() => {
    const completed    = bookings.filter(b => b.status === "concluido");
    const thisMonth    = completed.filter(b => b.date >= monthStart);
    const totalRevenue = completed.reduce((sum, b) => sum + b.servicePrice, 0);
    const monthRevenue = thisMonth.reduce((sum, b) => sum + b.servicePrice, 0);
    const avgTicket    = completed.length > 0 ? totalRevenue / completed.length : 0;
    const completionRate = bookings.length > 0
      ? (completed.length / bookings.length) * 100
      : 0;
    return { totalRevenue, monthRevenue, avgTicket, completionRate, completedCount: completed.length };
  }, [bookings, monthStart]);

  const last7Days = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date    = subDays(today, 6 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const revenue = bookings
        .filter(b => b.date === dateStr && b.status === "concluido")
        .reduce((sum, b) => sum + b.servicePrice, 0);
      return {
        label:   format(date, "EEE", { locale: ptBR }),
        date:    dateStr,
        revenue,
        isToday: dateStr === todayStr,
      };
    });
    const maxRevenue = Math.max(...days.map(d => d.revenue), 1);
    return days.map(d => ({ ...d, pct: d.revenue / maxRevenue }));
  }, [bookings, todayStr]);

  const topServices = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>();
    bookings
      .filter(b => b.status === "concluido")
      .forEach(b => {
        const curr = map.get(b.serviceName) ?? { count: 0, revenue: 0 };
        map.set(b.serviceName, { count: curr.count + 1, revenue: curr.revenue + b.servicePrice });
      });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);
  }, [bookings]);

  const statusDist = useMemo(() => {
    const total = bookings.length;
    if (total === 0) return [];
    const count = (s: string) => bookings.filter(b => b.status === s).length;
    return [
      { label: "Finalizados", n: count("concluido"),      color: "bg-emerald-400" },
      { label: "Agendados",   n: count("confirmado"),     color: "bg-blue-400"    },
      { label: "Cancelados",  n: count("cancelado"),      color: "bg-rose-400"    },
      { label: "Ausentes",    n: count("nao_compareceu"), color: "bg-slate-300"   },
    ]
      .filter(s => s.n > 0)
      .map(s => ({ ...s, pct: s.n / total }));
  }, [bookings]);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div className="px-1">
        <h2 className="text-2xl font-black text-slate-900">Financeiro</h2>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
          Resumo geral
        </p>
      </div>

      {/* Metric cards 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Receita Total"  value={fmt(metrics.totalRevenue)}  sub={`${metrics.completedCount} atend.`}        icon={<DollarSign    className="h-4 w-4" />} color="emerald" />
        <MetricCard label="Este Mês"       value={fmt(metrics.monthRevenue)}  sub={format(today, "MMMM", { locale: ptBR })}   icon={<TrendingUp    className="h-4 w-4" />} color="blue"    />
        <MetricCard label="Ticket Médio"   value={fmt(metrics.avgTicket)}     sub="por atendimento"                           icon={<Target        className="h-4 w-4" />} color="indigo"  />
        <MetricCard label="Conclusão"      value={`${metrics.completionRate.toFixed(0)}%`} sub="taxa de sucesso"              icon={<CheckCircle2  className="h-4 w-4" />} color="rose"    />
      </div>

      {/* 7-day bar chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          Últimos 7 dias
        </p>
        <div className="flex items-end gap-1.5" style={{ height: 80 }}>
          {last7Days.map(day => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className={cn(
                  "w-full rounded-t-md transition-all duration-500",
                  day.isToday ? "bg-primary" : "bg-slate-100",
                  day.revenue === 0 && "rounded-md"
                )}
                style={{ height: `${Math.max(day.pct * 64, 4)}px` }}
              />
              <span className={cn(
                "text-[9px] font-black uppercase",
                day.isToday ? "text-primary" : "text-slate-400"
              )}>
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top services */}
      {topServices.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Top serviços
          </p>
          {topServices.map((svc, i) => {
            const maxRevenue = topServices[0]?.revenue || 1;
            return (
              <div key={svc.name} className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-300 w-3">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-black text-slate-700 truncate">{svc.name}</span>
                    <span className="text-xs font-black text-primary ml-2 flex-shrink-0">
                      {fmt(svc.revenue)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/50 rounded-full transition-all duration-500"
                      style={{ width: `${(svc.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-bold w-6 text-right flex-shrink-0">
                  {svc.count}x
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Status distribution */}
      {statusDist.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Distribuição de status
          </p>
          <div className="flex h-2 rounded-full overflow-hidden gap-px">
            {statusDist.map(s => (
              <div
                key={s.label}
                className={cn(s.color, "transition-all duration-500")}
                style={{ width: `${s.pct * 100}%` }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {statusDist.map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", s.color)} />
                <span className="text-[10px] text-slate-500 font-bold truncate">{s.label}</span>
                <span className="text-[10px] text-slate-400 ml-auto font-bold">{s.n}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {bookings.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Sem dados ainda</p>
        </div>
      )}
    </div>
  );
};

const METRIC_COLORS = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue:    "bg-blue-50    text-blue-600",
  indigo:  "bg-indigo-50  text-indigo-600",
  rose:    "bg-rose-50    text-primary",
} as const;

const MetricCard = ({ label, value, sub, icon, color }: {
  label: string; value: string; sub: string;
  icon: React.ReactNode; color: keyof typeof METRIC_COLORS;
}) => (
  <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-2.5", METRIC_COLORS[color])}>
      {icon}
    </div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-lg font-black text-slate-900 leading-tight mt-0.5 truncate">{value}</p>
    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{sub}</p>
  </div>
);

export default FinanceiroTab;
