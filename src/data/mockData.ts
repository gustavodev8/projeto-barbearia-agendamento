export interface ReservableItem {
  id: string;
  name: string;
  description: string;
  image: string;
  available: boolean;
  totalUnits?: number;
}

export interface Professional extends ReservableItem {
}

export interface Service extends ReservableItem {
  price: number;
  durationMinutes: number;
}

export interface Booking {
  id: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string;
  slot: string;
  clientName: string;
}

export interface TimeSlot {
  label: string;
  start: string;
  end: string;
}

export const profissionais: Professional[] = [
  {
    id: "p1",
    name: "Ana Oliveira",
    description: "Especialista em Nails Art e alongamentos em fibra de vidro. Mais de 8 anos transformando sorrisos através das mãos.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop&crop=face",
    available: true,
  },
  {
    id: "p2",
    name: "Beatriz Costa",
    description: "Expert em design de sobrancelhas e micropigmentação. Especialista em realçar o olhar de forma natural.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop&crop=face",
    available: true,
  },
  {
    id: "p3",
    name: "Carla Mendes",
    description: "Manicure e Pedicure tradicional com foco em saúde das unhas e acabamento impecável com produtos premium.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop&crop=face",
    available: true,
  },
  {
    id: "p4",
    name: "Juliana Silva",
    description: "Especialista em depilação e estética facial. Técnicas exclusivas para o seu bem-estar e cuidado.",
    image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=300&fit=crop&crop=face",
    available: true,
  },
];

export const servicos: Service[] = [
  {
    id: "s1",
    name: "Manicure Simples",
    description: "Corte, lixação, remoção de cutícula e esmaltação tradicional.",
    price: 35,
    durationMinutes: 45,
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=300&fit=crop",
    available: true,
  },
  {
    id: "s2",
    name: "Pedicure Simples",
    description: "Cuidado completo com os pés, esfoliação e esmaltação.",
    price: 45,
    durationMinutes: 45,
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=300&fit=crop",
    available: true,
  },
  {
    id: "s3",
    name: "Combo (Mão + Pé)",
    description: "Serviço completo de manicure e pedicure com desconto especial.",
    price: 70,
    durationMinutes: 90,
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=300&fit=crop",
    available: true,
  },
  {
    id: "s4",
    name: "Design de Sobrancelha",
    description: "Mapeamento facial e design personalizado para o seu rosto.",
    price: 40,
    durationMinutes: 30,
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=300&fit=crop",
    available: true,
  },
  {
    id: "s5",
    name: "Design com Henna",
    description: "Design de sobrancelha finalizado com aplicação de henna para maior definição.",
    price: 60,
    durationMinutes: 45,
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&h=300&fit=crop",
    available: true,
  },
  {
    id: "s6",
    name: "Alongamento em Fibra",
    description: "Técnica de alongamento de unhas resistente e com aspecto natural.",
    price: 150,
    durationMinutes: 120,
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=300&fit=crop",
    available: true,
  },
];

export const timeSlots: TimeSlot[] = [
  // Manhã
  { label: "09:00 – 09:30", start: "09:00", end: "09:30" },
  { label: "09:30 – 10:00", start: "09:30", end: "10:00" },
  { label: "10:00 – 10:30", start: "10:00", end: "10:30" },
  { label: "10:30 – 11:00", start: "10:30", end: "11:00" },
  { label: "11:00 – 11:30", start: "11:00", end: "11:30" },
  { label: "11:30 – 12:00", start: "11:30", end: "12:00" },
  // Tarde
  { label: "14:00 – 14:30", start: "14:00", end: "14:30" },
  { label: "14:30 – 15:00", start: "14:30", end: "15:00" },
  { label: "15:00 – 15:30", start: "15:00", end: "15:30" },
  { label: "15:30 – 16:00", start: "15:30", end: "16:00" },
  { label: "16:00 – 16:30", start: "16:00", end: "16:30" },
  { label: "16:30 – 17:00", start: "16:30", end: "17:00" },
  { label: "17:00 – 17:30", start: "17:00", end: "17:30" },
  { label: "17:30 – 18:00", start: "17:30", end: "18:00" },
];
