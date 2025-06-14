
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Users, Heart, Calendar, Gift } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavors } from "@/hooks/useFavors";

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

export const AnalyticsDashboard = () => {
  const { relationships } = useRelationships();
  const { favors } = useFavors();

  // Calculate analytics data
  const relationshipTypeData = relationships.reduce((acc: any[], rel) => {
    const existing = acc.find(item => item.type === rel.relationship_type);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ type: rel.relationship_type, count: 1 });
    }
    return acc;
  }, []);

  const favorsByCategory = favors.reduce((acc: any[], favor) => {
    const existing = acc.find(item => item.category === favor.category);
    if (existing) {
      existing.given += favor.direction === 'given' ? 1 : 0;
      existing.received += favor.direction === 'received' ? 1 : 0;
    } else {
      acc.push({
        category: favor.category,
        given: favor.direction === 'given' ? 1 : 0,
        received: favor.direction === 'received' ? 1 : 0
      });
    }
    return acc;
  }, []);

  // Monthly activity data (mock for demo)
  const monthlyActivity = [
    { month: 'Jan', favorsGiven: 12, favorsReceived: 8 },
    { month: 'Feb', favorsGiven: 19, favorsReceived: 15 },
    { month: 'Mar', favorsGiven: 15, favorsReceived: 12 },
    { month: 'Apr', favorsGiven: 22, favorsReceived: 18 },
    { month: 'May', favorsGiven: 25, favorsReceived: 20 },
    { month: 'Jun', favorsGiven: 30, favorsReceived: 25 }
  ];

  const totalFavorsGiven = favors.filter(f => f.direction === 'given').length;
  const totalFavorsReceived = favors.filter(f => f.direction === 'received').length;
  const balanceRatio = totalFavorsReceived > 0 ? (totalFavorsGiven / totalFavorsReceived).toFixed(2) : 'N/A';
  const averageEmotionalWeight = favors.length > 0 ? 
    (favors.reduce((sum, f) => sum + f.emotional_weight, 0) / favors.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Relationship Analytics</h2>
        <p className="text-gray-600">Insights into your relationship patterns and reciprocity trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Relationships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{relationships.length}</div>
            <Badge className="mt-2 bg-green-100 text-green-700">
              Active Network
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Balance Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{balanceRatio}</div>
            <p className="text-xs text-gray-500 mt-1">Given / Received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Avg Emotional Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{averageEmotionalWeight}/5</div>
            <Badge className="mt-2 bg-blue-100 text-blue-700">
              Emotional Impact
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{favors.length}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+12% vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Relationship Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Relationship Types</CardTitle>
            <CardDescription>Distribution of your relationships by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={relationshipTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
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

        {/* Favors by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Favors by Category</CardTitle>
            <CardDescription>Given vs received favors across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={favorsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="given" fill="#10B981" name="Given" />
                <Bar dataKey="received" fill="#3B82F6" name="Received" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Activity Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Activity Trend</CardTitle>
            <CardDescription>Your favor-giving and receiving patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="favorsGiven" stroke="#10B981" strokeWidth={2} name="Favors Given" />
                <Line type="monotone" dataKey="favorsReceived" stroke="#3B82F6" strokeWidth={2} name="Favors Received" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>AI-powered observations about your relationship patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <h4 className="font-medium text-green-900">Positive Trend</h4>
              <p className="text-sm text-green-700">You've been more active in giving favors this month. This shows great relationship investment!</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Heart className="h-5 w-5 text-yellow-600 mt-1" />
            <div>
              <h4 className="font-medium text-yellow-900">Balance Opportunity</h4>
              <p className="text-sm text-yellow-700">Consider reaching out to family members - they might appreciate more regular connection.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Users className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-medium text-blue-900">Network Growth</h4>
              <p className="text-sm text-blue-700">Your professional network could benefit from more reciprocal interactions. Try scheduling coffee meetings!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
