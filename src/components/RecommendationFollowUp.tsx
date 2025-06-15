
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MessageSquare, Star, Calendar, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

interface RecommendationFollowUpProps {
  recommendationId: string;
  title: string;
  relationshipName: string;
  onComplete: () => void;
}

export const RecommendationFollowUp = ({ 
  recommendationId, 
  title, 
  relationshipName, 
  onComplete 
}: RecommendationFollowUpProps) => {
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const completeRecommendation = useMutation({
    mutationFn: async ({ notes, rating }: { notes: string; rating: number }) => {
      // Mark recommendation as completed
      const { error: updateError } = await supabase
        .from('recommendations')
        .update({ 
          completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', recommendationId);

      if (updateError) throw updateError;

      // Create follow-up record
      const { error: insertError } = await supabase
        .from('ai_insights')
        .insert({
          user_id: user?.id,
          insight_type: 'recommendation_feedback',
          content: {
            recommendation_id: recommendationId,
            user_notes: notes,
            user_rating: rating,
            completed_at: new Date().toISOString(),
            title,
            relationship_name: relationshipName
          },
          confidence_score: rating / 5,
          acted_upon: true
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['today-actions'] });
      toast({
        title: t('toast.recommendationCompleted'),
        description: t('toast.recommendationCompletedDesc'),
      });
      onComplete();
    },
    onError: (error) => {
      console.error('Error completing recommendation:', error);
      toast({
        title: t('common.error'),
        description: t('toast.errorCompletingRecommendation'),
        variant: "destructive",
      });
    }
  });

  const handleQuickComplete = () => {
    completeRecommendation.mutate({ notes: "", rating: 5 });
  };

  const handleDetailedComplete = () => {
    if (rating === 0) {
      toast({
        title: t('toast.ratingRequired'),
        description: t('toast.ratingRequiredDesc'),
        variant: "destructive",
      });
      return;
    }
    completeRecommendation.mutate({ notes, rating });
  };

  const scheduleForLater = useMutation({
    mutationFn: async () => {
      const newDueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 3 days later
      
      const { error } = await supabase
        .from('recommendations')
        .update({ 
          due_date: newDueDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', recommendationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: t('toast.scheduledLater'),
        description: t('toast.scheduledLaterDesc'),
      });
      onComplete();
    }
  });

  if (showFollowUp) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            {t('followUp.title')}
          </CardTitle>
          <CardDescription>
            {t('followUp.description', { title: title })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('followUp.ratingLabel')}
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 ${rating >= star ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-400`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('followUp.notesLabel')}
            </label>
            <Textarea
              placeholder={t('followUp.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleDetailedComplete}
              disabled={completeRecommendation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {completeRecommendation.isPending ? t('common.submitting') : t('common.submitFeedback')}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowFollowUp(false)}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex gap-2 pt-2">
      <Button 
        onClick={handleQuickComplete}
        disabled={completeRecommendation.isPending}
        className="bg-green-600 hover:bg-green-700 flex-1"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        {completeRecommendation.isPending ? t('common.completing') : t('common.done')}
      </Button>
      
      <Button 
        variant="outline"
        onClick={() => setShowFollowUp(true)}
        className="flex-1"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        {t('common.addFeedback')}
      </Button>
      
      <Button 
        variant="outline"
        onClick={() => scheduleForLater.mutate()}
        disabled={scheduleForLater.isPending}
        size="sm"
      >
        <Clock className="h-4 w-4 mr-1" />
        {t('common.later')}
      </Button>
    </div>
  );
};
