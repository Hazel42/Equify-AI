
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Heart, MessageCircle, Gift, Calendar, TrendingUp, Lightbulb } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavors } from "@/hooks/useFavors";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

interface SmartRecommendation {
  id: string;
  type: 'communication' | 'favor' | 'milestone' | 'balance' | 'connection';
  title: string;
  description: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedImpact: number;
  timeInvestment: string;
  relationshipId?: string;
  relationshipName?: string;
  suggestedActions: string[];
  dueDate?: string;
}

export const SmartRecommendationEngine = () => {
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { relationships } = useRelationships();
  const { favors } = useFavors();
  const { profile } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    generateSmartRecommendations();
  }, [relationships, favors, profile]);

  const generateSmartRecommendations = () => {
    const newRecommendations: SmartRecommendation[] = [];

    // Communication recommendations based on last interaction
    relationships.forEach(relationship => {
      const lastFavor = favors
        .filter(f => f.relationship_id === relationship.id)
        .sort((a, b) => new Date(b.date_occurred).getTime() - new Date(a.date_occurred).getTime())[0];

      if (!lastFavor || new Date().getTime() - new Date(lastFavor.date_occurred).getTime() > 7 * 24 * 60 * 60 * 1000) {
        newRecommendations.push({
          id: `comm-${relationship.id}`,
          type: 'communication',
          title: `Reconnect with ${relationship.name}`,
          description: `It's been a while since your last interaction. A simple check-in could strengthen your bond.`,
          reasoning: `Based on your ${profile?.personality_type || 'balanced'} personality type and the lack of recent interaction, this relationship needs attention.`,
          priority: 'medium',
          estimatedImpact: 8,
          timeInvestment: '5-10 minutes',
          relationshipId: relationship.id,
          relationshipName: relationship.name,
          suggestedActions: [
            'Send a thoughtful text message',
            'Schedule a coffee meetup',
            'Share something that reminded you of them',
            'Ask about their recent projects'
          ],
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });

    // Balance recommendations
    relationships.forEach(relationship => {
      const relationshipFavors = favors.filter(f => f.relationship_id === relationship.id);
      const given = relationshipFavors.filter(f => f.direction === 'given').length;
      const received = relationshipFavors.filter(f => f.direction === 'received').length;

      if (received > given + 2) {
        newRecommendations.push({
          id: `balance-${relationship.id}`,
          type: 'balance',
          title: `Rebalance relationship with ${relationship.name}`,
          description: `You've received more favors than you've given. Consider showing appreciation.`,
          reasoning: `The giving-receiving ratio is imbalanced (${given} given vs ${received} received). Restoring balance will strengthen this relationship.`,
          priority: 'high',
          estimatedImpact: 9,
          timeInvestment: '15-30 minutes',
          relationshipId: relationship.id,
          relationshipName: relationship.name,
          suggestedActions: [
            'Offer help with their current project',
            'Treat them to lunch or coffee',
            'Give a thoughtful gift',
            'Provide a meaningful introduction'
          ]
        });
      }
    });

    // Milestone recommendations
    if (relationships.length === 5) {
      newRecommendations.push({
        id: 'milestone-5-relationships',
        type: 'milestone',
        title: 'Celebrate Your Growing Network!',
        description: 'You\'ve reached 5 meaningful relationships. Time to reflect on your progress.',
        reasoning: 'Reaching relationship milestones is important for motivation and self-reflection.',
        priority: 'low',
        estimatedImpact: 6,
        timeInvestment: '10 minutes',
        suggestedActions: [
          'Write in a gratitude journal',
          'Plan a small celebration',
          'Reflect on lessons learned',
          'Set new relationship goals'
        ]
      });
    }

    // Personality-based recommendations
    if (profile?.personality_type === 'giving') {
      newRecommendations.push({
        id: 'personality-giving',
        type: 'connection',
        title: 'Practice Receiving Gracefully',
        description: 'As a natural giver, remember that accepting help strengthens relationships too.',
        reasoning: 'Your giving personality type suggests you might struggle with receiving. Balanced relationships require both giving and receiving.',
        priority: 'medium',
        estimatedImpact: 7,
        timeInvestment: 'Ongoing mindset',
        suggestedActions: [
          'Say yes to the next offer of help',
          'Ask someone for a small favor',
          'Express gratitude when receiving',
          'Practice vulnerability in sharing your needs'
        ]
      });
    }

    // Favor opportunity recommendations
    const recentFavors = favors.filter(f => 
      new Date().getTime() - new Date(f.date_occurred).getTime() < 7 * 24 * 60 * 60 * 1000
    );

    if (recentFavors.length === 0) {
      newRecommendations.push({
        id: 'favor-opportunity',
        type: 'favor',
        title: 'Look for Favor Opportunities',
        description: 'You haven\'t recorded any relationship activities this week. Stay engaged!',
        reasoning: 'Regular relationship activities are key to maintaining strong connections.',
        priority: 'medium',
        estimatedImpact: 8,
        timeInvestment: 'Varies',
        suggestedActions: [
          'Check in with 2-3 people today',
          'Offer help to someone in your network',
          'Share useful resources or connections',
          'Plan a social gathering'
        ],
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    setRecommendations(newRecommendations.slice(0, 8)); // Limit to 8 recommendations
  };

  const handleAcceptRecommendation = (recommendationId: string) => {
    const recommendation = recommendations.find(r => r.id === recommendationId);
    if (recommendation) {
      toast({
        title: "Recommendation Accepted",
        description: `Great choice! "${recommendation.title}" will help strengthen your relationships.`,
      });
      
      setRecommendations(prev => prev.filter(r => r.id !== recommendationId));
    }
  };

  const handleDismissRecommendation = (recommendationId: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== recommendationId));
    toast({
      title: "Recommendation Dismissed",
      description: "We'll generate new recommendations based on your preferences.",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'communication': return <MessageCircle className="h-4 w-4" />;
      case 'favor': return <Gift className="h-4 w-4" />;
      case 'milestone': return <TrendingUp className="h-4 w-4" />;
      case 'balance': return <Heart className="h-4 w-4" />;
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

  const filteredRecommendations = activeFilter === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.type === activeFilter);

  const filterTypes = [
    { key: 'all', label: 'All', count: recommendations.length },
    { key: 'communication', label: 'Communication', count: recommendations.filter(r => r.type === 'communication').length },
    { key: 'balance', label: 'Balance', count: recommendations.filter(r => r.type === 'balance').length },
    { key: 'favor', label: 'Favors', count: recommendations.filter(r => r.type === 'favor').length },
    { key: 'connection', label: 'Connection', count: recommendations.filter(r => r.type === 'connection').length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Recommendations</h2>
        <p className="text-gray-600">AI-powered suggestions to strengthen your relationships</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTypes.map(filter => (
          <Button
            key={filter.key}
            variant={activeFilter === filter.key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.key)}
            className="flex items-center gap-2"
          >
            {filter.label}
            {filter.count > 0 && (
              <Badge variant="secondary" className="ml-1">
                {filter.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recommendations available right now.</p>
                <p className="text-sm">Check back later for new AI insights!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRecommendations.map(recommendation => (
            <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">
                      {getTypeIcon(recommendation.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {recommendation.relationshipName && (
                          <span className="font-medium">For: {recommendation.relationshipName} • </span>
                        )}
                        Impact: {recommendation.estimatedImpact}/10 • Time: {recommendation.timeInvestment}
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
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">AI Reasoning</h4>
                  <p className="text-sm text-blue-700">{recommendation.reasoning}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Suggested Actions</h4>
                  <ul className="space-y-1">
                    {recommendation.suggestedActions.map((action, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {recommendation.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <Clock className="h-4 w-4" />
                    Due: {new Date(recommendation.dueDate).toLocaleDateString()}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => handleAcceptRecommendation(recommendation.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Accept & Act
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleDismissRecommendation(recommendation.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
