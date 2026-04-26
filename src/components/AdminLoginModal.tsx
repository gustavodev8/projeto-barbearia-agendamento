import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdminLoginModal = ({ open, onOpenChange }: AdminLoginModalProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validUser = import.meta.env.VITE_ADMIN_USER ?? "admin";
    const validPass = import.meta.env.VITE_ADMIN_PASSWORD ?? "admin123";

    setTimeout(() => {
      if (username === validUser && password === validPass) {
        sessionStorage.setItem("admin_auth", "1");
        onOpenChange(false);
        setUsername("");
        setPassword("");
        navigate("/admin");
      } else {
        setError("Usuário ou senha incorretos.");
      }
      setLoading(false);
    }, 300);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUsername("");
      setPassword("");
      setError("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-base font-black text-slate-900">
            Acesso Administrativo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-9 rounded-xl border-slate-200"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 rounded-xl border-slate-200"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center font-medium">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full rounded-xl font-bold"
          >
            {loading ? "Verificando..." : "Entrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLoginModal;
