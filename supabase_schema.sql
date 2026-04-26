-- 1. Tabela de Profissionais
CREATE TABLE professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Serviços
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  image TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Agendamentos (Bookings)
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  date DATE NOT NULL,
  slot TEXT NOT NULL,
  validation_code TEXT NOT NULL,
  status TEXT DEFAULT 'confirmado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Inserir dados iniciais (Opcional - Exemplo para teste)
INSERT INTO professionals (name, description, image) VALUES 
('Ana Oliveira', 'Especialista em Nails Art e alongamentos.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'),
('Beatriz Costa', 'Expert em design de sobrancelhas.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400');

INSERT INTO services (name, description, price, duration_minutes, image) VALUES 
('Manicure Simples', 'Corte, lixação e esmaltação.', 35.00, 45, 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400'),
('Design de Sobrancelha', 'Mapeamento e design facial.', 40.00, 30, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400');

-- 5. Habilitar RLS (Row Level Security) - Ajuste conforme sua necessidade de segurança
-- Por enquanto, habilitando acesso público para facilitar o setup inicial
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON professionals FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON services FOR SELECT USING (true);
CREATE POLICY "Allow public insert/read for everyone" ON bookings FOR ALL USING (true) WITH CHECK (true);
