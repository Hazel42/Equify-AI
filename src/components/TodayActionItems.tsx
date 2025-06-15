
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Clock, CheckCircle, Calendar, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  relationshipName: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  suggestedActions: any;
}

export const TodayActionItems = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Fetch today's recommendations that are due
  const { data: actionItems = [], isLoading } = useQuery({
    queryKey: ['today-actions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data: recommendations, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          relationships(name)
        `)
        .eq('user_id', user.id)
        .eq('completed', false)
        .lte('due_date', tomorrow)
        .gte('due_date', today)
        .order('priority_level', { ascending: false })
        .limit(6);

      if (error) throw error;

      return recommendations.map(rec => ({
        id: rec.id,
        title: rec.title,
        description: rec.description || 'No description available',
        relationshipName: rec.relationships?.name || 'Unknown',
        dueDate: rec.due_date,
        priority: rec.priority_level >= 4 ? 'high' : rec.priority_level >= 3 ? 'medium' : 'low',
        category: rec.recommendation_type,
        suggestedActions: rec.suggested_actions
      })) as ActionItem[];
    },
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
  });

  // Mark recommendation as completed
  const completeRecommendation = useMutation({
    mutationFn: async (recommendationId: string) => {
      const { error } = await supabase
        .from('recommendations')
        .update({ 
          completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', recommendationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-actions'] });
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      toast({
        title: t('toast.actionCompleted'),
        description: t('toast.actionCompletedDesc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: t('toast.errorMarkingCompleted'),
        variant: "destructive",
      });
    },
    onSettled: () => {
      setCompletingId(null);
    }
  });

  const handleCompleteAction = (actionId: string) => {
    setCompletingId(actionId);
    completeRecommendation.mutate(actionId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication': return <User className="h-4 w-4" />;
      case 'favor': return <Target className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            {t('todayActions.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin h-6 w-6 mx-auto mb-2">⏳</div>
            <p className="text-gray-500">{t('todayActions.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (actionItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            {t('todayActions.title')}
          </CardTitle>
          <CardDescription>{t('todayActions.noActions')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">{t('todayActions.allCaughtUp')}</p>
            <p className="text-sm text-gray-500">{t('todayActions.checkBackLater')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          {t('todayActions.title')}
        </CardTitle>
        <CardDescription>{t('todayActions.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actionItems.map((action) => (
            <div key={action.id} className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(action.category)}
                  <Badge className={getPriorityColor(action.priority)}>
                    {action.priority}
                  </Badge>
                </div>
                {action.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {new Date(action.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              <h4 className="font-medium text-gray-900 mb-2">{action.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{action.description}</p>
              
              <div className="text-xs text-blue-600 mb-3">
                {t('common.for')}: {action.relationshipName}
              </div>

              {action.suggestedActions?.how_to_execute && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">{t('common.howToDoIt')}</p>
                  <p className="text-xs text-gray-600">{action.suggestedActions.how_to_execute}</p>
                </div>
              )}

              <Button 
                size="sm" 
                onClick={() => handleCompleteAction(action.id)}
                disabled={completingId === action.id}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {completingId === action.id ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2">⏳</div>
                    {t('common.completing')}...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('common.markDone')}
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
