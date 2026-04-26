import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Credenciais inválidas.");
      setLoading(false);
      return;
    }

    toast.success("Acesso autorizado.");
    navigate("/admin");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[320px]">
        <div className="text-center mb-12">
          <h1 className="text-xl font-bold text-slate-900 uppercase tracking-[0.2em]">Painel Admin</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">Identifique-se para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[10px] font-bold uppercase text-slate-400 ml-1">E-mail</Label>
            <Input
              id="email"
              type="email"
              className="h-12 rounded-lg border-slate-100 bg-slate-50 px-4 focus-visible:ring-primary/20 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pass" className="text-[10px] font-bold uppercase text-slate-400 ml-1">Senha</Label>
            <Input
              id="pass"
              type="password"
              className="h-12 rounded-lg border-slate-100 bg-slate-50 px-4 focus-visible:ring-primary/20 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 rounded-lg text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm"
          >
            {loading ? "Verificando..." : "Entrar"}
          </Button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="mt-10 w-full text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-primary transition-colors text-center"
        >
          Voltar ao site
        </button>
      </div>
    </div>
  );
};

export default Login;
