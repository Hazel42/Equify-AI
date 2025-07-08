import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface MonthlyGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  goal_type: 'contact_frequency' | 'favor_balance' | 'relationship_building' | 'communication' | 'appreciation' | 'custom';
  target_value?: number;
  current_progress: number;
  target_month: string;
  relationship_id?: string;
  priority_level: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
  // Joined data
  relationships?: {
    name: string;
    relationship_type: string;
  };
}

export const useMonthlyGoals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get monthly goals for current month
  const { data: currentGoals, isLoading } = useQuery({
    queryKey: ["monthly-goals", user?.id, new Date().getMonth(), new Date().getFullYear()],
    queryFn: async () => {
      if (!user?.id) return [];

      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from("monthly_goals")
        .select(`
          *,
          relationships (
            name,
            relationship_type
          )
        `)
        .eq("user_id", user.id)
        .gte("target_month", startOfMonth.toISOString().split('T')[0])
        .lte("target_month", endOfMonth.toISOString().split('T')[0])
        .order("priority_level", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as MonthlyGoal[];
    },
    enabled: !!user?.id,
  });

  // Get goal history
  const { data: goalHistory } = useQuery({
    queryKey: ["monthly-goals-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("monthly_goals")
        .select(`
          *,
          relationships (
            name,
            relationship_type
          )
        `)
        .eq("user_id", user.id)
        .order("target_month", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as unknown as MonthlyGoal[];
    },
    enabled: !!user?.id,
  });

  // Create new goal
  const createGoal = useMutation({
    mutationFn: async (goalData: Omit<MonthlyGoal, "id" | "user_id" | "current_progress" | "completed" | "created_at" | "updated_at">) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("monthly_goals")
        .insert([
          {
            ...goalData,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-goals"] });
      toast({
        title: "Goal Created",
        description: "Your monthly goal has been created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
      console.error("Create goal error:", error);
    },
  });

  // Update goal progress
  const updateProgress = useMutation({
    mutationFn: async ({ goalId, progress, completed }: { goalId: string; progress: number; completed?: boolean }) => {
      const { data, error } = await supabase
        .from("monthly_goals")
        .update({ 
          current_progress: progress,
          completed: completed ?? false,
        })
        .eq("id", goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-goals"] });
      toast({
        title: "Progress Updated",
        description: "Goal progress has been updated!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
      console.error("Update progress error:", error);
    },
  });

  // Delete goal
  const deleteGoal = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from("monthly_goals")
        .delete()
        .eq("id", goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-goals"] });
      toast({
        title: "Goal Deleted",
        description: "Monthly goal has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
      console.error("Delete goal error:", error);
    },
  });

  // Calculate stats
  const goalStats = {
    total: currentGoals?.length || 0,
    completed: currentGoals?.filter(g => g.completed).length || 0,
    inProgress: currentGoals?.filter(g => !g.completed && g.current_progress > 0).length || 0,
    notStarted: currentGoals?.filter(g => g.current_progress === 0).length || 0,
    completionRate: currentGoals?.length ? Math.round((currentGoals.filter(g => g.completed).length / currentGoals.length) * 100) : 0,
  };

  return {
    currentGoals: currentGoals || [],
    goalHistory: goalHistory || [],
    goalStats,
    isLoading,
    createGoal,
    updateProgress,
    deleteGoal,
  };
};