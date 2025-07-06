import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RealtimeStatsCard } from "@/components/RealtimeStatsCard";
import {
  Users,
  Heart,
  Gift,
  TrendingUp,
  Plus,
  MessageCircle,
  Calendar,
  Zap,
  Target,
  Award,
  Bell,
  Activity,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

interface DashboardStats {
  totalRelationships: number;
  favorsGiven: number;
  favorsReceived: number;
  balance: number;
  weeklyActivity: number;
  streakDays: number;
}

export const EnhancedDashboard = () => {
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", user?.id, selectedTimeframe],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get comprehensive stats
      const [relationships, favors, recentActivity] = await Promise.all([
        supabase.from("relationships").select("*").eq("user_id", user.id),
        supabase.from("favors").select("*").eq("user_id", user.id),
        supabase
          .from("activity_feed")
          .select("*")
          .eq("user_id", user.id)
          .limit(5),
      ]);

      const given =
        favors.data?.filter((f) => f.direction === "given").length || 0;
      const received =
        favors.data?.filter((f) => f.direction === "received").length || 0;

      return {
        totalRelationships: relationships.data?.length || 0,
        favorsGiven: given,
        favorsReceived: received,
        balance: given - received,
        weeklyActivity: recentActivity.data?.length || 0,
        streakDays: 7, // Calculate actual streak
        recentActivity: recentActivity.data || [],
      };
    },
    enabled: !!user?.id,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Good morning! 👋</h2>
            <p className="text-green-100 text-sm">
              You have {stats?.weeklyActivity || 0} activities this week
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats?.streakDays}🔥</div>
            <p className="text-xs text-green-100">Day streak</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">
                  Relationships
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {stats?.totalRelationships || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Progress
                value={Math.min((stats?.totalRelationships || 0) * 10, 100)}
                className="h-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">Balance</p>
                <p className="text-2xl font-bold text-green-700">
                  {stats?.balance > 0 ? "+" : ""}
                  {stats?.balance || 0}
                </p>
              </div>
              <Heart className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge
                variant={stats?.balance >= 0 ? "default" : "secondary"}
                className="text-xs"
              >
                {stats?.balance >= 0 ? "Positive" : "Negative"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-medium">Given</p>
                <p className="text-2xl font-bold text-orange-700">
                  {stats?.favorsGiven || 0}
                </p>
              </div>
              <Gift className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <Progress
                value={Math.min((stats?.favorsGiven || 0) * 5, 100)}
                className="h-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">Received</p>
                <p className="text-2xl font-bold text-purple-700">
                  {stats?.favorsReceived || 0}
                </p>
              </div>
              <Heart className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Progress
                value={Math.min((stats?.favorsReceived || 0) * 5, 100)}
                className="h-1"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white h-12">
              <Plus className="h-4 w-4 mr-2" />
              Add New Relationship
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12">
                <Gift className="h-4 w-4 mr-2" />
                Record Favor
              </Button>
              <Button variant="outline" className="h-12">
                <MessageCircle className="h-4 w-4 mr-2" />
                Ask AI
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Insights */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      💡 Relationship Tip
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Consider reaching out to Sarah - you haven't connected in
                      2 weeks!
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      🎯 Goal Progress
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      You're 3 favors away from your monthly goal!
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    75%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentActivity?.length ? (
                stats.recentActivity.map((activity: any, index: number) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-600">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No recent activity</p>
                  <p className="text-xs text-gray-400">
                    Start by adding a relationship or recording a favor!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
