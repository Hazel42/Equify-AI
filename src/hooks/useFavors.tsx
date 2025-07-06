
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Favor {
  id: string;
  description: string;
  category: string;
  direction: 'given' | 'received';
  estimated_value: number;
  date_occurred: string;
  relationship_id: string;
  user_id: string;
  created_at: string;
}

export const useFavors = () => {
  const [favors, setFavors] = useState<Favor[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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
      setFavors(data || []);
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

  useEffect(() => {
    fetchFavors();
  }, [user]);

  return {
    favors,
    loading,
    refetch: fetchFavors
  };
};
