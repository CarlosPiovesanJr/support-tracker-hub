-- Create table for monthly Intercom statistics
CREATE TABLE public.intercom_monthly_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  monthly_total INTEGER NOT NULL DEFAULT 0,
  evaluation_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  month DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraint to prevent duplicate entries for the same user and month
  CONSTRAINT unique_user_month UNIQUE (user_name, month)
);

-- Enable Row Level Security
ALTER TABLE public.intercom_monthly_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no authentication is implemented yet)
CREATE POLICY "Public can view intercom_monthly_stats" 
ON public.intercom_monthly_stats 
FOR SELECT 
USING (true);

CREATE POLICY "Public can insert intercom_monthly_stats" 
ON public.intercom_monthly_stats 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update intercom_monthly_stats" 
ON public.intercom_monthly_stats 
FOR UPDATE 
USING (true);

CREATE POLICY "Public can delete intercom_monthly_stats" 
ON public.intercom_monthly_stats 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_intercom_monthly_stats_updated_at
  BEFORE UPDATE ON public.intercom_monthly_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_intercom_monthly_stats_user_name ON public.intercom_monthly_stats(user_name);
CREATE INDEX idx_intercom_monthly_stats_month ON public.intercom_monthly_stats(month);