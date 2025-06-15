
import { useEffect } from "react";
import { useAI } from "./useAI";
import { useToast } from "@/hooks/use-toast";

interface UseAutoAIProps {
  userId: string;
  relationshipId?: string;
  triggerAnalysis?: boolean;
  onComplete?: (success: boolean) => void; // new callback prop
}

export const useAutoAI = ({
  userId,
  relationshipId,
  triggerAnalysis,
  onComplete,
}: UseAutoAIProps) => {
  const { analyzeRelationship, generateRecommendations, loading } = useAI();
  const { toast } = useToast();

  useEffect(() => {
    const runAutoAnalysis = async () => {
      if (!triggerAnalysis || !relationshipId || !userId) return;

      try {
        console.log('🤖 Starting auto AI analysis...');
        // Run relationship analysis
        await analyzeRelationship(relationshipId, userId);

        // Generate new recommendations
        await generateRecommendations(userId, relationshipId, 'Auto-generated after new favor');

        toast({
          title: "AI Analysis Complete",
          description: "New recommendations and insights have been generated based on your latest activity.",
        });

        console.log('✅ Auto AI analysis completed');
        if (onComplete) onComplete(true);
      } catch (error) {
        console.error('❌ Auto AI analysis failed:', error);
        // Don't show error toast to avoid overwhelming user; instead, propagate error up now
        if (onComplete) onComplete(false);
      }
    };

    const timeoutId = setTimeout(runAutoAnalysis, 1000);
    return () => clearTimeout(timeoutId);
  }, [triggerAnalysis, relationshipId, userId, analyzeRelationship, generateRecommendations, toast, onComplete]);

  return { loading };
};
