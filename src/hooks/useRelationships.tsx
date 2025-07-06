import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";

type Relationship = Tables<"relationships">;
type RelationshipInsert = TablesInsert<"relationships">;
type RelationshipUpdate = TablesUpdate<"relationships">;

export const useRelationships = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all relationships
  const {
    data: relationships,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["relationships", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("relationships")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Add new relationship
  const addRelationship = useMutation({
    mutationFn: async (
      newRelationship: Omit<RelationshipInsert, "user_id" | "id">,
    ) => {
      if (!user?.id) throw new Error("User not authenticated");

      const relationshipData: RelationshipInsert = {
        ...newRelationship,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("relationships")
        .insert([relationshipData])
        .select()
        .single();

      if (error) throw error;

      // Add activity feed entry
      await supabase.from("activity_feed").insert([
        {
          user_id: user.id,
          type: "relationship_added",
          title: "New relationship added",
          description: `Added ${newRelationship.name} as a ${newRelationship.relationship_type}`,
          metadata: { relationship_id: data.id },
        },
      ]);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["relationships", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats", user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["analytics", user?.id] });

      toast({
        title: "Relationship Added! 🎉",
        description: `${data.name} has been added to your network.`,
      });
    },
    onError: (error) => {
      console.error("Error adding relationship:", error);
      toast({
        title: "Error",
        description: "Failed to add relationship. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update relationship
  const updateRelationship = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: RelationshipUpdate;
    }) => {
      const { data, error } = await supabase
        .from("relationships")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["relationships", user?.id] });
      toast({
        title: "Updated! ✅",
        description: "Relationship has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating relationship:", error);
      toast({
        title: "Error",
        description: "Failed to update relationship. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete relationship
  const deleteRelationship = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("relationships")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;

      // Add activity feed entry
      await supabase.from("activity_feed").insert([
        {
          user_id: user?.id!,
          type: "relationship_removed",
          title: "Relationship removed",
          description: "A relationship was removed from your network",
        },
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["relationships", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats", user?.id],
      });

      toast({
        title: "Removed",
        description: "Relationship has been removed from your network.",
      });
    },
    onError: (error) => {
      console.error("Error deleting relationship:", error);
      toast({
        title: "Error",
        description: "Failed to remove relationship. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get relationship by ID
  const getRelationship = (id: string) => {
    return relationships?.find((rel) => rel.id === id);
  };

  // Get relationships by type
  const getRelationshipsByType = (type: string) => {
    return relationships?.filter((rel) => rel.relationship_type === type) || [];
  };

  // Search relationships
  const searchRelationships = (query: string) => {
    if (!query) return relationships || [];
    return (
      relationships?.filter((rel) =>
        rel.name.toLowerCase().includes(query.toLowerCase()),
      ) || []
    );
  };

  return {
    relationships,
    isLoading,
    error,
    addRelationship,
    updateRelationship,
    deleteRelationship,
    getRelationship,
    getRelationshipsByType,
    searchRelationships,
  };
};
