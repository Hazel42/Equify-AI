
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, AlertTriangle, Target, Calendar, Heart, Zap } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavors } from "@/hooks/useFavors";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIInsight {
  id: string;
  type: 'health_score' | 'prediction' | 'trend' | 'goal' | 'pattern';
  title: string;
  description: string;
  score?: number;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionable: boolean;
  relationshipId?: string;
  relationshipName?: string;
}

export const EnhancedAIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [overallHealthScore, setOverallHealthScore] = useState(0);
  const { relationships } = useRelationships();
  const { favors } = useFavors();
  const { user } = useAuth();
  const { toast } = useToast();

  const generateAIInsights = async () => {
    if (!user || relationships.length === 0) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-insights', {
        body: { 
          userId: user.id,
          relationships: relationships.slice(0, 10), // Limit for performance
          favors: favors.slice(0, 50)
        }
      });

      if (error) throw error;

      setInsights(data.insights || []);
      setOverallHealthScore(data.overallHealthScore || 0);
    } catch (error: any) {
      console.error('AI Insights error:', error);
      toast({
        title: 'Error generating insights',
        description: 'Unable to generate AI insights. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateAIInsights();
  }, [user, relationships.length, favors.length]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'health_score': return Heart;
      case 'prediction': return AlertTriangle;
      case 'trend': return TrendingUp;
      case 'goal': return Target;
      case 'pattern': return Brain;
      default: return Zap;
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

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Relationship Health Score
          </CardTitle>
          <CardDescription>
            Your overall relationship management performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getHealthScoreColor(overallHealthScore)}`}>
                {overallHealthScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">out of 100</div>
            </div>
            <div className="flex-1">
              <Progress value={overallHealthScore} className="h-3" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Poor</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>
            <Button 
              onClick={generateAIInsights} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight) => {
          const Icon = getInsightIcon(insight.type);
          return (
            <Card key={insight.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <Badge className={getPriorityColor(insight.priority)}>
                      {insight.priority}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    {insight.confidence}% confidence
                  </div>
                </div>
                <CardTitle className="text-sm">{insight.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                
                {insight.score !== undefined && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Score</span>
                      <span>{insight.score}/10</span>
                    </div>
                    <Progress value={insight.score * 10} className="h-2" />
                  </div>
                )}

                {insight.relationshipName && (
                  <div className="text-xs text-blue-600 mb-3">
                    Related to: {insight.relationshipName}
                  </div>
                )}

                {insight.actionable && (
                  <Button size="sm" variant="outline" className="w-full">
                    Take Action
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {insights.length === 0 && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-semibold">No AI insights available</p>
              <p className="text-sm">Add some relationships and interactions to get AI-powered insights.</p>
              <Button 
                onClick={generateAIInsights}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                disabled={relationships.length === 0}
              >
                Generate Insights
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
