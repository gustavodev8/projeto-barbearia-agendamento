import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  Sparkles, CalendarDays, TrendingUp, DollarSign,
  LayoutDashboard, Users2, Calendar as CalendarIcon,
  MoreVertical, RefreshCw, LogOut, Menu, SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
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

const NAV_ITEMS = [
  { id: "dashboard",     label: "Início", icon: LayoutDashboard },
  { id: "appointments",  label: "Agenda", icon: CalendarIcon    },
  { id: "professionals", label: "Equipe", icon: Users2          },
];

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]     = useState("dashboard");
  const [bookings, setBookings]       = useState<AdminBooking[]>([]);
  const [loading, setLoading]         = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [searchTerm,    setSearchTerm]    = useState("");
  const [filterStatus,  setFilterStatus]  = useState<string>("all");
  const [dateRange,     setDateRange]     = useState<string>("today");

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const fetchBookings = async (silent = false) => {
    if (!silent) setLoading(true); else setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, professionals (name), services (name, price)")
        .order("date", { ascending: false })
        .order("slot", { ascending: true });
      if (error) throw error;
      if (data) {
        setBookings(data.map(b => ({
          id: b.id, slot: b.slot, clientName: b.client_name,
          professionalId: b.professional_id,
          professionalName: b.professionals?.name || "Especialista",
          serviceName: b.services?.name || "Serviço",
          servicePrice: Number(b.services?.price || 0),
          status: (b.status as BookingStatus) || "confirmado",
          date: b.date, created_at: b.created_at,
          validationCode: b.validation_code,
        })));
      }
    } catch {
      toast.error("Erro ao sincronizar");
    } finally {
      setLoading(false); setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateBookingStatus = async (id: string, newStatus: BookingStatus) => {
    const previous = [...bookings];
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    try {
      const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      toast.success("Salvo!");
    } catch {
      setBookings(previous);
      toast.error("Erro ao salvar");
    }
  };

  const filteredBookings = useMemo(() => bookings.filter(b => {
    const matchesSearch  = b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           b.validationCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus  = filterStatus === "all" || b.status === filterStatus;
    const matchesDate    = dateRange !== "today" || b.date === todayStr;
    return matchesSearch && matchesStatus && matchesDate;
  }), [bookings, searchTerm, filterStatus, dateRange, todayStr]);

  const stats = useMemo(() => {
    const today     = bookings.filter(b => b.date === todayStr);
    const completed = today.filter(b => b.status === "concluido");
    return {
      revenue:        completed.reduce((acc, b) => acc + b.servicePrice, 0),
      totalToday:     today.length,
      completedCount: completed.length,
      pendingToday:   today.filter(b => b.status === "confirmado").length,
    };
  }, [bookings, todayStr]);

  const handleNav = (id: string) => { setActiveTab(id); setSidebarOpen(false); };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0F172A]">

      {/* ── Sidebar drawer ── */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="p-0 w-64 border-none bg-[#0F172A] [&>button]:text-white/40 [&>button]:hover:text-white/70"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de navegação</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-full">
            {/* logo */}
            <div className="px-5 pt-8 pb-6 border-b border-white/[0.07]">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-black text-sm tracking-tight uppercase text-white leading-none">
                    Beleza & Estilo
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">
                    Admin
                  </p>
                </div>
              </div>
            </div>

            {/* nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150",
                    activeTab === item.id
                      ? "bg-primary text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* logout */}
            <div className="px-3 pb-6 pt-4 border-t border-white/[0.07]">
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-150"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                Sair
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm w-full">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 flex-1">
          <div className="bg-slate-900 p-1.5 rounded-lg">
            <Sparkles className="h-4 w-4 text-primary fill-current" />
          </div>
          <h1 className="font-black text-sm tracking-tight uppercase">Beleza & Estilo</h1>
        </div>

        <button
          onClick={() => fetchBookings(true)}
          className={cn(
            "p-2 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors",
            isRefreshing && "animate-spin text-primary"
          )}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </header>

      {/* ── Main ── */}
      <main className="w-full flex-1 px-4 py-5 max-w-lg mx-auto space-y-5 pb-8">

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400">
            <div className="space-y-0.5 px-1">
              <h2 className="text-xl font-black text-white leading-none">Dashboard</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <MetricTile
                label="Receita Realizada"
                value={`R$ ${stats.revenue}`}
                sub={`${stats.completedCount} atendimentos`}
                icon={<DollarSign className="h-4 w-4" />}
                color="emerald"
              />
              <MetricTile
                label="Total de Agenda"
                value={stats.totalToday.toString()}
                sub={`${stats.pendingToday} pendentes`}
                icon={<CalendarDays className="h-4 w-4" />}
                color="blue"
              />
              <MetricTile
                label="Taxa de Ocupação"
                value={`${stats.totalToday > 0 ? Math.round((stats.completedCount / stats.totalToday) * 100) : 0}%`}
                sub="Performance"
                icon={<TrendingUp className="h-4 w-4" />}
                color="indigo"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Fila de Atendimento
                </h3>
                <button
                  onClick={() => setActiveTab("appointments")}
                  className="text-[10px] font-black text-primary uppercase"
                >
                  Ver todos
                </button>
              </div>

              <div className="space-y-2">
                {bookings.filter(b => b.date === todayStr).slice(0, 5).map(b => (
                  <div
                    key={b.id}
                    className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-50 h-9 w-9 rounded-lg flex items-center justify-center font-black text-xs text-slate-500 border border-slate-100 flex-shrink-0">
                        {b.slot.split(":")[0]}h
                      </div>
                      <div>
                        <p className="text-sm font-black leading-none text-slate-900">{b.clientName}</p>
                        <p className="text-[10px] font-bold text-amber-600 mt-0.5 uppercase tracking-tighter">
                          Cód: {b.validationCode}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-md border-none flex-shrink-0",
                        STATUS_CONFIG[b.status].bg, STATUS_CONFIG[b.status].color
                      )}
                    >
                      {STATUS_CONFIG[b.status].label}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Agenda */}
        {activeTab === "appointments" && (
          <div className="space-y-4 animate-in fade-in duration-400">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-black text-white">Agenda</h2>
              <Button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                variant="ghost"
                className="h-8 gap-1.5 bg-white/5 rounded-lg px-3 text-[10px] font-black uppercase text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <SlidersHorizontal className="h-3 w-3" /> Filtros
              </Button>
            </div>

            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <CollapsibleContent className="animate-in slide-in-from-top-2">
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/[0.07] space-y-2.5 mb-3">
                  <Input
                    placeholder="Buscar por nome ou código…"
                    className="h-9 bg-white/10 border-none rounded-lg text-xs px-3 font-medium text-white placeholder:text-slate-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="h-9 px-3 rounded-lg bg-white/10 border-none text-[11px] font-bold outline-none text-white"
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                    >
                      <option value="all"       className="bg-slate-900">Status: Todos</option>
                      <option value="confirmado" className="bg-slate-900">Pendentes</option>
                      <option value="concluido"  className="bg-slate-900">Concluídos</option>
                    </select>
                    <select
                      className="h-9 px-3 rounded-lg bg-white/10 border-none text-[11px] font-bold outline-none text-white"
                      value={dateRange}
                      onChange={e => setDateRange(e.target.value)}
                    >
                      <option value="today" className="bg-slate-900">Apenas Hoje</option>
                      <option value="all"   className="bg-slate-900">Histórico</option>
                    </select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="space-y-2.5">
              {filteredBookings.map(b => (
                <div key={b.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="text-sm font-black tracking-tight text-slate-900">{b.clientName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{b.serviceName}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[10px] font-bold text-amber-600 uppercase">#{b.validationCode}</span>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-md border-none flex-shrink-0",
                        STATUS_CONFIG[b.status].bg, STATUS_CONFIG[b.status].color
                      )}
                    >
                      {STATUS_CONFIG[b.status].label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                        Horário
                      </span>
                      <span className="text-base font-black text-slate-900 mt-0.5 block">
                        {b.slot.split(":")[0]}h
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateBookingStatus(b.id, "concluido")}
                        className="h-8 px-4 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider"
                      >
                        Validar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white">
                            <MoreVertical className="h-4 w-4 text-slate-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 p-1.5 rounded-xl shadow-xl">
                          <DropdownMenuItem
                            onClick={() => updateBookingStatus(b.id, "nao_compareceu")}
                            className="rounded-lg font-bold py-2 px-3 text-sm cursor-pointer"
                          >
                            Ausente
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateBookingStatus(b.id, "cancelado")}
                            className="rounded-lg font-bold py-2 px-3 text-sm text-rose-500 cursor-pointer"
                          >
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipe */}
        {activeTab === "professionals" && (
          <div className="flex flex-col items-center justify-center min-h-[380px] text-center px-8 animate-in zoom-in duration-300">
            <div className="bg-white/5 h-12 w-12 rounded-2xl flex items-center justify-center text-slate-500 border border-white/10 mb-4">
              <Users2 className="h-6 w-6" />
            </div>
            <h2 className="text-base font-black uppercase tracking-tight text-white">Equipe</h2>
            <p className="text-xs text-slate-500 font-medium italic mt-1.5 leading-relaxed">
              Em breve o painel de gerenciamento de especialistas.
            </p>
            <Button
              variant="outline"
              onClick={() => setActiveTab("dashboard")}
              className="mt-6 rounded-xl h-9 px-6 font-black text-xs uppercase border-white/10 text-white hover:bg-white/5"
            >
              Voltar
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

const MetricTile = ({ label, value, sub, icon, color }: {
  label: string; value: string; sub: string;
  icon: React.ReactNode; color: "emerald" | "blue" | "indigo";
}) => {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue:    "bg-blue-50    text-blue-600",
    indigo:  "bg-indigo-50  text-indigo-600",
  };
  return (
    <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3.5 active:scale-[0.98] transition-transform">
      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0", colors[color])}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-xl font-black text-slate-900 leading-none tracking-tight">{value}</p>
      </div>
      <p className="text-[10px] font-semibold text-slate-300 italic text-right hidden xs:block flex-shrink-0">{sub}</p>
    </div>
  );
};

export default AdminPage;
