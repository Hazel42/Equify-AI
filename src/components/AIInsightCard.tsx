
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

interface AIInsightCardProps {
  insight: {
    id: string;
    insight_type: string;
    content: any;
    confidence_score: number;
    created_at: string;
    acted_upon: boolean;
  };
  onAction?: (insightId: string) => void;
}

export const AIInsightCard = ({ insight, onAction }: AIInsightCardProps) => {
  const { content } = insight;
  
  const getInsightIcon = () => {
    switch (content.healthStatus) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'needs_attention':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'concerning':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Brain className="h-5 w-5 text-blue-600" />;
    }
  };

  const getHealthColor = () => {
    switch (content.healthStatus) {
      case 'healthy':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'needs_attention':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'concerning':
        return 'text-red-600 border-red-200 bg-red-50';
      default:
        return 'text-blue-600 border-blue-200 bg-blue-50';
    }
  };

  return (
    <Card className={`${getHealthColor()} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getInsightIcon()}
            <CardTitle className="text-lg">Relationship Analysis</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {Math.round(insight.confidence_score * 100)}% confidence
            </Badge>
            {insight.acted_upon && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                Acted Upon
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          AI-powered insights based on your relationship patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-4 w-4" />
          <span className="font-medium">Balance Score: {content.balanceScore}/10</span>
        </div>

        {content.relationshipInsights && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Key Insights:</h4>
            <p className="text-sm text-gray-700">{content.relationshipInsights}</p>
          </div>
        )}

        {content.specificRecommendations && content.specificRecommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recommendations:</h4>
            <ul className="space-y-1">
              {content.specificRecommendations.slice(0, 3).map((rec: string, index: number) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {content.priorityActions && content.priorityActions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Priority Actions:</h4>
            <div className="flex flex-wrap gap-2">
              {content.priorityActions.slice(0, 2).map((action: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {action}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {!insight.acted_upon && onAction && (
          <Button 
            onClick={() => onAction(insight.id)}
            className="w-full mt-4"
            size="sm"
          >
            Mark as Acted Upon
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
