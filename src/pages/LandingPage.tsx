import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, LayoutDashboard, Instagram,
  MapPin, Phone, Star, ChevronDown, Clock,
  Gem, ShieldCheck, Timer,
} from "lucide-react";
import { motion } from "framer-motion";
import { servicos, profissionais } from "@/data/mockData";
import AdminLoginModal from "@/components/AdminLoginModal";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

const REVIEWS = [
  { name: "Maria Clara", text: "Melhor manicure que já fiz! As unhas ficaram perfeitas e durou semanas.", stars: 5 },
  { name: "Fernanda S.", text: "Ambiente incrível, profissionais super atenciosas. Já virou rotina!", stars: 5 },
  { name: "Larissa M.", text: "O design de sobrancelha transformou meu rosto. Recomendo demais.", stars: 5 },
];

const PILLARS = [
  { icon: Gem,         title: "Qualidade",    desc: "Produtos premium e técnicas avançadas" },
  { icon: ShieldCheck, title: "Higiene",      desc: "Protocolos rigorosos de biossegurança" },
  { icon: Timer,       title: "Pontualidade", desc: "Atendimento no horário combinado" },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const servicesRef = useRef<HTMLElement>(null);

  const handleAdminClick = () => {
    if (sessionStorage.getItem("admin_auth") === "1") {
      navigate("/admin");
    } else {
      setLoginOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative h-[100svh] min-h-[620px] flex flex-col items-center justify-center overflow-hidden">
        {/* background image */}
        <img
          src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=1200&fit=crop&q=80"
          alt="Nail art"
          className="absolute inset-0 w-full h-full object-cover object-center blur-sm scale-105"
        />
        {/* gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

        {/* top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 pt-12 z-10">
          <p className="text-white/90 text-sm font-black tracking-[0.2em] uppercase">
            Beleza & Estilo
          </p>
          <a href="#" className="text-white/70 hover:text-white transition-colors">
            <Instagram className="w-4 h-4" />
          </a>
        </div>

        {/* hero text + CTA */}
        <div className="relative z-10 w-full max-w-sm mx-auto px-7 text-center mt-16">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="block w-8 h-px bg-white/40" />
              <span className="text-white/70 text-[10px] font-bold tracking-[0.45em] uppercase">
                Studio de Beleza
              </span>
              <span className="block w-8 h-px bg-white/40" />
            </div>
            <h1 className="text-[2.6rem] font-black text-white leading-[1.08] tracking-tight mb-3">
              Sua beleza,<br />nossa arte.
            </h1>
            <p className="text-white/65 text-sm leading-relaxed mb-8">
              Unhas, sobrancelhas e estética em Alagoinhas, BA. Agende online em segundos.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/profissionais")}
            className="w-full bg-primary text-white py-4 rounded-2xl font-black text-[15px] shadow-2xl shadow-primary/40 flex items-center justify-center gap-2.5 mb-3"
          >
            <CalendarDays className="w-4 h-4" />
            Agendar agora
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate("/meus-agendamentos")}
            className="text-white/55 text-xs font-semibold"
          >
            Ver meus agendamentos
          </motion.button>
        </div>

        {/* scroll hint */}
        <button
          onClick={() => servicesRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-white/40 animate-bounce"
          aria-label="Rolar para baixo"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </section>

      {/* ─────────────────────────── SERVICES ─────────────────────── */}
      <section ref={servicesRef} className="pt-14 pb-4 bg-white">
        <motion.div {...fadeUp()} className="px-6 mb-6">
          <p className="text-[11px] font-black text-primary tracking-[0.28em] uppercase mb-1.5">O que fazemos</p>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">Nossos serviços</h2>
        </motion.div>

        <div className="flex gap-3.5 overflow-x-auto px-6 pb-8 no-scrollbar">
          {servicos.map((svc, i) => (
            <motion.div
              key={svc.id}
              {...fadeUp(i * 0.07)}
              onClick={() => navigate("/profissionais")}
              className="flex-shrink-0 w-44 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm cursor-pointer active:scale-[0.97] transition-transform"
            >
              <div className="h-28 overflow-hidden bg-rose-50">
                <img src={svc.image} alt={svc.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3.5">
                <h3 className="font-black text-[12px] text-slate-900 leading-tight mb-2">{svc.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-primary">R$ {svc.price}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {svc.durationMinutes}min
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────── TEAM ─────────────────────────── */}
      <section className="py-14 bg-rose-50/60">
        <motion.div {...fadeUp()} className="px-6 mb-7">
          <p className="text-[11px] font-black text-primary tracking-[0.28em] uppercase mb-1.5">Conheça a equipe</p>
          <h2 className="text-2xl font-black text-slate-900">Nossas especialistas</h2>
        </motion.div>

        <div className="flex gap-5 overflow-x-auto px-6 pb-4 no-scrollbar">
          {profissionais.map((pro, i) => (
            <motion.div
              key={pro.id}
              {...fadeUp(i * 0.09)}
              className="flex-shrink-0 w-32 text-center"
            >
              <div className="w-[72px] h-[72px] rounded-full mx-auto overflow-hidden mb-3 ring-[3px] ring-white shadow-md">
                <img src={pro.image} alt={pro.name} className="w-full h-full object-cover" />
              </div>
              <p className="font-black text-[11px] text-slate-900 leading-tight">{pro.name.split(" ")[0]}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                {pro.description.split(".")[0]}.
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────── PILLARS ──────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-md mx-auto px-6">
          <motion.div {...fadeUp()} className="mb-8">
            <p className="text-[11px] font-black text-primary tracking-[0.28em] uppercase mb-1.5">Por que a gente?</p>
            <h2 className="text-2xl font-black text-slate-900">Você merece o melhor</h2>
          </motion.div>

          <div className="grid grid-cols-3 gap-5">
            {PILLARS.map((p, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-black text-[11px] text-slate-900">{p.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── STATS ────────────────────────── */}
      <section className="px-5 pb-0">
        <motion.div
          {...fadeUp()}
          className="bg-slate-900 rounded-3xl py-10 px-6 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { num: "500+", label: "Clientes" },
            { num: "4.9★", label: "Avaliação" },
            { num: "8 anos", label: "Experiência" },
          ].map((s, i) => (
            <div key={i} className={i === 1 ? "border-x border-white/10" : ""}>
              <p className="text-xl font-black text-white leading-none">{s.num}</p>
              <p className="text-[10px] text-slate-500 mt-1.5 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─────────────────────────── REVIEWS ──────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-md mx-auto px-6">
          <motion.div {...fadeUp()} className="mb-7">
            <p className="text-[11px] font-black text-primary tracking-[0.28em] uppercase mb-1.5">Avaliações</p>
            <h2 className="text-2xl font-black text-slate-900">O que dizem de nós</h2>
          </motion.div>

          <div className="space-y-3">
            {REVIEWS.map((r, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                className="bg-slate-50 rounded-2xl p-4.5 p-4"
              >
                <div className="flex gap-0.5 mb-2.5">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-2.5">"{r.text}"</p>
                <p className="text-[11px] font-black text-slate-400">— {r.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── CTA BANNER ───────────────────── */}
      <section className="px-5 pb-5">
        <motion.div
          {...fadeUp()}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/profissionais")}
          className="relative overflow-hidden bg-primary rounded-3xl p-8 text-center cursor-pointer select-none"
        >
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
          <p className="text-white/70 text-[11px] font-bold tracking-[0.25em] uppercase mb-2">Pronta para se cuidar?</p>
          <h3 className="text-2xl font-black text-white mb-6 leading-tight">
            Agende o seu<br />horário agora
          </h3>
          <div className="inline-flex items-center gap-2 bg-white text-primary font-black text-sm py-3 px-7 rounded-xl shadow-md">
            <CalendarDays className="w-4 h-4" />
            Agendar
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────── LOCATION ─────────────────────── */}
      <section className="px-5 pb-8">
        <motion.div {...fadeUp()} className="border border-slate-100 rounded-2xl p-4 flex items-center gap-4 bg-white shadow-sm">
          <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-xs text-slate-900">Onde estamos</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Alagoinhas, Bahia</p>
          </div>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-black text-primary uppercase tracking-tight shrink-0"
            onClick={e => e.stopPropagation()}
          >
            Como chegar
          </a>
        </motion.div>
      </section>

      {/* ─────────────────────────── FOOTER ───────────────────────── */}
      <footer className="pb-12 flex flex-col items-center gap-3">
        <div className="flex gap-3">
          <a href="#" className="p-2.5 bg-slate-50 rounded-full text-slate-400 hover:text-primary transition-colors">
            <Instagram className="w-4 h-4" />
          </a>
          <a href="#" className="p-2.5 bg-slate-50 rounded-full text-slate-400 hover:text-primary transition-colors">
            <Phone className="w-4 h-4" />
          </a>
        </div>

        <button
          onClick={handleAdminClick}
          className="flex items-center gap-1.5 text-[10px] text-slate-300 hover:text-primary transition-colors uppercase tracking-[0.2em] mt-1"
        >
          <LayoutDashboard className="w-3 h-3" />
          Acesso Admin
        </button>

        <p className="text-[9px] text-slate-200 uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} Beleza & Estilo
        </p>
      </footer>

      <AdminLoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
};

export default LandingPage;
