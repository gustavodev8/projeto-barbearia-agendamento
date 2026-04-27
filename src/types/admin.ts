export type BookingStatus = "concluido" | "confirmado" | "cancelado" | "nao_compareceu";

export interface AdminBooking {
  id: string;
  slot: string;
  clientName: string;
  professionalId: string;
  professionalName: string;
  serviceName: string;
  servicePrice: number;
  status: BookingStatus;
  date: string;
  created_at: string;
  validationCode: string;
}

export const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  concluido:      { label: "Finalizado", color: "text-emerald-700", bg: "bg-emerald-100" },
  confirmado:     { label: "Agendado",   color: "text-blue-700",    bg: "bg-blue-100"    },
  cancelado:      { label: "Cancelado",  color: "text-rose-700",    bg: "bg-rose-100"    },
  nao_compareceu: { label: "Ausente",    color: "text-slate-600",   bg: "bg-slate-200"   },
};
