
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Favor {
  id: string;
  description: string;
  category: string;
  direction: 'given' | 'received';
  estimated_value: number;
  emotional_weight: number;
  date_occurred: string;
  relationship_id: string;
  user_id: string;
  created_at: string;
  context?: string;
  reciprocated?: boolean;
}

export const useFavors = () => {
  const [favors, setFavors] = useState<Favor[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchFavors = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favors')
        .select('*')
        .eq('user_id', user.id)
        .order('date_occurred', { ascending: false });

      if (error) throw error;
      
      // Ensure proper typing
      const typedFavors: Favor[] = (data || []).map(favor => ({
        ...favor,
        direction: favor.direction as 'given' | 'received',
        emotional_weight: favor.emotional_weight || 3,
        estimated_value: favor.estimated_value || 0
      }));
      
      setFavors(typedFavors);
    } catch (error: any) {
      console.error('Error fetching favors:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch favors',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFavor = useMutation({
    mutationFn: async (favorData: {
      relationship_id: string;
      direction: 'given' | 'received';
      category: string;
      description: string;
      estimated_value?: number;
      emotional_weight?: number;
      context?: string;
      date_occurred: string;
      reciprocated?: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('favors')
        .insert({
          ...favorData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favors'] });
      fetchFavors();
      toast({
        title: 'Success',
        description: 'Favor saved successfully',
      });
    },
    onError: (error: any) => {
      console.error('Error creating favor:', error);
      toast({
        title: 'Error',
        description: 'Failed to save favor',
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    fetchFavors();
  }, [user]);

  return {
    favors,
    loading,
    createFavor,
    refetch: fetchFavors
  };
};
