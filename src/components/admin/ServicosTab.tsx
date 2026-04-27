import { useState, useEffect } from "react";
import { Pencil, Check, X, ToggleLeft, ToggleRight, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number | null;
  available: boolean;
}

interface Professional {
  id: string;
  name: string;
  image: string | null;
}

interface EditState {
  name: string;
  price: string;
  professionalIds: string[];
}

interface NewServiceForm {
  name: string;
  description: string;
  price: string;
  duration_minutes: string;
  professionalIds: string[];
}

const EMPTY_FORM: NewServiceForm = {
  name: "", description: "", price: "", duration_minutes: "", professionalIds: [],
};

// ── Component ─────────────────────────────────────────────────────────

const ServicosTab = () => {
  const [services,     setServices]     = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  // serviceId → professionalId[]
  const [serviceProfs, setServiceProfs]  = useState<Record<string, string[]>>({});

  const [loading,    setLoading]    = useState(true);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [edit,       setEdit]       = useState<EditState>({ name: "", price: "", professionalIds: [] });
  const [addOpen,    setAddOpen]    = useState(false);
  const [form,       setForm]       = useState<NewServiceForm>(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    Promise.all([fetchServices(), fetchProfessionals()]);
  }, []);

  // ── Fetchers ─────────────────────────────────────────────────────────

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, description, price, duration_minutes, available")
        .order("name");
      if (error) throw error;
      setServices(
        (data ?? []).map(s => ({
          ...s,
          available:        s.available        ?? true,
          duration_minutes: s.duration_minutes ?? null,
          description:      s.description      ?? null,
        }))
      );
    } catch {
      toast.error("Erro ao carregar serviços");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessionals = async () => {
    try {
      const { data } = await supabase
        .from("professionals")
        .select("id, name, image")
        .order("name");
      setProfessionals(data ?? []);
      await fetchServiceProfs();
    } catch {}
  };

  // Silently fetches professional↔service associations.
  // Requires a `professional_services` table: { professional_id, service_id }
  const fetchServiceProfs = async () => {
    try {
      const { data, error } = await supabase
        .from("professional_services")
        .select("service_id, professional_id");
      if (error) return;
      const map: Record<string, string[]> = {};
      (data ?? []).forEach(r => {
        if (!map[r.service_id]) map[r.service_id] = [];
        map[r.service_id].push(r.professional_id);
      });
      setServiceProfs(map);
    } catch {}
  };

  // ── Mutations ─────────────────────────────────────────────────────────

  const saveServiceProfs = async (serviceId: string, profIds: string[]) => {
    try {
      // Remove old associations then insert new ones
      await supabase.from("professional_services").delete().eq("service_id", serviceId);
      if (profIds.length > 0) {
        await supabase.from("professional_services").insert(
          profIds.map(pid => ({ service_id: serviceId, professional_id: pid }))
        );
      }
      setServiceProfs(prev => ({ ...prev, [serviceId]: profIds }));
    } catch {}
  };

  const handleAdd = async () => {
    const price    = parseFloat(form.price.replace(",", "."));
    const duration = form.duration_minutes ? parseInt(form.duration_minutes) : null;
    if (!form.name.trim())       { toast.error("Nome obrigatório"); return; }
    if (isNaN(price) || price < 0) { toast.error("Preço inválido"); return; }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .insert({
          name:             form.name.trim(),
          description:      form.description.trim() || null,
          price,
          duration_minutes: duration,
          available:        true,
        })
        .select("id, name, description, price, duration_minutes, available")
        .single();
      if (error) throw error;

      const newSvc: Service = {
        ...data,
        available:        data.available        ?? true,
        duration_minutes: data.duration_minutes ?? null,
        description:      data.description      ?? null,
      };
      setServices(prev => [...prev, newSvc].sort((a, b) => a.name.localeCompare(b.name)));

      if (form.professionalIds.length > 0) {
        await saveServiceProfs(data.id, form.professionalIds);
      }

      toast.success("Serviço adicionado!");
      setAddOpen(false);
      setForm(EMPTY_FORM);
    } catch {
      toast.error("Erro ao adicionar serviço");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (svc: Service) => {
    setEditingId(svc.id);
    setEdit({
      name:           svc.name,
      price:          svc.price.toString(),
      professionalIds: serviceProfs[svc.id] ?? [],
    });
  };

  const cancelEdit = () => { setEditingId(null); };

  const saveEdit = async (id: string) => {
    const price = parseFloat(edit.price.replace(",", "."));
    if (isNaN(price) || price < 0) { toast.error("Preço inválido"); return; }
    if (!edit.name.trim())          { toast.error("Nome obrigatório"); return; }

    const prev = [...services];
    setServices(s => s.map(svc => svc.id === id ? { ...svc, name: edit.name.trim(), price } : svc));
    setEditingId(null);

    try {
      const { error } = await supabase
        .from("services")
        .update({ name: edit.name.trim(), price })
        .eq("id", id);
      if (error) throw error;
      await saveServiceProfs(id, edit.professionalIds);
      toast.success("Serviço atualizado!");
    } catch {
      setServices(prev);
      toast.error("Erro ao salvar");
    }
  };

  const toggleAvailable = async (svc: Service) => {
    const prev = [...services];
    setServices(s => s.map(x => x.id === svc.id ? { ...x, available: !x.available } : x));
    try {
      const { error } = await supabase
        .from("services").update({ available: !svc.available }).eq("id", svc.id);
      if (error) throw error;
    } catch {
      setServices(prev);
      toast.error("Erro ao atualizar");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse pt-2">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400">

        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Serviços</h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {services.length} cadastrado{services.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl shadow-md shadow-primary/20 active:scale-95 transition-transform"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo serviço
          </button>
        </div>

        {/* Service cards */}
        <div className="space-y-3">
          {services.map(svc => {
            const assignedProfs = professionals.filter(p =>
              (serviceProfs[svc.id] ?? []).includes(p.id)
            );
            return (
              <div
                key={svc.id}
                className={cn(
                  "bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-opacity duration-200",
                  !svc.available && "opacity-50"
                )}
              >
                {editingId === svc.id ? (
                  /* ── Edit mode ── */
                  <div className="p-4 space-y-3">
                    <FormField label="Nome">
                      <Input value={edit.name}
                        onChange={e => setEdit(p => ({ ...p, name: e.target.value }))}
                        className="h-10 rounded-xl border-slate-200 text-sm font-bold" autoFocus />
                    </FormField>
                    <FormField label="Preço (R$)">
                      <Input value={edit.price} type="number" min="0" step="0.01"
                        onChange={e => setEdit(p => ({ ...p, price: e.target.value }))}
                        className="h-10 rounded-xl border-slate-200 text-sm font-bold" />
                    </FormField>
                    <ProfCheckboxes
                      professionals={professionals}
                      selected={edit.professionalIds}
                      onChange={ids => setEdit(p => ({ ...p, professionalIds: ids }))}
                    />
                    <div className="flex gap-2 pt-1">
                      <Button onClick={() => saveEdit(svc.id)}
                        className="flex-1 h-9 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider gap-2">
                        <Check className="h-3.5 w-3.5" /> Salvar
                      </Button>
                      <Button variant="outline" onClick={cancelEdit}
                        className="h-9 w-9 p-0 rounded-xl border-slate-200">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ── View mode ── */
                  <div className="px-4 py-3.5 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 leading-tight">{svc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-black text-primary">
                          R$ {svc.price.toFixed(2).replace(".", ",")}
                        </span>
                        {svc.duration_minutes && (
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {svc.duration_minutes}min
                          </span>
                        )}
                      </div>
                      {svc.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{svc.description}</p>
                      )}
                      {/* Assigned professionals */}
                      {assignedProfs.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {assignedProfs.map(p => (
                            <div key={p.id} className="flex items-center gap-1">
                              {p.image ? (
                                <img src={p.image} alt={p.name}
                                  className="w-4 h-4 rounded-full object-cover ring-1 ring-white" />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                                  <span className="text-[7px] font-black text-primary">{p.name[0]}</span>
                                </div>
                              )}
                              <span className="text-[10px] font-bold text-slate-500">
                                {p.name.split(" ")[0]}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                      <button onClick={() => toggleAvailable(svc)} className="transition-transform active:scale-90"
                        title={svc.available ? "Desativar" : "Ativar"}>
                        {svc.available
                          ? <ToggleRight className="h-6 w-6 text-emerald-500" />
                          : <ToggleLeft  className="h-6 w-6 text-slate-300"   />}
                      </button>
                      <button onClick={() => startEdit(svc)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors"
                        title="Editar">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {services.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm font-black text-slate-300 uppercase tracking-widest">
              Nenhum serviço cadastrado
            </p>
          </div>
        )}
      </div>

      {/* ── Add Service Sheet ── */}
      <Sheet open={addOpen} onOpenChange={open => { if (!open) { setAddOpen(false); setForm(EMPTY_FORM); } }}>
        <SheetContent
          side="bottom"
          className="p-0 rounded-t-3xl border-none bg-white max-h-[90vh] overflow-y-auto [&>button]:top-4 [&>button]:right-4 [&>button]:text-slate-400"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Novo serviço</SheetTitle>
          </SheetHeader>

          {/* drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-200" />
          </div>

          <div className="px-6 pt-4 pb-3 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-900">Novo serviço</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Preencha os dados do serviço</p>
          </div>

          <div className="px-6 py-5 space-y-4">
            <FormField label="Nome do serviço *">
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Manicure Simples"
                className="h-11 rounded-xl border-slate-200 text-sm font-bold" autoFocus />
            </FormField>

            <FormField label="Descrição">
              <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Breve descrição do serviço"
                className="h-11 rounded-xl border-slate-200 text-sm" />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Preço (R$) *">
                <Input value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  type="number" min="0" step="0.01" placeholder="0,00"
                  className="h-11 rounded-xl border-slate-200 text-sm font-bold" />
              </FormField>
              <FormField label="Duração (min)">
                <Input value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))}
                  type="number" min="0" step="5" placeholder="45"
                  className="h-11 rounded-xl border-slate-200 text-sm" />
              </FormField>
            </div>

            <ProfCheckboxes
              professionals={professionals}
              selected={form.professionalIds}
              onChange={ids => setForm(p => ({ ...p, professionalIds: ids }))}
            />
          </div>

          <div className="px-6 pb-10">
            <Button
              onClick={handleAdd}
              disabled={saving || !form.name.trim() || !form.price}
              className="w-full h-12 rounded-xl bg-slate-900 text-white font-black text-[13px] uppercase tracking-wider gap-2"
            >
              {saving ? "Salvando…" : "Adicionar serviço"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

// ── Shared sub-components ─────────────────────────────────────────────

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    {children}
  </div>
);

const ProfCheckboxes = ({
  professionals, selected, onChange,
}: {
  professionals: Professional[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) => {
  if (professionals.length === 0) return null;

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Profissionais que oferecem
      </label>
      <div className="space-y-2">
        {professionals.map(p => {
          const checked = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all text-left",
                checked
                  ? "border-primary/30 bg-primary/5"
                  : "border-slate-200 bg-white"
              )}
            >
              {p.image ? (
                <img src={p.image} alt={p.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-primary">{p.name[0]}</span>
                </div>
              )}
              <span className="flex-1 text-sm font-bold text-slate-800">{p.name}</span>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                checked ? "border-primary bg-primary" : "border-slate-200"
              )}>
                {checked && <Check className="h-3 w-3 text-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ServicosTab;
