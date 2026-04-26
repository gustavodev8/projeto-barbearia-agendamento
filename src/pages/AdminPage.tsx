import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  Sparkles, CalendarDays, TrendingUp, DollarSign,
  LayoutDashboard, Users2, Calendar as CalendarIcon,
  MoreVertical, RefreshCw, LogOut, Menu, SlidersHorizontal,
  User, Scissors, Clock, CalendarCheck, CreditCard,
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
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [isFilterOpen, setIsFilterOpen]   = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

  const [searchTerm,    setSearchTerm]    = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus,  setFilterStatus]  = useState<string>("all");
  const [dateRange,     setDateRange]     = useState<string>("today");
  const [sortOrder,     setSortOrder]     = useState<"asc" | "desc">("asc");

  const todayStr     = format(new Date(), "yyyy-MM-dd");
  const tomorrowStr  = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const weekStart    = format(startOfWeek(new Date(), { locale: ptBR }), "yyyy-MM-dd");
  const weekEnd      = format(endOfWeek(new Date(),   { locale: ptBR }), "yyyy-MM-dd");

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

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

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

  const filteredBookings = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();

    const filtered = bookings.filter(b => {
      const matchesSearch = !term ||
        b.clientName.toLowerCase().includes(term) ||
        b.validationCode.toLowerCase().includes(term) ||
        b.professionalName.toLowerCase().includes(term) ||
        b.serviceName.toLowerCase().includes(term);

      const matchesStatus = filterStatus === "all" || b.status === filterStatus;

      const matchesDate =
        dateRange === "all"    ? true :
        dateRange === "amanha" ? b.date === tomorrowStr :
        dateRange === "semana" ? b.date >= weekStart && b.date <= weekEnd :
        b.date === todayStr;

      return matchesSearch && matchesStatus && matchesDate;
    });

    return filtered.sort((a, b) =>
      sortOrder === "asc"
        ? a.slot.localeCompare(b.slot)
        : b.slot.localeCompare(a.slot)
    );
  }, [bookings, debouncedSearch, filterStatus, dateRange, sortOrder, todayStr, tomorrowStr, weekStart, weekEnd]);

  const hasActiveFilters = filterStatus !== "all" || dateRange !== "today" || sortOrder !== "asc";

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setDateRange("today");
    setSortOrder("asc");
  };

  const stats = useMemo(() => {
    const today           = bookings.filter(b => b.date === todayStr);
    const globalCompleted = bookings.filter(b => b.status === "concluido");
    const globalPending   = bookings.filter(b => b.status === "confirmado");

    return {
      globalRevenue: globalCompleted.reduce((acc, b) => acc + b.servicePrice, 0),
      globalPending: globalPending.length,
      totalToday:    today.length,
      pendingToday:  today.filter(b => b.status === "confirmado").length,
    };
  }, [bookings, todayStr]);

  const handleNav = (id: string) => { setActiveTab(id); setSidebarOpen(false); };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-100">

      {/* ── Sidebar drawer ── */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="p-0 w-64 border-none bg-white [&>button]:text-slate-400 [&>button]:hover:text-slate-600"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de navegação</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-full">
            {/* logo */}
            <div className="px-5 pt-8 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-black text-sm tracking-tight uppercase text-slate-900 leading-none">
                    Beleza & Estilo
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
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
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* logout */}
            <div className="px-3 pb-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-all duration-150"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                Sair
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Detalhe do agendamento ── */}
      <Sheet open={!!selectedBooking} onOpenChange={open => { if (!open) setSelectedBooking(null); }}>
        <SheetContent
          side="bottom"
          className="p-0 rounded-t-3xl border-none bg-white max-h-[85vh] overflow-y-auto [&>button]:top-4 [&>button]:right-4 [&>button]:text-slate-400"
        >
          {selectedBooking && (
            <>
              <SheetHeader className="sr-only">
                <SheetTitle>Detalhes do agendamento</SheetTitle>
              </SheetHeader>

              {/* drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
              </div>

              {/* cabeçalho */}
              <div className="px-6 pt-4 pb-5 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">{selectedBooking.clientName}</h3>
                  </div>
                  <Badge className={cn(
                    "text-[10px] font-black px-2.5 py-1 rounded-lg border-none mt-1 flex-shrink-0",
                    STATUS_CONFIG[selectedBooking.status].bg,
                    STATUS_CONFIG[selectedBooking.status].color
                  )}>
                    {STATUS_CONFIG[selectedBooking.status].label}
                  </Badge>
                </div>

                {/* código */}
                <div className="inline-flex items-center bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100 mt-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase mr-2 tracking-tighter">Check-in:</span>
                  <span className="text-[13px] font-black text-primary tracking-widest">{selectedBooking.validationCode}</span>
                </div>
              </div>

              {/* detalhes */}
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <DetailRow icon={<CalendarCheck className="h-4 w-4" />} label="Data" value={format(parseISO(selectedBooking.date), "dd 'de' MMMM", { locale: ptBR })} />
                  <DetailRow icon={<Clock className="h-4 w-4" />} label="Horário" value={selectedBooking.slot} />
                </div>

                <div className="h-px bg-slate-100" />

                <DetailRow icon={<User className="h-4 w-4" />} label="Profissional" value={selectedBooking.professionalName} />
                <DetailRow icon={<Scissors className="h-4 w-4" />} label="Serviço" value={selectedBooking.serviceName} />
                <DetailRow
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Valor"
                  value={`R$ ${selectedBooking.servicePrice.toFixed(2).replace(".", ",")}`}
                />
                <DetailRow
                  icon={<CreditCard className="h-4 w-4" />}
                  label="Pagamento"
                  value="Não informado"
                  muted
                />

                <div className="h-px bg-slate-100" />

                <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">
                  Agendado em {format(parseISO(selectedBooking.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>

              {/* ações */}
              {selectedBooking.status === "confirmado" && (
                <div className="px-6 pb-8 pt-1 flex gap-3">
                  <Button
                    onClick={() => { updateBookingStatus(selectedBooking.id, "concluido"); setSelectedBooking(null); }}
                    className="flex-1 h-11 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider"
                  >
                    Finalizar atendimento
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { updateBookingStatus(selectedBooking.id, "nao_compareceu"); setSelectedBooking(null); }}
                    className="h-11 px-4 rounded-xl border-slate-200 text-slate-600 text-[11px] font-black uppercase"
                  >
                    Ausente
                  </Button>
                </div>
              )}
            </>
          )}
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
      <main className="w-full flex-1 px-5 py-6 max-w-lg mx-auto space-y-6 pb-10">

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
            <div className="space-y-1 px-1">
              <h2 className="text-2xl font-black text-slate-900 leading-none">Dashboard</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <MetricTile
                label="Receita Realizada"
                value={`R$ ${stats.globalRevenue}`}
                sub="Total acumulado"
                icon={<DollarSign className="h-5 w-5" />}
                color="emerald"
              />
              <MetricTile
                label="Total de Agenda"
                value={stats.globalPending.toString()}
                sub="Ainda não concluídos"
                icon={<CalendarDays className="h-5 w-5" />}
                color="blue"
              />
              <MetricTile
                label="Hoje"
                value={stats.totalToday.toString()}
                sub={`${stats.pendingToday} pendentes`}
                icon={<Users2 className="h-5 w-5" />}
                color="indigo"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Fila de Atendimento
                </h3>
                <button
                  onClick={() => setActiveTab("appointments")}
                  className="text-[11px] font-black text-primary uppercase"
                >
                  Ver todos
                </button>
              </div>

              <div className="space-y-3">
                {bookings.filter(b => b.date === todayStr).length > 0 ? (
                  bookings.filter(b => b.date === todayStr).slice(0, 5).map(b => (
                    <div
                      key={b.id}
                      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-50 h-11 w-11 rounded-xl flex items-center justify-center font-black text-sm text-slate-500 border border-slate-100 flex-shrink-0">
                          {b.slot.split(":")[0]}h
                        </div>
                        <div>
                          <p className="text-[15px] font-black leading-none text-slate-900">{b.clientName}</p>
                          <p className="text-[11px] font-bold text-amber-600 mt-1 uppercase tracking-tighter">
                            Cód: {b.validationCode}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "text-[10px] font-black px-2.5 py-1 rounded-md border-none flex-shrink-0",
                          STATUS_CONFIG[b.status].bg, STATUS_CONFIG[b.status].color
                        )}
                      >
                        {STATUS_CONFIG[b.status].label}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/50 border border-dashed border-slate-200 rounded-2xl py-12 flex flex-col items-center justify-center text-center px-6">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                      <CalendarIcon className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                      Nenhum agendamento<br />para hoje
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Agenda */}
        {activeTab === "appointments" && (
          <div className="space-y-5 animate-in fade-in duration-400">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-2xl font-black text-slate-900">Agenda</h2>
              <Button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                variant="ghost"
                className="h-9 gap-2 bg-slate-200 rounded-xl px-4 text-[11px] font-black uppercase text-slate-600 hover:bg-slate-300 hover:text-slate-900"
              >
                <SlidersHorizontal className="h-4 w-4" /> Filtros
              </Button>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Buscar por nome ou código…"
                className="h-12 bg-white border-slate-200 rounded-2xl text-[13px] px-5 font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />

              <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <CollapsibleContent className="animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-3 pb-1">
                    <select
                      className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-[12px] font-bold outline-none text-slate-700 shadow-sm"
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                    >
                      <option value="all">Status: Todos</option>
                      <option value="confirmado">Agendados</option>
                      <option value="concluido">Finalizados</option>
                      <option value="cancelado">Cancelados</option>
                      <option value="nao_compareceu">Ausentes</option>
                    </select>
                    <select
                      className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-[12px] font-bold outline-none text-slate-700 shadow-sm"
                      value={dateRange}
                      onChange={e => setDateRange(e.target.value)}
                    >
                      <option value="today">Hoje</option>
                      <option value="amanha">Amanhã</option>
                      <option value="semana">Esta semana</option>
                      <option value="all">Todos</option>
                    </select>
                    <select
                      className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-[12px] font-bold outline-none text-slate-700 shadow-sm col-span-2"
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value as "asc" | "desc")}
                    >
                      <option value="asc">Horário: mais cedo primeiro</option>
                      <option value="desc">Horário: mais tarde primeiro</option>
                    </select>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-400">
                  {filteredBookings.length} agendamento{filteredBookings.length !== 1 ? "s" : ""}
                </span>
                {(hasActiveFilters || debouncedSearch) && (
                  <button
                    onClick={clearFilters}
                    className="text-[11px] font-black text-primary uppercase"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4 max-w-md mx-auto pb-10">
              {filteredBookings.length > 0 ? (
                filteredBookings.map(b => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBooking(b)}
                    className={cn(
                      "relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-all active:scale-[0.98] cursor-pointer",
                      b.status === "confirmado" && "ring-1 ring-primary/5"
                    )}
                  >
                    {/* Barra lateral de status */}
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1", STATUS_CONFIG[b.status].bg.replace("100", "400"))} />

                    <div className="pl-4 pr-3 py-4 flex items-center gap-3">

                      {/* Data + hora */}
                      <div className="flex-shrink-0 flex flex-col items-center border-r border-slate-100 pr-3 whitespace-nowrap min-w-[72px]">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">
                          {format(new Date(b.date + "T12:00:00"), "dd MMM", { locale: ptBR })}
                        </span>
                        <span className="text-base font-black text-slate-900 leading-tight mt-1">
                          {b.slot.split(" - ")[0]}
                        </span>
                      </div>

                      {/* Nome + serviço */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-black text-slate-900 truncate leading-tight">
                            {b.clientName}
                          </p>
                          {b.status !== "confirmado" && (
                            <Badge className={cn("text-[8px] font-black px-1.5 py-0 rounded-md border-none uppercase flex-shrink-0", STATUS_CONFIG[b.status].bg, STATUS_CONFIG[b.status].color)}>
                              {STATUS_CONFIG[b.status].label}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide truncate mt-0.5">
                          {b.serviceName}
                        </p>
                      </div>

                      {/* Ações — Finalizar e ⋮ sempre na mesma linha */}
                      <div className="flex-shrink-0 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        {b.status === "confirmado" && (
                          <Button
                            onClick={() => updateBookingStatus(b.id, "concluido")}
                            className="h-8 px-3 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all"
                          >
                            Finalizar
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-50 transition-colors">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-xl border-slate-100">
                            <DropdownMenuItem className="rounded-lg font-bold py-2.5 px-4 text-xs cursor-pointer gap-2">
                              <RefreshCw className="h-3.5 w-3.5 text-slate-400" /> Reagendar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateBookingStatus(b.id, "nao_compareceu")}
                              className="rounded-lg font-bold py-2.5 px-4 text-xs cursor-pointer"
                            >
                              Marcar Ausente
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateBookingStatus(b.id, "cancelado")}
                              className="rounded-lg font-bold py-2.5 px-4 text-xs text-rose-500 cursor-pointer"
                            >
                              Cancelar Agendamento
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                    </div>
                  </div>
                ))

              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                    <CalendarIcon className="h-7 w-7 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Nenhum resultado</p>
                    <p className="text-[11px] font-medium text-slate-400">Tente ajustar seus filtros de busca.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Equipe */}
        {activeTab === "professionals" && (
          <div className="flex flex-col items-center justify-center min-h-[380px] text-center px-8 animate-in zoom-in duration-300">
            <div className="bg-slate-100 h-12 w-12 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 mb-4">
              <Users2 className="h-6 w-6" />
            </div>
            <h2 className="text-base font-black uppercase tracking-tight text-slate-900">Equipe</h2>
            <p className="text-xs text-slate-400 font-medium italic mt-1.5 leading-relaxed">
              Em breve o painel de gerenciamento de especialistas.
            </p>
            <Button
              variant="outline"
              onClick={() => setActiveTab("dashboard")}
              className="mt-6 rounded-xl h-9 px-6 font-black text-xs uppercase border-slate-200 text-slate-700 hover:bg-slate-50"
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

const DetailRow = ({ icon, label, value, muted }: {
  icon: React.ReactNode; label: string; value: string; muted?: boolean;
}) => (
  <div className="flex items-center gap-3">
    <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{label}</p>
      <p className={cn("text-sm font-black leading-tight", muted ? "text-slate-300" : "text-slate-900")}>{value}</p>
    </div>
  </div>
);

export default AdminPage;
