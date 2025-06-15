
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Heart, MessageCircle, Gift, Sparkles, RefreshCw, Lightbulb } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAI } from "@/hooks/useAI";
import { RecommendationFollowUp } from "@/components/RecommendationFollowUp";
import { useLanguage } from "@/hooks/useLanguage";

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
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const { user } = useAuth();
  const { relationships } = useRelationships();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { generateRecommendations, loading: aiLoading } = useAI();

  const { data: recommendationsFromDB = [], refetch: refetchAIRecommendations } = useQuery<RecommendationFromDB[]>({
    queryKey: ['ai-recommendations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
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

  const handleAcceptRecommendation = (recommendationId: string) => {
    setSelectedRecommendation(recommendationId);
  };

  const handleDismissRecommendation = (recommendationId: string) => {
    toast({
      title: t('recommendations.dismissed'),
      description: t('recommendations.dismissedDesc'),
    });
    // In a real app, we'd update the recommendation status to 'dismissed'
    // For now, we just refetch to simulate removal if backend logic changes.
    refetchAIRecommendations();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_generated': return <Sparkles className="h-4 w-4" />;
      case 'communication': return <MessageCircle className="h-4 w-4" />;
      case 'favor': return <Gift className="h-4 w-4" />;
      case 'appreciation': return <Heart className="h-4 w-4" />;
      case 'connection': return <Brain className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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

      <div className="flex flex-wrap gap-2">
        {filterTypes.map(filter => (
          filter.count > 0 &&
          <Button
            key={filter.key}
            variant={activeFilter === filter.key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.key)}
            className="flex items-center gap-2"
          >
            {filter.key === 'ai' && <Sparkles className="h-3 w-3" />}
            {filter.label}
            <Badge variant="secondary" className="ml-1">
              {filter.count}
            </Badge>
          </Button>
        ))}
      </div>

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
            if (selectedRecommendation === recommendation.id) {
              return (
                <RecommendationFollowUp
                  key={recommendation.id}
                  recommendationId={recommendation.id}
                  title={recommendation.title}
                  relationshipName={recommendation.relationshipName || 'Unknown'}
                  onComplete={() => {
                    setSelectedRecommendation(null);
                    refetchAIRecommendations();
                  }}
                />
              );
            }

            return (
              <Card key={recommendation.id} className={`hover:shadow-md transition-shadow ${recommendation.isAIGenerated ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${recommendation.isAIGenerated ? 'text-blue-600' : 'text-gray-600'}`}>
                        {getTypeIcon(recommendation.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {recommendation.title}
                          {recommendation.isAIGenerated && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {recommendation.relationshipName && (
                            <span className="font-medium">{t('recommendations.cardFor')}: {recommendation.relationshipName} • </span>
                          )}
                          {t('recommendations.cardTime')}: {recommendation.timeInvestment}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getPriorityColor(recommendation.priority)}>
                      {recommendation.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{recommendation.description}</p>
                  
                  <div className={`${recommendation.isAIGenerated ? 'bg-blue-50' : 'bg-gray-50'} p-3 rounded-lg`}>
                    <h4 className={`font-medium ${recommendation.isAIGenerated ? 'text-blue-900' : 'text-gray-900'} mb-2`}>
                      {recommendation.isAIGenerated ? t('recommendations.cardAiReasoning') : t('recommendations.cardReasoning')}
                    </h4>
                    <p className={`text-sm ${recommendation.isAIGenerated ? 'text-blue-700' : 'text-gray-700'}`}>
                      {recommendation.reasoning}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{t('recommendations.cardSuggestedActions')}</h4>
                    <ul className="space-y-1">
                      {recommendation.suggestedActionsList.map((action: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 ${recommendation.isAIGenerated ? 'bg-blue-500' : 'bg-green-500'} rounded-full`} />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {recommendation.due_date && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <Clock className="h-4 w-4" />
                      {t('recommendations.cardDueDate')}: {new Date(recommendation.due_date).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => handleAcceptRecommendation(recommendation.id)}
                      className={`${recommendation.isAIGenerated ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {t('recommendations.acceptButton')}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleDismissRecommendation(recommendation.id)}
                    >
                      {t('recommendations.dismissButton')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
