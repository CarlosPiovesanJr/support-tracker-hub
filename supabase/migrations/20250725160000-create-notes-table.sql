-- Create table for notes/annotations
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-yellow-100 border-yellow-300 text-yellow-900',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no authentication is implemented yet)
CREATE POLICY "Public can view notes" 
ON public.notes 
FOR SELECT 
USING (true);

CREATE POLICY "Public can insert notes" 
ON public.notes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update notes" 
ON public.notes 
FOR UPDATE 
USING (true);

CREATE POLICY "Public can delete notes" 
ON public.notes 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX idx_notes_created_at ON public.notes(created_at DESC);