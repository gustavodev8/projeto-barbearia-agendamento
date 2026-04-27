import { useState, useEffect } from "react";
import { Pencil, Check, X, ToggleLeft, ToggleRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number | null;
  available: boolean;
}

interface EditState {
  name: string;
  price: string;
}

const ServicosTab = () => {
  const [services, setServices]   = useState<Service[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit]           = useState<EditState>({ name: "", price: "" });

  useEffect(() => { fetchServices(); }, []);

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

  const startEdit = (svc: Service) => {
    setEditingId(svc.id);
    setEdit({ name: svc.name, price: svc.price.toString() });
  };

  const cancelEdit = () => { setEditingId(null); };

  const saveEdit = async (id: string) => {
    const price = parseFloat(edit.price.replace(",", "."));
    if (isNaN(price) || price < 0) { toast.error("Preço inválido"); return; }
    if (!edit.name.trim()) { toast.error("Nome obrigatório"); return; }

    const prev = [...services];
    setServices(s => s.map(svc => svc.id === id ? { ...svc, name: edit.name.trim(), price } : svc));
    setEditingId(null);

    try {
      const { error } = await supabase
        .from("services")
        .update({ name: edit.name.trim(), price })
        .eq("id", id);
      if (error) throw error;
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
        .from("services")
        .update({ available: !svc.available })
        .eq("id", svc.id);
      if (error) throw error;
    } catch {
      setServices(prev);
      toast.error("Erro ao atualizar");
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse pt-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div className="px-1">
        <h2 className="text-2xl font-black text-slate-900">Serviços</h2>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
          {services.length} serviço{services.length !== 1 ? "s" : ""} cadastrado{services.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-3">
        {services.map(svc => (
          <div
            key={svc.id}
            className={cn(
              "bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-opacity duration-200",
              !svc.available && "opacity-50"
            )}
          >
            {editingId === svc.id ? (
              <div className="p-4 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nome</label>
                  <Input
                    value={edit.name}
                    onChange={e => setEdit(p => ({ ...p, name: e.target.value }))}
                    className="h-10 rounded-xl border-slate-200 text-sm font-bold"
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Preço (R$)</label>
                  <Input
                    value={edit.price}
                    onChange={e => setEdit(p => ({ ...p, price: e.target.value }))}
                    type="number"
                    min="0"
                    step="0.01"
                    className="h-10 rounded-xl border-slate-200 text-sm font-bold"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={() => saveEdit(svc.id)}
                    className="flex-1 h-9 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider gap-2"
                  >
                    <Check className="h-3.5 w-3.5" /> Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelEdit}
                    className="h-9 w-9 p-0 rounded-xl border-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3.5 flex items-center gap-3">
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
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleAvailable(svc)}
                    className="transition-transform active:scale-90"
                    title={svc.available ? "Desativar" : "Ativar"}
                  >
                    {svc.available
                      ? <ToggleRight className="h-6 w-6 text-emerald-500" />
                      : <ToggleLeft  className="h-6 w-6 text-slate-300"   />
                    }
                  </button>
                  <button
                    onClick={() => startEdit(svc)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm font-black text-slate-300 uppercase tracking-widest">
            Nenhum serviço cadastrado
          </p>
        </div>
      )}
    </div>
  );
};

export default ServicosTab;
