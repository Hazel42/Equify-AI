
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Favor {
  id: string;
  user_id: string;
  relationship_id: string;
  direction: 'given' | 'received';
  category: string;
  description: string;
  estimated_value?: number;
  emotional_weight: number;
  context?: string;
  date_occurred: string;
  reciprocated: boolean;
  created_at: string;
  updated_at: string;
}

export const useFavors = (relationshipId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favors = [], isLoading } = useQuery({
    queryKey: ['favors', user?.id, relationshipId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('favors')
        .select('*')
        .eq('user_id', user.id);

      if (relationshipId) {
        query = query.eq('relationship_id', relationshipId);
      }

      const { data, error } = await query.order('date_occurred', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createFavor = useMutation({
    mutationFn: async (newFavor: Omit<Favor, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('favors')
        .insert({
          ...newFavor,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favors', user?.id] });
    },
  });

  const updateFavor = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Favor> }) => {
      const { data, error } = await supabase
        .from('favors')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favors', user?.id] });
    },
  });

  return {
    favors,
    isLoading,
    createFavor,
    updateFavor,
  };
};
