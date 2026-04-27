import { useState, useEffect } from "react";
import { Save, Building2, MapPin, Phone, Instagram, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const STORAGE_KEY = "studio_config";

interface StudioConfig {
  name:      string;
  address:   string;
  phone:     string;
  instagram: string;
  email:     string;
}

const DEFAULTS: StudioConfig = {
  name:      "Beleza & Estilo",
  address:   "Alagoinhas, Bahia",
  phone:     "",
  instagram: "",
  email:     "",
};

const ConfiguracoesTab = () => {
  const [config, setConfig] = useState<StudioConfig>(DEFAULTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setConfig({ ...DEFAULTS, ...JSON.parse(stored) });
    } catch {}
  }, []);

  const set = (key: keyof StudioConfig) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setConfig(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    toast.success("Configurações salvas!");
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div className="px-1">
        <h2 className="text-2xl font-black text-slate-900">Configurações</h2>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
          Dados do estúdio
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Informações gerais
        </p>

        <Field label="Nome do Estúdio" icon={<Building2 className="h-3.5 w-3.5" />}>
          <Input value={config.name} onChange={set("name")}
            className="h-10 rounded-xl border-slate-200 text-sm font-bold" />
        </Field>

        <Field label="Endereço" icon={<MapPin className="h-3.5 w-3.5" />}>
          <Input value={config.address} onChange={set("address")}
            placeholder="Rua, número — Cidade, UF"
            className="h-10 rounded-xl border-slate-200 text-sm" />
        </Field>

        <Field label="Telefone / WhatsApp" icon={<Phone className="h-3.5 w-3.5" />}>
          <Input value={config.phone} onChange={set("phone")}
            placeholder="(71) 9 9999-9999" type="tel"
            className="h-10 rounded-xl border-slate-200 text-sm" />
        </Field>

        <Field label="Instagram" icon={<Instagram className="h-3.5 w-3.5" />}>
          <Input value={config.instagram} onChange={set("instagram")}
            placeholder="@seuinstagram"
            className="h-10 rounded-xl border-slate-200 text-sm" />
        </Field>

        <Field label="E-mail" icon={<Mail className="h-3.5 w-3.5" />}>
          <Input value={config.email} onChange={set("email")}
            placeholder="contato@seudominio.com" type="email"
            className="h-10 rounded-xl border-slate-200 text-sm" />
        </Field>
      </div>

      <Button
        onClick={handleSave}
        className="w-full h-11 rounded-xl bg-slate-900 text-white font-black text-[12px] uppercase tracking-widest gap-2"
      >
        <Save className="h-4 w-4" />
        Salvar configurações
      </Button>

      <p className="text-center text-[10px] text-slate-300 pb-4">
        Configurações salvas localmente no dispositivo.
      </p>
    </div>
  );
};

const Field = ({
  label, icon, children,
}: {
  label: string; icon: React.ReactNode; children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
      <span className="text-slate-300">{icon}</span>
      {label}
    </label>
    {children}
  </div>
);

export default ConfiguracoesTab;
