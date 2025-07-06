
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Relationship {
  id: string;
  name: string;
  relationship_type: string;
  importance_level: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useRelationships = () => {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchRelationships = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('relationships')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRelationships(data || []);
    } catch (error: any) {
      console.error('Error fetching relationships:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch relationships',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRelationship = useMutation({
    mutationFn: async (relationshipData: Omit<Relationship, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('relationships')
        .insert({
          ...relationshipData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setRelationships(prev => [data, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['relationships'] });
      toast({
        title: 'Success',
        description: 'Relationship added successfully',
      });
    },
    onError: (error: any) => {
      console.error('Error adding relationship:', error);
      toast({
        title: 'Error',
        description: 'Failed to add relationship',
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    fetchRelationships();
  }, [user]);

  return {
    relationships,
    loading,
    addRelationship,
    refetch: fetchRelationships
  };
};
