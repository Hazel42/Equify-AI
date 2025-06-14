
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Relationship {
  id: string;
  user_id: string;
  name: string;
  relationship_type: string;
  importance_level: number;
  contact_info: any;
  preferences: any;
  created_at: string;
  updated_at: string;
}

export const useRelationships = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: relationships = [], isLoading } = useQuery({
    queryKey: ['relationships', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('relationships')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addRelationship = useMutation({
    mutationFn: async (newRelationship: Omit<Relationship, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('relationships')
        .insert({
          ...newRelationship,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships', user?.id] });
    },
  });

  const updateRelationship = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Relationship> }) => {
      const { data, error } = await supabase
        .from('relationships')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships', user?.id] });
    },
  });

  const deleteRelationship = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('relationships')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships', user?.id] });
    },
  });

  return {
    relationships,
    isLoading,
    addRelationship,
    updateRelationship,
    deleteRelationship,
  };
};
