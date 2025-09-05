-- Create cash_flow_entries table
CREATE TABLE public.cash_flow_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  status TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create operational_costs table
CREATE TABLE public.operational_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fixo', 'variavel')),
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create debts table
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  creditor TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  installments INTEGER NOT NULL,
  installment_value DECIMAL(15,2) NOT NULL,
  total_with_interest DECIMAL(15,2) NOT NULL,
  due_date DATE NOT NULL,
  justification TEXT NOT NULL,
  additional_terms TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'negotiating', 'overdue', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cash_flow_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- Create policies for cash_flow_entries
CREATE POLICY "Users can view their own cash flow entries" 
ON public.cash_flow_entries 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own cash flow entries" 
ON public.cash_flow_entries 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cash flow entries" 
ON public.cash_flow_entries 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own cash flow entries" 
ON public.cash_flow_entries 
FOR DELETE 
USING (user_id = auth.uid());

-- Create policies for operational_costs
CREATE POLICY "Users can view their own operational costs" 
ON public.operational_costs 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own operational costs" 
ON public.operational_costs 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own operational costs" 
ON public.operational_costs 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own operational costs" 
ON public.operational_costs 
FOR DELETE 
USING (user_id = auth.uid());

-- Create policies for debts
CREATE POLICY "Users can view their own debts" 
ON public.debts 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own debts" 
ON public.debts 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own debts" 
ON public.debts 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own debts" 
ON public.debts 
FOR DELETE 
USING (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_cash_flow_entries_updated_at
  BEFORE UPDATE ON public.cash_flow_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_operational_costs_updated_at
  BEFORE UPDATE ON public.operational_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();