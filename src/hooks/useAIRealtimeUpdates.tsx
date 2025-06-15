
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useAIRealtimeUpdates = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('ai-recommendations-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'recommendations',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New AI recommendation received:', payload);
          
          // Dispatch custom event for other components to listen
          window.dispatchEvent(new CustomEvent('ai-recommendation-updated'));
          
          // Show toast notification
          toast({
            title: "New AI Recommendation! 🤖",
            description: "Fresh insights are available for your relationships.",
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_insights',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New AI insight received:', payload);
          
          // Dispatch custom event
          window.dispatchEvent(new CustomEvent('ai-insight-updated'));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return null;
};
