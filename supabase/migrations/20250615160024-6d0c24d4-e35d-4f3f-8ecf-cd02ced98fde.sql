
-- Ensure RLS policies exist for recommendations table
DO $$
BEGIN
  -- Check if policy exists and create if not
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'recommendations' AND policyname = 'Users can manage their own recommendations'
  ) THEN
    CREATE POLICY "Users can manage their own recommendations" ON public.recommendations
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure RLS policies exist for ai_insights table  
DO $$
BEGIN
  -- Check if policy exists and create if not
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_insights' AND policyname = 'Users can view their own insights'
  ) THEN
    CREATE POLICY "Users can view their own insights" ON public.ai_insights
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON public.recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_priority ON public.recommendations(priority_level DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON public.ai_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON public.ai_insights(insight_type);

-- Enable realtime for recommendations table
ALTER TABLE public.recommendations REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.recommendations;
