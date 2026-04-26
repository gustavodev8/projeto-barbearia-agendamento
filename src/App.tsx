import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReservationProvider } from "@/contexts/ReservationContext";
import AnimatedPage from "@/components/AnimatedPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import BookingPage from "./pages/BookingPage";
import MyReservations from "./pages/MyReservations";
import AdminPage from "./pages/AdminPage";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><LandingPage /></AnimatedPage>} />
        <Route path="/profissionais" element={<AnimatedPage><Home /></AnimatedPage>} />
        <Route path="/profissionais/:id" element={<AnimatedPage><BookingPage /></AnimatedPage>} />
        <Route path="/meus-agendamentos" element={<AnimatedPage><MyReservations /></AnimatedPage>} />
        <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AnimatedPage><AdminPage /></AnimatedPage>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ReservationProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </ReservationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
