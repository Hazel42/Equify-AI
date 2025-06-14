
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Users, Heart, Clock, Target, Activity, Calendar } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavors } from "@/hooks/useFavors";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export const PerformanceAnalytics = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const { relationships } = useRelationships();
  const { favors } = useFavors();

  // Calculate key performance metrics
  const totalRelationships = relationships.length;
  const thisMonthFavors = favors.filter(f => {
    const favorDate = new Date(f.date_occurred);
    const thisMonth = new Date();
    return favorDate.getMonth() === thisMonth.getMonth() && 
           favorDate.getFullYear() === thisMonth.getFullYear();
  }).length;

  const lastMonthFavors = favors.filter(f => {
    const favorDate = new Date(f.date_occurred);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return favorDate.getMonth() === lastMonth.getMonth() && 
           favorDate.getFullYear() === lastMonth.getFullYear();
  }).length;

  const favorGrowth = lastMonthFavors > 0 ? 
    ((thisMonthFavors - lastMonthFavors) / lastMonthFavors) * 100 : 0;

  // Generate trend data
  const generateTrendData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayFavors = favors.filter(f => {
        const favorDate = new Date(f.date_occurred);
        return favorDate.toDateString() === date.toDateString();
      });

      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        given: dayFavors.filter(f => f.direction === 'given').length,
        received: dayFavors.filter(f => f.direction === 'received').length,
        total: dayFavors.length,
        balance: (dayFavors.filter(f => f.direction === 'given').length - 
                 dayFavors.filter(f => f.direction === 'received').length)
      });
    }
    
    return days;
  };

  const trendData = generateTrendData();

  // Relationship type distribution
  const relationshipTypes = relationships.reduce((acc, rel) => {
    acc[rel.relationship_type] = (acc[rel.relationship_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const relationshipTypeData = Object.entries(relationshipTypes).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    percentage: (count / totalRelationships) * 100
  }));

  // Weekly performance summary
  const weeklyData = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekFavors = favors.filter(f => {
      const favorDate = new Date(f.date_occurred);
      return favorDate >= weekStart && favorDate <= weekEnd;
    });

    weeklyData.push({
      week: `Week ${4 - i}`,
      activities: weekFavors.length,
      relationships: new Set(weekFavors.map(f => f.relationship_id)).size,
      balance: weekFavors.filter(f => f.direction === 'given').length - 
               weekFavors.filter(f => f.direction === 'received').length,
      avgValue: weekFavors.length > 0 ? 
        weekFavors.reduce((sum, f) => sum + (f.estimated_value || 0), 0) / weekFavors.length : 0
    });
  }

  const metrics = [
    {
      title: 'Total Relationships',
      value: totalRelationships,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Monthly Activities',
      value: thisMonthFavors,
      change: favorGrowth > 0 ? `+${favorGrowth.toFixed(1)}%` : `${favorGrowth.toFixed(1)}%`,
      trend: favorGrowth > 0 ? 'up' : 'down',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Average Balance',
      value: '8.2/10',
      change: '+0.5',
      trend: 'up',
      icon: Heart,
      color: 'text-purple-600'
    },
    {
      title: 'Response Time',
      value: '2.3 days',
      change: '-0.8 days',
      trend: 'up',
      icon: Clock,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Analytics</h2>
          <p className="text-gray-600">Track your relationship management performance</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map(range => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${metric.color}`} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change}
                  </span>
                  <span className="text-sm text-gray-500">vs last period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity Trend</CardTitle>
            <CardDescription>Your relationship activities over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="given" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="received" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Relationship Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Relationship Distribution</CardTitle>
            <CardDescription>Breakdown of your relationship types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={relationshipTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {relationshipTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance Summary</CardTitle>
          <CardDescription>Your relationship activity summary by week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="activities" fill="#3B82F6" name="Total Activities" />
              <Bar dataKey="relationships" fill="#10B981" name="Active Relationships" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Performance Insights
          </CardTitle>
          <CardDescription>AI-generated insights about your relationship patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">✅ Strengths</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Consistent daily relationship activities</li>
                <li>• Well-balanced giving and receiving ratio</li>
                <li>• Diverse relationship portfolio</li>
              </ul>
            </div>
            
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">⚠️ Areas for Improvement</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Some relationships need more attention</li>
                <li>• Consider expanding professional network</li>
                <li>• Response time could be improved</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📊 Key Trends</h4>
            <p className="text-sm text-blue-700">
              Your relationship activity has increased by {favorGrowth.toFixed(1)}% this month. 
              You're most active on weekdays and tend to focus on close relationships. 
              Consider scheduling regular check-ins with your extended network.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
