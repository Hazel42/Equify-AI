import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  Gift,
  Heart,
  Calendar,
  Target,
  Award,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];

export const EnhancedAnalytics = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState("month");

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["analytics", user?.id, timeframe],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get comprehensive analytics data
      const [relationships, favors, insights, profile] = await Promise.all([
        supabase.from("relationships").select("*").eq("user_id", user.id),
        supabase.from("favors").select("*").eq("user_id", user.id),
        supabase.from("ai_insights").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);

      // Process data for analytics
      const relationshipTypes =
        relationships.data?.reduce((acc: any, rel) => {
          acc[rel.relationship_type] = (acc[rel.relationship_type] || 0) + 1;
          return acc;
        }, {}) || {};

      const favorsByMonth =
        favors.data?.reduce((acc: any, favor) => {
          const month = new Date(favor.created_at).toISOString().slice(0, 7);
          if (!acc[month]) acc[month] = { given: 0, received: 0 };
          acc[month][favor.direction]++;
          return acc;
        }, {}) || {};

      const recentActivity = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().slice(0, 10);

        const dayFavors =
          favors.data?.filter((f) => f.created_at.slice(0, 10) === dateStr) ||
          [];

        return {
          date: dateStr,
          favors: dayFavors.length,
          given: dayFavors.filter((f) => f.direction === "given").length,
          received: dayFavors.filter((f) => f.direction === "received").length,
        };
      }).reverse();

      return {
        totalRelationships: relationships.data?.length || 0,
        totalFavors: favors.data?.length || 0,
        favorBalance:
          (favors.data?.filter((f) => f.direction === "given").length || 0) -
          (favors.data?.filter((f) => f.direction === "received").length || 0),
        relationshipTypes,
        favorsByMonth,
        recentActivity,
        insights: insights.data || [],
        personalityType: profile.data?.personality_type,
        reciprocityStyle: profile.data?.reciprocity_style,
      };
    },
    enabled: !!user?.id,
  });

  const relationshipTypesData = analyticsData?.relationshipTypes
    ? Object.entries(analyticsData.relationshipTypes).map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: count,
        color:
          COLORS[
            Object.keys(analyticsData.relationshipTypes).indexOf(type) %
              COLORS.length
          ],
      }))
    : [];

  const monthlyData = analyticsData?.favorsByMonth
    ? Object.entries(analyticsData.favorsByMonth).map(
        ([month, data]: [string, any]) => ({
          month: new Date(month + "-01").toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          given: data.given,
          received: data.received,
          balance: data.given - data.received,
        }),
      )
    : [];

  const PersonalityInsight = () => {
    const getPersonalityDescription = (type: string) => {
      const descriptions = {
        activist:
          "You're proactive and immediate in helping others. You like quick reciprocity.",
        strategist:
          "You think long-term about relationships and prefer thoughtful balance.",
        harmonizer:
          "You're responsive and flexible, adapting to others' needs.",
        balanced: "You have a well-rounded approach to relationships.",
      };
      return (
        descriptions[type as keyof typeof descriptions] ||
        "Your unique relationship style."
      );
    };

    const getReciprocityDescription = (style: string) => {
      const descriptions = {
        immediate_reciprocator:
          "You prefer immediate exchange of favors and quick balance.",
        flexible_giver:
          "You're comfortable with flexible timing and various forms of help.",
        long_term_balancer:
          "You think about relationship balance over extended periods.",
      };
      return (
        descriptions[style as keyof typeof descriptions] ||
        "Your unique reciprocity approach."
      );
    };

    return (
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Your Relationship Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analyticsData?.personalityType && (
            <div>
              <Badge
                variant="secondary"
                className="mb-2 bg-purple-100 text-purple-800"
              >
                {analyticsData.personalityType.charAt(0).toUpperCase() +
                  analyticsData.personalityType.slice(1)}
              </Badge>
              <p className="text-sm text-gray-600">
                {getPersonalityDescription(analyticsData.personalityType)}
              </p>
            </div>
          )}

          {analyticsData?.reciprocityStyle && (
            <div>
              <Badge
                variant="secondary"
                className="mb-2 bg-blue-100 text-blue-800"
              >
                {analyticsData.reciprocityStyle
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
              <p className="text-sm text-gray-600">
                {getReciprocityDescription(analyticsData.reciprocityStyle)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-600">
            Insights into your relationships
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">
                    Relationships
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {analyticsData?.totalRelationships || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium">
                    Total Favors
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {analyticsData?.totalFavors || 0}
                  </p>
                </div>
                <Gift className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            className={`bg-gradient-to-r ${
              (analyticsData?.favorBalance || 0) >= 0
                ? "from-emerald-50 to-emerald-100 border-emerald-200"
                : "from-red-50 to-red-100 border-red-200"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Balance</p>
                  <p className="text-2xl font-bold">
                    {analyticsData?.favorBalance > 0 ? "+" : ""}
                    {analyticsData?.favorBalance || 0}
                  </p>
                </div>
                <Heart className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 font-medium">
                    AI Insights
                  </p>
                  <p className="text-2xl font-bold text-purple-700">
                    {analyticsData?.insights?.length || 0}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Personality Insight */}
      <PersonalityInsight />

      {/* Charts */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Activity Trends</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="balance">Balance Over Time</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Daily Activity (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analyticsData?.recentActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) =>
                      new Date(date).toLocaleDateString()
                    }
                    formatter={(value, name) => [
                      value,
                      name === "favors" ? "Total Favors" : name,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="favors"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Relationship Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={relationshipTypesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {relationshipTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Balance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="given" fill="#10B981" name="Given" />
                  <Bar dataKey="received" fill="#3B82F6" name="Received" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Goals and Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Monthly Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Relationship Interactions</span>
              <span>8/10</span>
            </div>
            <Progress value={80} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>New Connections</span>
              <span>2/3</span>
            </div>
            <Progress value={67} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Balance Maintenance</span>
              <span>Good</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
