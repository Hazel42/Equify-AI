
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Gift, Heart, Lightbulb, MessageCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export interface Recommendation {
    id: string;
    title: string;
    description: string | null;
    relationshipName: string;
    timeInvestment: string;
    priority: 'urgent' | 'high' | 'medium' | 'low' | string;
    isAIGenerated: boolean;
    reasoning: string | null;
    suggestedActionsList: string[];
    due_date: string | null;
    type: string;
}

interface RecommendationCardProps {
    recommendation: Recommendation;
    onAccept: (id: string) => void;
    onDismiss: (id: string) => void;
}

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

export const RecommendationCard = ({ recommendation, onAccept, onDismiss }: RecommendationCardProps) => {
    const { t } = useLanguage();

    return (
        <Card className={`hover:shadow-md transition-shadow ${recommendation.isAIGenerated ? 'border-blue-200 bg-blue-50/30' : ''}`}>
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
                        onClick={() => onAccept(recommendation.id)}
                        className={`${recommendation.isAIGenerated ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {t('recommendations.acceptButton')}
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => onDismiss(recommendation.id)}
                    >
                        {t('recommendations.dismissButton')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
