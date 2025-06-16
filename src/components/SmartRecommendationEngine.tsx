
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAI } from "@/hooks/useAI";
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
  const { generateRecommendations, loading: aiLoading } = useAI();
  const queryClient = useQueryClient();

  const { data: recommendationsFromDB = [], refetch: refetchAIRecommendations, isLoading: recommendationsLoading, error: recommendationsError } = useQuery<RecommendationFromDB[]>({
    queryKey: ['ai-recommendations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching AI recommendations...');
      
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
      }
      
      console.log('Fetched recommendations:', data);
      return data || [];
    },
    enabled: !!user,
    retry: 3,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const handler = () => {
      console.log('Refreshing recommendations due to external update...');
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
        relationshipName: relationship?.name || 'Unknown Relationship',
        isAIGenerated: rec.recommendation_type === 'ai_generated',
        priority: priorityLevel >= 4 ? 'urgent' : priorityLevel >= 3 ? 'high' : priorityLevel >= 2 ? 'medium' : 'low',
        timeInvestment: actions.effort_level || '30 minutes',
        suggestedActionsList: Array.isArray(actions.how_to_execute) 
            ? actions.how_to_execute 
            : (actions.how_to_execute ? [actions.how_to_execute] : ['Follow the recommendation']),
        reasoning: actions.why_appropriate || rec.description || 'AI analysis suggests this action',
        type: actions.category || rec.recommendation_type,
        estimatedImpactText: actions.expected_impact || 'Improved relationship quality',
      };
    }).sort((a, b) => (b.priority_level || 0) - (a.priority_level || 0));
  }, [recommendationsFromDB, relationships]);

  const handleGenerateAllRecommendations = async () => {
    if (!user || relationships.length === 0) {
      toast({
        title: 'Cannot Generate Recommendations',
        description: 'Please add at least one relationship first.',
        variant: "destructive"
      });
      return;
    }

    toast({
      title: 'Starting AI Analysis',
      description: `Analyzing ${relationships.length} relationships. This may take a moment.`,
    });

    let successCount = 0;
    let failureCount = 0;
    
    for (const rel of relationships) {
      try {
        await generateRecommendations(user.id, rel.id, 'Manual full analysis trigger');
        successCount++;
        
        // Add a small delay between requests to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate recommendations for ${rel.name}`, error);
        failureCount++;
      }
    }

    // Refresh recommendations after generation
    setTimeout(() => {
      refetchAIRecommendations();
    }, 2000);

    if (successCount > 0) {
      toast({
        title: 'AI Analysis Complete',
        description: `Successfully analyzed ${successCount} relationships${failureCount > 0 ? `, ${failureCount} failed` : ''}. Refreshing recommendations...`,
      });
    } else {
      toast({
        title: 'AI Analysis Failed',
        description: 'Could not generate recommendations for any relationship. Please check your internet connection and try again.',
        variant: "destructive",
      });
    }
  };

  const handleAcceptRecommendation = async (recommendationId: string) => {
    const dbId = recommendationId.replace(/^ai-/, '');
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { error } = await supabase
          .from('recommendations')
          .update({ 
              due_date: today,
              updated_at: new Date().toISOString()
          })
          .eq('id', dbId);

      if (error) throw error;

      toast({
        title: 'Recommendation Accepted',
        description: "This action has been added to your Today's Action Items.",
      });
      
      refetchAIRecommendations();
      queryClient.invalidateQueries({ queryKey: ['today-actions'] });
    } catch (error) {
      console.error('Error accepting recommendation:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to accept recommendation. Please try again.', 
        variant: "destructive" 
      });
    }
  };

  const handleDismissRecommendation = async (recommendationId: string) => {
    const dbId = recommendationId.replace(/^ai-/, '');
    
    try {
      const { error } = await supabase
          .from('recommendations')
          .update({ completed: true })
          .eq('id', dbId);

      if (error) throw error;

      toast({
        title: 'Recommendation Dismissed',
        description: "We'll generate new recommendations based on your preferences.",
      });
      
      refetchAIRecommendations();
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      toast({ 
        title: "Error", 
        description: 'Failed to dismiss recommendation. Please try again.', 
        variant: "destructive" 
      });
    }
  };

  const filteredRecommendations = recommendations.filter(r => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'ai') return r.isAIGenerated;
    return r.type === activeFilter;
  });

  const filterTypes = useMemo(() => [
    { key: 'all', label: 'All', count: recommendations.length },
    { key: 'ai', label: 'AI Generated', count: recommendations.filter(r => r.isAIGenerated).length },
    { key: 'communication', label: 'Communication', count: recommendations.filter(r => r.type === 'communication').length },
    { key: 'favor', label: 'Favor', count: recommendations.filter(r => r.type === 'favor').length },
  ], [recommendations]);

  if (recommendationsError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center text-red-600 py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="font-semibold">Error Loading Recommendations</p>
            <p className="text-sm">Failed to load AI recommendations. Please try refreshing the page.</p>
            <Button 
              onClick={() => refetchAIRecommendations()} 
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Smart Recommendations
          </h2>
          <p className="text-gray-600">AI-powered suggestions to strengthen your relationships</p>
        </div>
        <Button 
          onClick={handleGenerateAllRecommendations} 
          disabled={aiLoading || relationships.length === 0} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${aiLoading ? 'animate-spin' : ''}`} />
          {aiLoading ? 'Analyzing...' : 'Analyze All Relationships'}
        </Button>
      </div>

      {relationships.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center text-yellow-700 py-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="font-semibold">No Relationships Found</p>
              <p className="text-sm">Add some relationships first to get AI recommendations.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <RecommendationFilters
        filterTypes={filterTypes}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <div className="space-y-4">
        {recommendationsLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500 py-8">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="font-semibold">Loading AI Recommendations...</p>
                <p className="text-sm">Please wait while we fetch your personalized recommendations.</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredRecommendations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500 py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-semibold">No recommendations yet</p>
                <p className="text-sm">
                  {recommendations.length === 0 
                    ? "Analyze your relationships to get personalized AI suggestions." 
                    : "No recommendations match the current filter."}
                </p>
                {relationships.length > 0 && recommendations.length === 0 && (
                  <Button 
                    onClick={handleGenerateAllRecommendations}
                    disabled={aiLoading}
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Recommendations
                  </Button>
                )}
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
