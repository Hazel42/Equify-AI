
-- Create profiles table for user data (since we can't reference auth.users directly)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  personality_type VARCHAR,
  reciprocity_style VARCHAR,
  subscription_tier VARCHAR DEFAULT 'free',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create relationships table
CREATE TABLE public.relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR NOT NULL,
  relationship_type VARCHAR NOT NULL, -- friend, family, colleague, etc.
  importance_level INTEGER DEFAULT 3 CHECK (importance_level >= 1 AND importance_level <= 5),
  contact_info JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}', -- learned preferences
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create favors table
CREATE TABLE public.favors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  relationship_id UUID REFERENCES public.relationships(id) ON DELETE CASCADE NOT NULL,
  direction VARCHAR NOT NULL CHECK (direction IN ('given', 'received')),
  category VARCHAR NOT NULL,
  description TEXT NOT NULL,
  estimated_value DECIMAL,
  emotional_weight INTEGER DEFAULT 3 CHECK (emotional_weight >= 1 AND emotional_weight <= 5),
  context TEXT,
  date_occurred DATE NOT NULL DEFAULT CURRENT_DATE,
  reciprocated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_insights table
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  relationship_id UUID REFERENCES public.relationships(id) ON DELETE CASCADE,
  insight_type VARCHAR NOT NULL,
  content JSONB NOT NULL,
  confidence_score DECIMAL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acted_upon BOOLEAN DEFAULT FALSE
);

-- Create recommendations table
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  relationship_id UUID REFERENCES public.relationships(id) ON DELETE CASCADE,
  recommendation_type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  suggested_actions JSONB DEFAULT '[]',
  priority_level INTEGER DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5),
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for relationships
CREATE POLICY "Users can manage their own relationships" ON public.relationships
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for favors
CREATE POLICY "Users can manage their own favors" ON public.favors
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for ai_insights
CREATE POLICY "Users can view their own insights" ON public.ai_insights
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for recommendations
CREATE POLICY "Users can manage their own recommendations" ON public.recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate relationship balance score
CREATE OR REPLACE FUNCTION public.calculate_relationship_balance(rel_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  given_count INTEGER;
  received_count INTEGER;
  given_value DECIMAL;
  received_value DECIMAL;
  balance_score DECIMAL;
BEGIN
  -- Count and sum favors given
  SELECT COUNT(*), COALESCE(SUM(estimated_value), 0)
  INTO given_count, given_value
  FROM public.favors
  WHERE relationship_id = rel_id AND direction = 'given';
  
  -- Count and sum favors received
  SELECT COUNT(*), COALESCE(SUM(estimated_value), 0)
  INTO received_count, received_value
  FROM public.favors
  WHERE relationship_id = rel_id AND direction = 'received';
  
  -- Calculate balance score (1-10 scale)
  IF received_count = 0 AND given_count = 0 THEN
    RETURN 5.0; -- Neutral if no interactions
  END IF;
  
  -- Simple balance calculation - can be enhanced with AI later
  IF received_count > 0 THEN
    balance_score := LEAST(10.0, (given_count::DECIMAL / received_count::DECIMAL) * 5.0);
  ELSE
    balance_score := 10.0; -- Perfect if only giving
  END IF;
  
  RETURN GREATEST(1.0, balance_score);
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX idx_relationships_user_id ON public.relationships(user_id);
CREATE INDEX idx_favors_user_id ON public.favors(user_id);
CREATE INDEX idx_favors_relationship_id ON public.favors(relationship_id);
CREATE INDEX idx_favors_date_occurred ON public.favors(date_occurred);
CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX idx_recommendations_user_id ON public.recommendations(user_id);
