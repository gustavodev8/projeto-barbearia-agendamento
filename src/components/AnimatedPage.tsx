import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -12 },
};

const pageTransition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1],
};

const AnimatedPage = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

export default AnimatedPage;
