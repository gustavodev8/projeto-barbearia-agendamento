import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, isToday, parseISO, addDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  Sparkles, CalendarDays, TrendingUp, Users, DollarSign,
  ArrowLeft, Clock, UserX, LayoutDashboard, 
  Users2, Calendar as CalendarIcon, Search,
  MoreVertical, CheckCircle2, XCircle,
  RefreshCw, SlidersHorizontal, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

type BookingStatus = "concluido" | "confirmado" | "cancelado" | "nao_compareceu";

interface AdminBooking {
  id: string; slot: string; clientName: string;
  professionalId: string; professionalName: string;
  serviceName: string; servicePrice: number;
  status: BookingStatus; date: string;
  created_at: string; validationCode: string;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  concluido:      { label: "Finalizado", color: "text-emerald-700", bg: "bg-emerald-100" },
  confirmado:     { label: "Agendado",   color: "text-blue-700",    bg: "bg-blue-100"    },
  cancelado:      { label: "Cancelado",  color: "text-rose-700",    bg: "bg-rose-100"    },
  nao_compareceu: { label: "Ausente",    color: "text-slate-600",   bg: "bg-slate-200"   },
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("today");

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const fetchBookings = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`*, professionals (name), services (name, price)`)
        .order('date', { ascending: false })
        .order('slot', { ascending: true });
      if (error) throw error;
      if (data) {
        setBookings(data.map(b => ({
          id: b.id, slot: b.slot, clientName: b.client_name,
          professionalId: b.professional_id, professionalName: b.professionals?.name || "Especialista",
          serviceName: b.services?.name || "Serviço", servicePrice: Number(b.services?.price || 0),
          status: (b.status as BookingStatus) || "confirmado", date: b.date,
          created_at: b.created_at, validationCode: b.validation_code
        })));
      }
    } catch {
      toast.error("Erro ao sincronizar");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateBookingStatus = async (id: string, newStatus: BookingStatus) => {
    const previous = [...bookings];
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    try {
      const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success("Salvo!");
    } catch {
      setBookings(previous);
      toast.error("Erro ao salvar");
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           b.validationCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || b.status === filterStatus;
      let matchesDate = true;
      if (dateRange === "today") matchesDate = b.date === todayStr;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, searchTerm, filterStatus, dateRange, todayStr]);

  const stats = useMemo(() => {
    const today = bookings.filter(b => b.date === todayStr);
    const completed = today.filter(b => b.status === "concluido");
    return {
      revenue: completed.reduce((acc, b) => acc + b.servicePrice, 0),
      totalToday: today.length,
      completedCount: completed.length,
      pendingToday: today.filter(b => b.status === "confirmado").length
    };
  }, [bookings, todayStr]);

  return (
    <div className="flex min-h-screen bg-[#0F172A]">

      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-xl">
            <Sparkles className="h-5 w-5 text-primary fill-current" />
          </div>
          <h1 className="font-black text-lg tracking-tight uppercase">Beleza & Estilo</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => fetchBookings(true)} className={cn("text-slate-400 p-2", isRefreshing && "animate-spin text-primary")}>
            <RefreshCw className="h-6 w-6" />
          </button>
          <button onClick={() => navigate("/")} className="text-slate-400 p-2 hover:text-rose-500">
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </header>

      <main className="px-6 py-8 max-w-lg mx-auto space-y-10">
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 leading-none">Dashboard</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
            </div>

            <div className="flex flex-col gap-4">
              <MetricTile label="Receita Realizada" value={`R$ ${stats.revenue}`} sub={`${stats.completedCount} atendimentos`} icon={<DollarSign className="h-6 w-6" />} color="emerald" />
              <MetricTile label="Total de Agenda" value={stats.totalToday.toString()} sub={`${stats.pendingToday} pendentes`} icon={<CalendarDays className="h-6 w-6" />} color="blue" />
              <MetricTile label="Taxa de Ocupação" value={`${stats.totalToday > 0 ? Math.round((stats.completedCount / stats.totalToday) * 100) : 0}%`} sub="Performance" icon={<TrendingUp className="h-6 w-6" />} color="indigo" />
            </div>

            <div className="pt-4 space-y-5">
               <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Fila de Atendimento</h3>
                  <button onClick={() => setActiveTab("appointments")} className="text-xs font-black text-primary uppercase">Ver todos</button>
               </div>
               
               <div className="space-y-3">
                 {bookings.filter(b => b.date === todayStr).slice(0, 5).map((b) => (
                    <div key={b.id} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-md flex items-center justify-between">
                       <div className="flex items-center gap-5">
                          <div className="bg-slate-50 h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm text-slate-500 border border-slate-100">
                             {b.slot.split(':')[0]}h
                          </div>
                          <div>
                             <p className="text-base font-black leading-none text-slate-900">{b.clientName}</p>
                             <p className="text-xs font-bold text-amber-600 mt-1.5 uppercase tracking-tighter">Cód: {b.validationCode}</p>
                          </div>
                       </div>
                       <Badge className={cn("text-[10px] font-black px-3 py-1 rounded-lg border-none shadow-sm", STATUS_CONFIG[b.status].bg, STATUS_CONFIG[b.status].color)}>
                         {STATUS_CONFIG[b.status].label}
                       </Badge>
                    </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-slate-900">Agenda</h2>
              <Button onClick={() => setIsFilterOpen(!isFilterOpen)} variant="ghost" className="h-10 gap-2 bg-slate-100 rounded-xl px-4 text-xs font-black uppercase">
                <SlidersHorizontal className="h-4 w-4" /> Filtros
              </Button>
            </div>

            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <CollapsibleContent className="animate-in slide-in-from-top-2">
                 <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-lg space-y-4 mb-6">
                    <Input placeholder="Buscar por nome ou código..." className="h-12 bg-slate-50 border-none rounded-2xl text-sm px-4 font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <div className="grid grid-cols-2 gap-3">
                       <select className="h-12 px-4 rounded-2xl bg-slate-50 border-none text-xs font-bold outline-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                          <option value="all">Status: Todos</option>
                          <option value="confirmado">Pendentes</option>
                          <option value="concluido">Concluídos</option>
                       </select>
                       <select className="h-12 px-4 rounded-2xl bg-slate-50 border-none text-xs font-bold outline-none" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                          <option value="today">Apenas Hoje</option>
                          <option value="all">Histórico</option>
                       </select>
                    </div>
                 </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="space-y-4">
               {filteredBookings.map((b) => (
                  <div key={b.id} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-xl space-y-6">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-lg font-black tracking-tight text-slate-900">{b.clientName}</p>
                          <div className="flex flex-col gap-1 mt-2">
                             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{b.serviceName}</span>
                             <span className="text-xs font-black text-amber-600 uppercase">#{b.validationCode}</span>
                          </div>
                       </div>
                       <Badge className={cn("text-[10px] font-black px-3 py-1 rounded-lg border-none shadow-sm", STATUS_CONFIG[b.status].bg, STATUS_CONFIG[b.status].color)}>
                         {STATUS_CONFIG[b.status].label}
                       </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Horário</span>
                          <span className="text-lg font-black text-slate-900 mt-1">{b.slot.split(':')[0]}h</span>
                       </div>
                       <div className="flex gap-3">
                          <Button onClick={() => updateBookingStatus(b.id, "concluido")} className="h-12 px-6 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest shadow-xl">
                            Validar
                          </Button>
                          <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <button className="h-12 w-12 flex items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                                 <MoreVertical className="h-6 w-6 text-slate-400" />
                               </button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl">
                                <DropdownMenuItem onClick={() => updateBookingStatus(b.id, "nao_compareceu")} className="rounded-xl font-bold py-3 px-4 text-sm gap-3 cursor-pointer">Ausente</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateBookingStatus(b.id, "cancelado")} className="rounded-xl font-bold py-3 px-4 text-sm text-rose-500 gap-3 cursor-pointer">Cancelar</DropdownMenuItem>
                             </DropdownMenuContent>
                          </DropdownMenu>
                       </div>
                    </div>
                  </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === "professionals" && (
           <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-8 animate-in zoom-in duration-300">
             <div className="bg-white h-16 w-16 rounded-[24px] shadow-xl flex items-center justify-center text-slate-200 border border-slate-50 mb-6">
                <Users2 className="h-8 w-8" />
             </div>
             <h2 className="text-xl font-black uppercase tracking-tight">Equipe</h2>
             <p className="text-sm text-slate-500 font-medium italic mt-2 leading-relaxed">Em breve o painel de gerenciamento de especialistas.</p>
             <Button variant="outline" onClick={() => setActiveTab("dashboard")} className="mt-8 rounded-xl h-12 px-8 font-black text-xs uppercase border-slate-200">Voltar</Button>
           </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-6 right-6 z-50 bg-slate-900/95 backdrop-blur-xl rounded-[32px] px-8 py-5 flex items-center justify-between shadow-2xl border border-white/10">
        {[
          { id: "dashboard", label: "Início", icon: LayoutDashboard },
          { id: "appointments", label: "Agenda", icon: CalendarIcon },
          { id: "professionals", label: "Equipe", icon: Users2 },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-300",
              activeTab === item.id ? "text-primary scale-110" : "text-slate-500"
            )}
          >
            <item.icon className="h-7 w-7" />
            {activeTab === item.id && (
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

const MetricTile = ({ label, value, sub, icon, color }: any) => {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100",
    blue: "bg-blue-50 text-blue-600 shadow-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 shadow-indigo-100",
  };
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-md flex items-center justify-between active:scale-[0.98] transition-transform">
      <div className="flex items-center gap-5">
        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner", colors[color])}>
           {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-900 leading-none tracking-tight">{value}</p>
        </div>
      </div>
      <div className="text-right hidden xs:block">
        <p className="text-xs font-bold text-slate-400 italic opacity-80">{sub}</p>
      </div>
    </div>
  );
};

export default AdminPage;
