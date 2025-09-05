-- Allow anonymous access to all tables temporarily
-- This allows the app to work without authentication

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own cash flow entries" ON public.cash_flow_entries;
DROP POLICY IF EXISTS "Users can create their own cash flow entries" ON public.cash_flow_entries;
DROP POLICY IF EXISTS "Users can update their own cash flow entries" ON public.cash_flow_entries;
DROP POLICY IF EXISTS "Users can delete their own cash flow entries" ON public.cash_flow_entries;

DROP POLICY IF EXISTS "Users can view their own operational costs" ON public.operational_costs;
DROP POLICY IF EXISTS "Users can create their own operational costs" ON public.operational_costs;
DROP POLICY IF EXISTS "Users can update their own operational costs" ON public.operational_costs;
DROP POLICY IF EXISTS "Users can delete their own operational costs" ON public.operational_costs;

DROP POLICY IF EXISTS "Users can view their own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can create their own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can update their own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can delete their own debts" ON public.debts;

-- Create permissive policies for anonymous access
CREATE POLICY "Allow all operations on cash_flow_entries" 
ON public.cash_flow_entries 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on operational_costs" 
ON public.operational_costs 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on debts" 
ON public.debts 
FOR ALL 
USING (true) 
WITH CHECK (true);