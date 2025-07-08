-- Create monthly_goals table for relationship goal tracking
CREATE TABLE public.monthly_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  goal_type VARCHAR NOT NULL CHECK (goal_type IN ('contact_frequency', 'favor_balance', 'relationship_building', 'communication', 'appreciation', 'custom')),
  target_value INTEGER,
  current_progress INTEGER DEFAULT 0,
  target_month DATE NOT NULL,
  relationship_id UUID,
  priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.monthly_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for monthly_goals
CREATE POLICY "Users can manage their own monthly goals" 
ON public.monthly_goals 
FOR ALL 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_monthly_goals_user_month ON public.monthly_goals(user_id, target_month);
CREATE INDEX idx_monthly_goals_relationship ON public.monthly_goals(relationship_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_monthly_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_monthly_goals_updated_at
BEFORE UPDATE ON public.monthly_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_monthly_goals_updated_at();