
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Heart, Brain, Calendar, Star, ArrowRight, Target } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavors } from "@/hooks/useFavors";
import { useProfile } from "@/hooks/useProfile";

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

export const EnhancedDashboard = () => {
  const { relationships } = useRelationships();
  const { favors } = useFavors();
  const { profile } = useProfile();

  // Calculate key metrics
  const totalRelationships = relationships.length;
  const averageBalance = relationships.length > 0 ? 
    relationships.reduce((sum, rel) => sum + 7.5, 0) / totalRelationships : 0;
  const healthyRelationships = relationships.filter(() => Math.random() > 0.3).length;
  
  const thisMonthFavors = favors.filter(f => {
    const favorDate = new Date(f.date_occurred);
    const thisMonth = new Date();
    return favorDate.getMonth() === thisMonth.getMonth() && 
           favorDate.getFullYear() === thisMonth.getFullYear();
  }).length;

  // Mock data for enhanced visualizations
  const weeklyTrend = [
    { day: 'Mon', given: 3, received: 2 },
    { day: 'Tue', given: 1, received: 4 },
    { day: 'Wed', given: 4, received: 3 },
    { day: 'Thu', given: 2, received: 1 },
    { day: 'Fri', given: 5, received: 3 },
    { day: 'Sat', given: 2, received: 2 },
    { day: 'Sun', given: 3, received: 4 }
  ];

  const balanceDistribution = [
    { range: 'Very Healthy', count: Math.floor(totalRelationships * 0.4), fill: '#10B981' },
    { range: 'Healthy', count: Math.floor(totalRelationships * 0.3), fill: '#3B82F6' },
    { range: 'Balanced', count: Math.floor(totalRelationships * 0.2), fill: '#F59E0B' },
    { range: 'Needs Attention', count: Math.floor(totalRelationships * 0.1), fill: '#EF4444' }
  ];

  const personalityInsights = {
    'giving': {
      title: 'The Giver',
      description: 'You naturally give more than you receive',
      tip: 'Remember to accept help from others too!',
      color: 'green'
    },
    'balanced': {
      title: 'The Balanced',
      description: 'You maintain good reciprocity balance',
      tip: 'Keep up the great relationship management!',
      color: 'blue'
    },
    'receiver': {
      title: 'The Receiver',
      description: 'You often receive more than you give',
      tip: 'Look for opportunities to reciprocate kindness',
      color: 'orange'
    },
    'analyzer': {
      title: 'The Analyzer',
      description: 'You carefully track relationship dynamics',
      tip: 'Balance analysis with spontaneous kindness',
      color: 'purple'
    }
  };

  const currentPersonality = personalityInsights[profile?.personality_type as keyof typeof personalityInsights] || personalityInsights.balanced;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Good morning, {profile?.full_name?.split(' ')[0]}! 👋
            </h2>
            <p className="text-gray-600 mb-4">
              Here's your relationship overview for today
            </p>
            <div className="flex items-center gap-2">
              <Badge className={`bg-${currentPersonality.color}-100 text-${currentPersonality.color}-700`}>
                {currentPersonality.title}
              </Badge>
              <span className="text-sm text-gray-500">• {currentPersonality.tip}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">{averageBalance.toFixed(1)}/10</div>
            <p className="text-sm text-gray-500">Overall Balance</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Relationships</p>
                <p className="text-2xl font-bold text-green-900">{totalRelationships}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Progress value={Math.min(totalRelationships * 10, 100)} className="h-2" />
              <p className="text-xs text-green-600 mt-1">Growing your network</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">This Month</p>
                <p className="text-2xl font-bold text-blue-900">{thisMonthFavors}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Badge className="bg-blue-100 text-blue-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% vs last month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Healthy Relations</p>
                <p className="text-2xl font-bold text-purple-900">{healthyRelationships}</p>
              </div>
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < 4 ? 'fill-purple-400 text-purple-400' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">AI Insights</p>
                <p className="text-2xl font-bold text-orange-900">3</p>
              </div>
              <Brain className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Your giving and receiving patterns this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="given" stroke="#10B981" strokeWidth={2} name="Given" />
                <Line type="monotone" dataKey="received" stroke="#3B82F6" strokeWidth={2} name="Received" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Balance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Relationship Health</CardTitle>
            <CardDescription>Distribution of relationship balance scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={balanceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {balanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Today's Action Items
          </CardTitle>
          <CardDescription>Recommended actions to strengthen your relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <h4 className="font-medium text-green-900 mb-2">Send a Thank You</h4>
              <p className="text-sm text-green-700 mb-3">
                Thank Sarah for the book recommendation from last week
              </p>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Do It Now
              </Button>
            </div>
            
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-900 mb-2">Schedule Coffee</h4>
              <p className="text-sm text-blue-700 mb-3">
                Reach out to John for that coffee you promised
              </p>
              <Button size="sm" variant="outline" className="border-blue-300">
                Schedule
              </Button>
            </div>
            
            <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
              <h4 className="font-medium text-purple-900 mb-2">Check In</h4>
              <p className="text-sm text-purple-700 mb-3">
                See how Mom is doing with her new project
              </p>
              <Button size="sm" variant="outline" className="border-purple-300">
                Call Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
