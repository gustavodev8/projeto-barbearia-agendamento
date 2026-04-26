import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Booking } from "@/data/mockData";
import { supabase } from "@/lib/supabase";

interface ReservationContextType {
  bookings: Booking[];
  addBooking: (b: Booking) => Promise<boolean>;
  cancelBooking: (id: string) => Promise<boolean>;
  loading: boolean;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const ReservationProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega os agendamentos do Supabase (e usa localStorage como fallback/cache inicial)
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      
      // Tenta carregar do cache local primeiro para agilidade
      const saved = localStorage.getItem("quartzus_bookings");
      if (saved) setBookings(JSON.parse(saved));

      // Busca dados reais do Supabase
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          professionals (name),
          services (name, price)
        `)
        .order('date', { ascending: true });

      if (!error && data) {
        const formattedData: Booking[] = data.map(b => ({
          id: b.id,
          professionalId: b.professional_id,
          professionalName: b.professionals?.name || "Profissional",
          serviceId: b.service_id,
          serviceName: b.services?.name || "Serviço",
          servicePrice: b.services?.price || 0,
          date: b.date,
          slot: b.slot,
          clientName: b.client_name,
          validationCode: b.validation_code
        }));
        
        setBookings(formattedData);
        localStorage.setItem("quartzus_bookings", JSON.stringify(formattedData));
      }
      setLoading(false);
    };

    fetchBookings();
  }, []);

  const addBooking = async (booking: Booking) => {
    const { error } = await supabase
      .from('bookings')
      .insert([{
        professional_id: booking.professionalId,
        service_id: booking.serviceId,
        client_name: booking.clientName,
        date: booking.date,
        slot: booking.slot,
        validation_code: booking.validationCode
      }]);

    if (error) {
      console.error("Erro ao salvar agendamento:", error);
      return false;
    }

    setBookings((prev) => [booking, ...prev]);
    return true;
  };

  const cancelBooking = async (id: string) => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao cancelar agendamento:", error);
      return false;
    }

    setBookings((prev) => prev.filter((b) => b.id !== id));
    return true;
  };

  return (
    <ReservationContext.Provider value={{ bookings, addBooking, cancelBooking, loading }}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservations = () => {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error("useReservations must be used within ReservationProvider");
  return ctx;
};
