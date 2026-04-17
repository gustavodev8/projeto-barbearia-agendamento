import { useNavigate } from "react-router-dom";
import { CalendarDays, LayoutDashboard, Scissors, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Clientes por mês" },
  { value: "8 anos", label: "No mercado" },
  { value: "4 barbeiros", label: "Especialistas" },
];

const services = [
  { num: "01", name: "Corte masculino", price: "A partir de R$ 45" },
  { num: "02", name: "Barba completa", price: "A partir de R$ 35" },
  { num: "03", name: "Corte + Barba", price: "A partir de R$ 70" },
  { num: "04", name: "Pigmentação", price: "A partir de R$ 90" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0 },
};

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">

      {/* Header */}
      <header className="bg-[hsl(20,30%,10%)] border-b border-white/10 px-5 sm:px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 text-white font-bold text-lg tracking-widest uppercase"
        >
          <Scissors className="w-5 h-5 text-primary" />
          Barber Time
        </button>
        <nav className="flex items-center gap-6">
          <button
            onClick={() => navigate("/meus-agendamentos")}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors uppercase tracking-wider"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Agendamentos</span>
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-[hsl(20,30%,10%)] px-5 sm:px-8 pt-12 sm:pt-16 pb-14 sm:pb-20">
        <motion.div
          className="flex flex-col items-start max-w-4xl mx-auto w-full"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.span
            variants={fadeUp}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs text-primary uppercase tracking-[0.2em] font-semibold mb-5 flex items-center gap-2"
          >
            <span className="inline-block w-6 sm:w-8 h-px bg-primary" />
            Barbearia profissional
          </motion.span>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] tracking-tight max-w-lg mb-5"
          >
            Corte com precisão.<br />
            <span className="text-primary">Estilo com classe.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-white/50 text-sm sm:text-base max-w-xs sm:max-w-sm mb-8 sm:mb-10 leading-relaxed"
          >
            Agende pelo site em minutos. Profissionais experientes, ambiente
            exclusivo e atendimento pontual.
          </motion.p>

          <motion.button
            variants={fadeUp}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/barbeiros")}
            className="flex items-center gap-3 bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm uppercase tracking-widest px-6 sm:px-8 py-3.5 sm:py-4 transition-colors"
          >
            Agendar agora
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </section>

      {/* Stats */}
      <motion.section
        className="bg-primary px-4 py-5 sm:py-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-3">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`flex flex-col items-center justify-center text-center px-2 sm:px-6 py-1 ${
                i < stats.length - 1 ? "border-r border-white/20" : ""
              }`}
            >
              <p className="text-white font-extrabold text-xl sm:text-2xl tracking-tight leading-none">
                {value}
              </p>
              <p className="text-white/70 text-[10px] sm:text-xs uppercase tracking-widest mt-1.5 leading-tight">
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Services */}
      <section className="px-5 sm:px-8 py-12 sm:py-16 max-w-4xl mx-auto w-full">
        <motion.div
          className="flex items-center justify-between mb-6 border-b border-border pb-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
            Serviços
          </h2>
          <button
            onClick={() => navigate("/barbeiros")}
            className="text-xs text-primary uppercase tracking-widest font-semibold hover:underline"
          >
            Ver todos
          </button>
        </motion.div>

        <div className="divide-y divide-border">
          {services.map(({ num, name, price }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between py-4 sm:py-5 group cursor-pointer"
              onClick={() => navigate("/barbeiros")}
            >
              <div className="flex items-center gap-3 sm:gap-5">
                <span className="text-xs text-muted-foreground/40 font-mono w-5 shrink-0">{num}</span>
                <span className="font-semibold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors">
                  {name}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-2">
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{price}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <motion.section
        className="border-t border-border mt-auto px-5 sm:px-8 py-12 sm:py-14 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-3">
          Pronto para marcar seu horário?
        </h2>
        <p className="text-muted-foreground text-sm mb-7 max-w-xs">
          Escolha o barbeiro, o serviço e o horário em poucos cliques.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/barbeiros")}
          className="flex items-center gap-2 border-2 border-foreground text-foreground hover:bg-foreground hover:text-white font-bold text-xs sm:text-sm uppercase tracking-widest px-6 sm:px-8 py-3 sm:py-3.5 transition-colors"
        >
          Escolher barbeiro
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center sm:justify-between gap-1 text-xs text-muted-foreground text-center">
        <span>© {new Date().getFullYear()} Barber Time</span>
        <span className="uppercase tracking-widest">Todos os direitos reservados</span>
      </footer>
    </div>
  );
};

export default LandingPage;
