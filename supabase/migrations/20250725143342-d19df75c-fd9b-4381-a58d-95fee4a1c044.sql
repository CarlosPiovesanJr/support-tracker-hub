-- Criar tabela para registros diários de chamados
CREATE TABLE public.registros_chamados_diarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  integrante TEXT NOT NULL,
  chamados_intercom INTEGER NOT NULL DEFAULT 0,
  chamados_whatsapp INTEGER NOT NULL DEFAULT 0,
  total_chamados INTEGER GENERATED ALWAYS AS (chamados_intercom + chamados_whatsapp) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraint para evitar registros duplicados por integrante e data
  CONSTRAINT unique_integrante_data UNIQUE (integrante, data)
);

-- Enable Row Level Security
ALTER TABLE public.registros_chamados_diarios ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no authentication is implemented yet)
CREATE POLICY "Public can view registros_chamados_diarios" 
ON public.registros_chamados_diarios 
FOR SELECT 
USING (true);

CREATE POLICY "Public can insert registros_chamados_diarios" 
ON public.registros_chamados_diarios 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update registros_chamados_diarios" 
ON public.registros_chamados_diarios 
FOR UPDATE 
USING (true);

CREATE POLICY "Public can delete registros_chamados_diarios" 
ON public.registros_chamados_diarios 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_registros_chamados_diarios_updated_at
  BEFORE UPDATE ON public.registros_chamados_diarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_registros_chamados_data ON public.registros_chamados_diarios(data);
CREATE INDEX idx_registros_chamados_integrante ON public.registros_chamados_diarios(integrante);