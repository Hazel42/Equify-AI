import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw, Sparkles } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAI } from "@/hooks/useAI";
import { useLanguage } from "@/hooks/useLanguage";
import { RecommendationCard } from "@/components/RecommendationCard";
import { RecommendationFilters } from "@/components/RecommendationFilters";

interface RecommendationFromDB {
  id: string;
  relationship_id: string | null;
  title: string;
  description: string | null;
  suggested_actions: any;
  priority_level: number | null;
  due_date: string | null;
  recommendation_type: string;
}

export const SmartRecommendationEngine = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { user } = useAuth();
  const { relationships } = useRelationships();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { generateRecommendations, loading: aiLoading } = useAI();
  const queryClient = useQueryClient();

  const { data: recommendationsFromDB = [], refetch: refetchAIRecommendations } = useQuery<RecommendationFromDB[]>({
    queryKey: ['ai-recommendations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .is('due_date', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    const handler = () => {
      refetchAIRecommendations();
    };
    window.addEventListener("ai-recommendation-updated", handler);
    return () => {
      window.removeEventListener("ai-recommendation-updated", handler);
    };
  }, [refetchAIRecommendations]);

  const recommendations = useMemo(() => {
    return recommendationsFromDB.map(rec => {
      const relationship = relationships.find(r => r.id === rec.relationship_id);
      const actions = rec.suggested_actions || {};
      const priorityLevel = rec.priority_level || 2;
      
      return {
        ...rec,
        id: `ai-${rec.id}`,
        relationshipName: relationship?.name || 'Unknown',
        isAIGenerated: rec.recommendation_type === 'ai_generated',
        priority: priorityLevel >= 4 ? 'urgent' : priorityLevel >= 3 ? 'high' : priorityLevel >= 2 ? 'medium' : 'low',
        timeInvestment: actions.effort_level || 'N/A',
        suggestedActionsList: Array.isArray(actions.how_to_execute) 
            ? actions.how_to_execute 
            : (actions.how_to_execute ? [actions.how_to_execute] : []),
        reasoning: actions.why_appropriate || rec.description,
        type: actions.category || rec.recommendation_type,
        estimatedImpactText: actions.expected_impact || 'Varies',
      };
    }).sort((a, b) => (b.priority_level || 0) - (a.priority_level || 0));
  }, [recommendationsFromDB, relationships]);

  const handleGenerateAllRecommendations = async () => {
    if (!user || relationships.length === 0) {
      toast({
        title: t('recommendations.analysisError'),
        description: t('recommendations.analysisErrorDesc'),
        variant: "destructive"
      });
      return;
    }

    toast({
      title: t('recommendations.analysisStart'),
      description: t('recommendations.analysisStartDesc', { count: relationships.length }),
    });

    let successCount = 0;
    for (const rel of relationships) {
      try {
        await generateRecommendations(user.id, rel.id, 'Manual full analysis trigger');
        successCount++;
      } catch (error) {
        console.error(`Failed to generate recommendations for ${rel.name}`, error);
        toast({
            title: t('recommendations.analysisFailed', { name: rel.name }),
            description: t('recommendations.analysisFailedDesc'),
            variant: "destructive",
        });
      }
    }

    if (successCount > 0) {
        toast({
          title: t('recommendations.analysisComplete'),
          description: t('recommendations.analysisCompleteDesc', { successCount: successCount, total: relationships.length }),
        });
        refetchAIRecommendations();
    } else {
        toast({
            title: t('recommendations.analysisFailedAll'),
            description: t('recommendations.analysisFailedAllDesc'),
            variant: "destructive",
        });
    }
  };

  const handleAcceptRecommendation = async (recommendationId: string) => {
    const dbId = recommendationId.replace(/^ai-/, '');
    const today = new Date().toISOString();
    
    const { error } = await supabase
        .from('recommendations')
        .update({ 
            due_date: today,
            updated_at: new Date().toISOString()
        })
        .eq('id', dbId);

    if (error) {
        toast({ title: t('common.error'), description: t('toast.errorAcceptingRecommendation'), variant: "destructive" });
    } else {
        toast({
          title: t('recommendations.accepted'),
          description: t('recommendations.acceptedDesc'),
        });
        refetchAIRecommendations();
        queryClient.invalidateQueries({ queryKey: ['today-actions'] });
    }
  };

  const handleDismissRecommendation = async (recommendationId: string) => {
    const dbId = recommendationId.replace(/^ai-/, '');
    
    const { error } = await supabase
        .from('recommendations')
        .update({ completed: true })
        .eq('id', dbId);

    if (error) {
        toast({ title: "Error", description: t('toast.errorCompletingRecommendation'), variant: "destructive" });
    } else {
        toast({
          title: t('recommendations.dismissed'),
          description: t('recommendations.dismissedDesc'),
        });
        refetchAIRecommendations();
    }
  };

  const filteredRecommendations = recommendations.filter(r => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'ai') return r.isAIGenerated;
    return r.type === activeFilter;
  });

  const filterTypes = useMemo(() => [
    { key: 'all', label: t('recommendations.filterAll'), count: recommendations.length },
    { key: 'ai', label: t('recommendations.filterAi'), count: recommendations.filter(r => r.isAIGenerated).length },
    { key: 'communication', label: t('recommendations.filterCommunication'), count: recommendations.filter(r => r.type === 'communication').length },
    { key: 'favor', label: t('recommendations.filterFavor'), count: recommendations.filter(r => r.type === 'favor').length },
  ], [recommendations, t]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            {t('recommendations.title')}
          </h2>
          <p className="text-gray-600">{t('recommendations.description')}</p>
        </div>
        <Button onClick={handleGenerateAllRecommendations} disabled={aiLoading} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className={`h-4 w-4 mr-2 ${aiLoading ? 'animate-spin' : ''}`} />
            {aiLoading ? t('recommendations.analyzingButton') : t('recommendations.analyzeButton')}
        </Button>
      </div>

      <RecommendationFilters
        filterTypes={filterTypes}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500 py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-semibold">{t('recommendations.emptyTitle')}</p>
                <p className="text-sm">{t('recommendations.emptyDescription')}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRecommendations.map(recommendation => {
            return (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onAccept={handleAcceptRecommendation}
                onDismiss={handleDismissRecommendation}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
