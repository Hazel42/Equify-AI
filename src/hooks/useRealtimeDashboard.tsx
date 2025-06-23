
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalRelationships: number;
  favorsGiven: number;
  favorsReceived: number;
  recentActivity: number;
  weeklyGrowth: number;
}

export const useRealtimeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRelationships: 0,
    favorsGiven: 0,
    favorsReceived: 0,
    recentActivity: 0,
    weeklyGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Fetch relationships count
      const { count: relationshipsCount } = await supabase
        .from('relationships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch favors given
      const { count: favorsGivenCount } = await supabase
        .from('favors')
        .select('*', { count: 'exact', head: true })
        .eq('from_user_id', user.id);

      // Fetch favors received
      const { count: favorsReceivedCount } = await supabase
        .from('favors')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', user.id);

      // Fetch recent activity (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: recentActivityCount } = await supabase
        .from('activity_feed')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString());

      // Calculate weekly growth (compare with previous week)
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      
      const { count: previousWeekActivity } = await supabase
        .from('activity_feed')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', weekAgo.toISOString());

      const weeklyGrowth = previousWeekActivity 
        ? ((recentActivityCount || 0) - previousWeekActivity) / previousWeekActivity * 100
        : recentActivityCount || 0 > 0 ? 100 : 0;

      setStats({
        totalRelationships: relationshipsCount || 0,
        favorsGiven: favorsGivenCount || 0,
        favorsReceived: favorsReceivedCount || 0,
        recentActivity: recentActivityCount || 0,
        weeklyGrowth: Math.round(weeklyGrowth),
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchStats();

    // Setup real-time subscriptions for live updates
    const relationshipsChannel = supabase
      .channel('relationships_stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'relationships',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchStats()
      )
      .subscribe();

    const favorsChannel = supabase
      .channel('favors_stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favors',
        },
        (payload) => {
          // Only update if the favor involves this user
          if (payload.new?.from_user_id === user.id || payload.new?.to_user_id === user.id) {
            fetchStats();
          }
        }
      )
      .subscribe();

    const activityChannel = supabase
      .channel('activity_stats')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(relationshipsChannel);
      supabase.removeChannel(favorsChannel);
      supabase.removeChannel(activityChannel);
    };
  }, [user]);

  return { stats, loading, refetch: fetchStats };
};
