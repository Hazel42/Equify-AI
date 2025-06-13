
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, Clock, DollarSign, Heart, CheckCircle } from "lucide-react";
import { useAI } from "@/hooks/useAI";
import { useToast } from "@/hooks/use-toast";

interface SmartRecommendationsProps {
  relationshipId: string;
  userId: string;
  relationshipName: string;
}

export const SmartRecommendations = ({ relationshipId, userId, relationshipName }: SmartRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedRec, setSelectedRec] = useState<any>(null);
  const { generateRecommendations, loading } = useAI();
  const { toast } = useToast();

  const handleGenerateRecommendations = async (context?: string) => {
    try {
      const result = await generateRecommendations(userId, relationshipId, context);
      setRecommendations(result.recommendations || []);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    }
  };

  const getEffortIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <Clock className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'high':
        return <Clock className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEffortColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const markAsCompleted = (recIndex: number) => {
    toast({
      title: "Great job! 🎉",
      description: "You've taken action to strengthen your relationship.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Smart Reciprocity Suggestions
              </CardTitle>
              <CardDescription>
                AI-powered recommendations for {relationshipName}
              </CardDescription>
            </div>
            <Button 
              onClick={() => handleGenerateRecommendations()}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Generating...' : 'Get New Ideas'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No recommendations yet</p>
              <Button 
                onClick={() => handleGenerateRecommendations()}
                disabled={loading}
              >
                Generate Smart Suggestions
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getEffortColor(rec.effort_level)}>
                            {getEffortIcon(rec.effort_level)}
                            {rec.effort_level} effort
                          </Badge>
                          {rec.estimated_cost && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {rec.estimated_cost}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{rec.description}</p>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-medium text-green-700">Why this works: </span>
                          <span className="text-gray-600">{rec.why_appropriate}</span>
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">How to do it: </span>
                          <span className="text-gray-600">{rec.how_to_execute}</span>
                        </div>
                        <div>
                          <span className="font-medium text-purple-700">Expected impact: </span>
                          <span className="text-gray-600">{rec.expected_impact}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {rec.category}
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => markAsCompleted(index)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark Done
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
