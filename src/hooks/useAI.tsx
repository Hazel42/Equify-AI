
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyzeRelationship = async (relationshipId: string, userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-relationship', {
        body: { relationshipId, userId }
      });

      if (error) throw error;
      
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your relationship dynamics.",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (userId: string, relationshipId: string, context?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: { userId, relationshipId, context }
      });

      if (error) throw error;
      
      toast({
        title: "Recommendations Generated",
        description: "AI has created personalized reciprocity suggestions.",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Recommendation Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeRelationship,
    generateRecommendations,
    loading
  };
};
