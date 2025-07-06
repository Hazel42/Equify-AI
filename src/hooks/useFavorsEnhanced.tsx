import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";

type Favor = Tables<"favors">;
type FavorInsert = TablesInsert<"favors">;
type FavorUpdate = TablesUpdate<"favors">;

export const useFavorsEnhanced = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all favors
  const {
    data: favors,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["favors", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("favors")
        .select(
          `
          *,
          relationships (
            id,
            name,
            relationship_type
          )
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Add new favor
  const addFavor = useMutation({
    mutationFn: async (newFavor: Omit<FavorInsert, "user_id" | "id">) => {
      if (!user?.id) throw new Error("User not authenticated");

      const favorData: FavorInsert = {
        ...newFavor,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        date_occurred:
          newFavor.date_occurred || new Date().toISOString().split("T")[0],
      };

      const { data, error } = await supabase
        .from("favors")
        .insert([favorData])
        .select(
          `
          *,
          relationships (
            id,
            name,
            relationship_type
          )
        `,
        )
        .single();

      if (error) throw error;

      // Add activity feed entry
      await supabase.from("activity_feed").insert([
        {
          user_id: user.id,
          type: "favor_added",
          title: `Favor ${newFavor.direction}`,
          description: `${newFavor.direction === "given" ? "Gave" : "Received"}: ${newFavor.description}`,
          metadata: {
            favor_id: data.id,
            relationship_id: newFavor.relationship_id,
            direction: newFavor.direction,
          },
        },
      ]);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["favors", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["relationships", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats", user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["analytics", user?.id] });

      const relationshipName = data.relationships?.name || "Someone";
      toast({
        title: `Favor ${data.direction === "given" ? "Given" : "Received"}! 🎁`,
        description: `${data.direction === "given" ? "You helped" : relationshipName + " helped you"}: ${data.description}`,
      });
    },
    onError: (error) => {
      console.error("Error adding favor:", error);
      toast({
        title: "Error",
        description: "Failed to add favor. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update favor
  const updateFavor = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: FavorUpdate;
    }) => {
      const { data, error } = await supabase
        .from("favors")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user?.id)
        .select(
          `
          *,
          relationships (
            id,
            name,
            relationship_type
          )
        `,
        )
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favors", user?.id] });
      toast({
        title: "Updated! ✅",
        description: "Favor has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating favor:", error);
      toast({
        title: "Error",
        description: "Failed to update favor. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete favor
  const deleteFavor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("favors")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favors", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats", user?.id],
      });

      toast({
        title: "Removed",
        description: "Favor has been removed.",
      });
    },
    onError: (error) => {
      console.error("Error deleting favor:", error);
      toast({
        title: "Error",
        description: "Failed to remove favor. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark favor as reciprocated
  const markAsReciprocated = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("favors")
        .update({
          reciprocated: true,
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
      queryClient.invalidateQueries({ queryKey: ["favors", user?.id] });
      toast({
        title: "Marked as Reciprocated! ✅",
        description: "This favor has been marked as reciprocated.",
      });
    },
  });

  // Get favors for specific relationship
  const getFavorsForRelationship = (relationshipId: string) => {
    return (
      favors?.filter((favor) => favor.relationship_id === relationshipId) || []
    );
  };

  // Get favor balance for specific relationship
  const getRelationshipBalance = (relationshipId: string) => {
    const relationshipFavors = getFavorsForRelationship(relationshipId);
    const given = relationshipFavors.filter(
      (f) => f.direction === "given",
    ).length;
    const received = relationshipFavors.filter(
      (f) => f.direction === "received",
    ).length;
    return given - received;
  };

  // Get recent favors
  const getRecentFavors = (limit: number = 10) => {
    return favors?.slice(0, limit) || [];
  };

  // Search favors
  const searchFavors = (query: string) => {
    if (!query) return favors || [];
    return (
      favors?.filter(
        (favor) =>
          favor.description.toLowerCase().includes(query.toLowerCase()) ||
          favor.category.toLowerCase().includes(query.toLowerCase()),
      ) || []
    );
  };

  // Get favor statistics
  const getFavorStats = () => {
    if (!favors) return { given: 0, received: 0, balance: 0, total: 0 };

    const given = favors.filter((f) => f.direction === "given").length;
    const received = favors.filter((f) => f.direction === "received").length;
    const balance = given - received;
    const total = favors.length;

    return { given, received, balance, total };
  };

  return {
    favors,
    isLoading,
    error,
    addFavor,
    updateFavor,
    deleteFavor,
    markAsReciprocated,
    getFavorsForRelationship,
    getRelationshipBalance,
    getRecentFavors,
    searchFavors,
    getFavorStats,
  };
};
