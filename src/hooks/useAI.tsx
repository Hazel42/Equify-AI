
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const generateRecommendations = async (userId: string, relationshipId: string, context?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: { userId, relationshipId, context, language }
      });

      if (error) throw error;
      
      // Toast notifications will be handled by the component that calls this.
      // This makes the hook more reusable.
      
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
    generateRecommendations,
    loading
  };
};
