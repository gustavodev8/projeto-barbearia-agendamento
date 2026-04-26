import { useState } from "react";
import { CalendarDays, LayoutDashboard, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLoginModal from "@/components/AdminLoginModal";

const Header = () => {
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);

  const handleAdminClick = () => {
    if (sessionStorage.getItem("admin_auth") === "1") {
      navigate("/admin");
    } else {
      setLoginOpen(true);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-border/50 px-4 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 font-sans font-bold text-lg text-foreground tracking-tight"
        >
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="hidden sm:inline">Beleza & Estilo</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate("/meus-agendamentos")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
          >
            <CalendarDays className="w-4 h-4" />
            <span className="hidden xs:inline">Meus Horários</span>
          </button>
          <button
            onClick={handleAdminClick}
            className="flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground/40 hover:text-primary hover:bg-primary/5 transition-all"
            title="Painel Admin"
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>
        </div>
      </header>

      <AdminLoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
};

export default Header;
