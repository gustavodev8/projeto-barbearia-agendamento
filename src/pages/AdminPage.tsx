import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReservations } from "@/contexts/ReservationContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  Sparkles, CalendarDays, TrendingUp, Users, DollarSign,
  ArrowLeft, Clock, AlertTriangle, UserX, ShieldAlert,
  Timer, ChevronRight, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type BookingStatus = "concluido" | "confirmado" | "cancelado" | "reagendamento" | "nao_compareceu";

interface AdminBooking {
  id: string; slot: string; clientName: string;
  professionalId: string; professionalName: string;
  serviceName: string; servicePrice: number;
  status: BookingStatus;
  validationCode?: string;
}

interface ProfessionalInfo {
  id: string; name: string; bookings: number; revenue: number;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  concluido:      { label: "Concluído",      className: "bg-emerald-50 text-emerald-700 border-emerald-200"     },
  confirmado:     { label: "Confirmado",     className: "bg-blue-50 text-blue-700 border-blue-200"           },
  cancelado:      { label: "Cancelado",      className: "bg-rose-50 text-rose-700 border-rose-200" },
  reagendamento:  { label: "Reagend.",       className: "bg-amber-50 text-amber-700 border-amber-200"        },
  nao_compareceu: { label: "Ausente",        className: "bg-slate-100 text-slate-600 border-slate-300"              },
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { bookings: contextBookings } = useReservations();

  const [dbBookings, setDbBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [absentProfessionals,  setAbsentProfessionals]  = useState<Set<string>>(new Set());
  const [lateProfessionals,    setLateProfessionals]    = useState<Set<string>>(new Set());
  const [overrideStatus, setOverrideStatus] = useState<Record<string, BookingStatus>>({});
  const [emergencyClosed, setEmergencyClosed] = useState(false);
  const [confirm, setConfirm]               = useState<{ title: string; description: string; onConfirm: () => void } | null>(null);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Busca todos os agendamentos do dia do Supabase
  useEffect(() => {
    const fetchAllToday = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          professionals (name),
          services (name, price)
        `)
        .eq('date', todayStr);

      if (!error && data) {
        const formatted: AdminBooking[] = data.map(b => ({
          id: b.id,
          slot: b.slot,
          clientName: b.client_name,
          professionalId: b.professional_id,
          professionalName: b.professionals?.name || "Especialista",
          serviceName: b.services?.name || "Serviço",
          servicePrice: Number(b.services?.price || 0),
          status: "confirmado"
        }));
        setDbBookings(formatted);
      }
      setLoading(false);
    };

    fetchAllToday();
  }, [todayStr]);

  const allToday: AdminBooking[] = dbBookings.map((b) => {
    if (overrideStatus[b.id])                                                 return { ...b, status: overrideStatus[b.id] };
    if (emergencyClosed)                                                      return { ...b, status: "cancelado" };
    if (absentProfessionals.has(b.professionalId) && b.status === "confirmado") return { ...b, status: "reagendamento" };
    return b;
  });

  const concluded       = allToday.filter((b) => b.status === "concluido").length;
  const upcoming        = allToday.filter((b) => b.status === "confirmado").length;
  const needsReschedule = allToday.filter((b) => b.status === "reagendamento").length;
  const noShowFees      = allToday.filter((b) => b.status === "nao_compareceu").reduce((s, b) => s + Math.round(b.servicePrice * 0.5), 0);
  const revenueRealized = allToday.filter((b) => b.status === "concluido").reduce((s, b) => s + b.servicePrice, 0) + noShowFees;

  const markAbsent = (profId: string, profName: string) => {
    const affected = allToday.filter((b) => b.professionalId === profId && b.status === "confirmado").length;
    setConfirm({
      title: `Confirmar Ausência`,
      description: `${profName} tem ${affected} agendamento(s) hoje. Eles serão movidos para "Reagendamento".`,
      onConfirm: () => setAbsentProfessionals((p) => new Set(p).add(profId)),
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-base text-white leading-tight">Painel Administrativo</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Beleza & Estilo · Alagoinhas</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-bold text-white px-5 py-2.5 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          <span>Voltar ao Site</span>
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard 
            icon={<DollarSign className="w-5 h-5" />} 
            label="Receita Realizada" 
            value={`R$ ${revenueRealized}`} 
            sub={`${concluded} serviços fechados`}
            primary
          />
          <MetricCard 
            icon={<CalendarDays className="w-5 h-5" />} 
            label="Agendamentos" 
            value={String(allToday.length)} 
            sub={`${upcoming} aguardando`}
          />
          <MetricCard icon={<Users className="w-5 h-5" />} label="Novos Clientes" value="--" sub="Sincronizando..." />
          <MetricCard icon={<TrendingUp className="w-5 h-5" />} label="Meta Mensal" value="--" sub="R$ -- / R$ 10k" />
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                <h2 className="font-bold text-slate-800">Agenda do Dia</h2>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="py-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">
                  Buscando agendamentos...
                </div>
              ) : allToday.length === 0 ? (
                <div className="py-20 text-center">
                  <Clock className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-bold">Sem agendamentos para hoje</p>
                </div>
              ) : (
                allToday.map((b) => (
                  <div key={b.id} className="p-6 flex items-center gap-8 hover:bg-slate-50/80 transition-colors group">
                    <div className="w-24 shrink-0">
                      <p className="text-base font-black text-slate-900 leading-none mb-1">{b.slot.split(' – ')[0]}</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{b.slot.split(' – ')[1]}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-slate-900 leading-tight mb-1 truncate">{b.clientName}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded uppercase tracking-tighter border border-primary/10">
                          {b.professionalName}
                        </span>
                        <span className="text-xs text-slate-500 font-medium italic">
                          {b.serviceName}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-slate-900 mb-2">R$ {b.servicePrice}</p>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md border shadow-sm block text-center",
                        STATUS_CONFIG[b.status].className
                      )}>
                        {STATUS_CONFIG[b.status].label}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <div className="space-y-8">
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-slate-900">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                Painel de Controle
              </h2>
              <div className="space-y-4">
                 <p className="text-xs text-slate-500 leading-relaxed">
                   Os dados acima são sincronizados automaticamente com o banco de dados Supabase em Alagoinhas.
                 </p>
                 <div className="flex flex-col items-center gap-2 py-10 opacity-30">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Quartzus</p>
                    <div className="h-px w-20 bg-slate-300" />
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Database Sincronizado</p>
                 </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

const MetricCard = ({ icon, label, value, sub, primary = false }: any) => (
  <div className={cn(
    "p-6 rounded-xl border transition-all shadow-sm",
    primary ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
  )}>
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-2 rounded-lg", primary ? "bg-primary/20 text-primary" : "bg-slate-100 text-slate-500")}>
        {icon}
      </div>
    </div>
    <p className={cn("text-[11px] font-bold uppercase tracking-widest mb-1 opacity-60", primary ? "text-slate-400" : "text-slate-500")}>
      {label}
    </p>
    <p className="text-3xl font-black tracking-tight mb-2 leading-none">{value}</p>
    <p className={cn("text-xs font-medium", primary ? "text-slate-500" : "text-slate-400")}>{sub}</p>
  </div>
);

export default AdminPage;
