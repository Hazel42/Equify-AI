
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateRecommendations = async (userId: string, relationshipId: string, context?: string) => {
    setLoading(true);
    try {
      console.log('🤖 Starting AI recommendation generation...');
      
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: { 
          userId, 
          relationshipId, 
          context: context || 'User requested AI analysis',
          language: 'en' 
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate recommendations');
      }

      if (!data) {
        throw new Error('No data returned from AI service');
      }

      if (!data.success) {
        throw new Error(data.error || 'AI recommendation generation failed');
      }

      console.log('✅ AI recommendations generated successfully:', data);
      
      toast({
        title: "AI Analysis Complete! 🤖",
        description: `Generated ${data.count || 0} recommendations for ${data.relationship || 'your relationship'}.`,
      });
      
      return data;
    } catch (error: any) {
      console.error('❌ AI generation failed:', error);
      
      toast({
        title: "AI Analysis Failed",
        description: error.message || "There was an error generating recommendations. Please try again.",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateRecommendations,
    loading
  };
};
