
import { useEffect } from "react";
import { useAI } from "./useAI";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface UseAutoAIProps {
  userId: string;
  relationshipId?: string;
  triggerAnalysis?: boolean;
  onComplete?: (success: boolean) => void;
}

export const useAutoAI = ({
  userId,
  relationshipId,
  triggerAnalysis,
  onComplete,
}: UseAutoAIProps) => {
  const { generateRecommendations, loading } = useAI();
  const { t } = useLanguage();

  useEffect(() => {
    const runAutoAnalysis = async () => {
      if (!triggerAnalysis || !relationshipId || !userId) return;

      try {
        console.log('🤖 Starting auto AI analysis...');

        // The generateRecommendations function now handles all AI analysis.
        await generateRecommendations(userId, relationshipId, 'Auto-generated after new favor');

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
  }, [triggerAnalysis, relationshipId, userId, generateRecommendations, onComplete, t]);

  return { loading };
};
