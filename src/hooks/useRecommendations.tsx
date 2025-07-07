import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority_level: number;
  suggested_actions: any;
  due_date: string | null;
  recommendation_type: string;
  created_at: string;
  completed: boolean;
}

export const useRecommendations = (relationshipId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch saved recommendations for a relationship
  const {
    data: savedRecommendations = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["recommendations", relationshipId],
    queryFn: async () => {
      if (!user?.id || !relationshipId) return [];

      const { data, error } = await supabase
        .from("recommendations")
        .select("*")
        .eq("user_id", user.id)
        .eq("relationship_id", relationshipId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Recommendation[];
    },
    enabled: !!user?.id && !!relationshipId,
  });

  // Save recommendation to database
  const saveRecommendationMutation = useMutation({
    mutationFn: async (recommendation: any) => {
      if (!user?.id || !relationshipId)
        throw new Error("Missing user or relationship");

      const { data, error } = await supabase
        .from("recommendations")
        .insert({
          user_id: user.id,
          relationship_id: relationshipId,
          title: recommendation.title,
          description: recommendation.description,
          priority_level: recommendation.priority_level || 3,
          suggested_actions: recommendation.suggested_actions || {},
          due_date: recommendation.due_date || null,
          recommendation_type: "ai_generated",
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recommendations", relationshipId],
      });
      toast({
        title: "Recommendation Saved! 💾",
        description: "The AI recommendation has been saved to your list.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save recommendation.",
        variant: "destructive",
      });
    },
  });

  // Delete recommendation from database
  const deleteRecommendationMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      const { error } = await supabase
        .from("recommendations")
        .delete()
        .eq("id", recommendationId)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recommendations", relationshipId],
      });
      toast({
        title: "Recommendation Deleted",
        description: "The recommendation has been removed from your list.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete recommendation.",
        variant: "destructive",
      });
    },
  });

  // Mark recommendation as completed
  const markCompletedMutation = useMutation({
    mutationFn: async ({
      id,
      completed,
    }: {
      id: string;
      completed: boolean;
    }) => {
      const { error } = await supabase
        .from("recommendations")
        .update({ completed, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recommendations", relationshipId],
      });
      toast({
        title: "Recommendation Updated",
        description: "The recommendation status has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update recommendation.",
        variant: "destructive",
      });
    },
  });

  return {
    savedRecommendations,
    isLoading,
    refetch,
    saveRecommendation: saveRecommendationMutation.mutate,
    deleteRecommendation: deleteRecommendationMutation.mutate,
    markCompleted: markCompletedMutation.mutate,
    isSaving: saveRecommendationMutation.isPending,
    isDeleting: deleteRecommendationMutation.isPending,
  };
};
