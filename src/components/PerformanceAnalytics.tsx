
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Users, Heart, Gift, Calendar } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavors } from "@/hooks/useFavors";

export const PerformanceAnalytics = () => {
  const { relationships } = useRelationships();
  const { favors } = useFavors();

  const stats = {
    totalRelationships: relationships.length,
    favorsGiven: favors.filter(f => f.direction === 'given').length,
    favorsReceived: favors.filter(f => f.direction === 'received').length,
    balance: favors.filter(f => f.direction === 'given').length - favors.filter(f => f.direction === 'received').length,
    thisMonthActivity: favors.filter(f => {
      const favorDate = new Date(f.date_occurred);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      return favorDate >= thisMonth;
    }).length
  };

  const balanceScore = stats.totalRelationships > 0 ? 
    Math.max(0, Math.min(100, 50 + (stats.balance * 10))) : 50;

  const relationshipTypes = relationships.reduce((acc, rel) => {
    acc[rel.relationship_type] = (acc[rel.relationship_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Performance Analytics
        </h2>
        <p className="text-gray-600">Track your relationship management performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relationships</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRelationships}</div>
            <p className="text-xs text-muted-foreground">Total connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Given</CardTitle>
            <Gift className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favorsGiven}</div>
            <p className="text-xs text-muted-foreground">Favors given</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
            <Heart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favorsReceived}</div>
            <p className="text-xs text-muted-foreground">Favors received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthActivity}</div>
            <p className="text-xs text-muted-foreground">Activities</p>
          </CardContent>
        </Card>
      </div>

      {/* Balance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Relationship Balance Score
          </CardTitle>
          <CardDescription>
            Your overall balance between giving and receiving
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Balance Score</span>
              <span>{balanceScore.toFixed(0)}/100</span>
            </div>
            <Progress value={balanceScore} className="h-3" />
            <p className="text-xs text-gray-600">
              {stats.balance > 0 
                ? `You give ${stats.balance} more favors than you receive` 
                : stats.balance < 0 
                ? `You receive ${Math.abs(stats.balance)} more favors than you give`
                : 'Perfect balance between giving and receiving'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Relationship Types Breakdown */}
      {Object.keys(relationshipTypes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Relationship Types</CardTitle>
            <CardDescription>Breakdown of your relationship network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(relationshipTypes).map(([type, count]) => (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                    <span>{count}</span>
                  </div>
                  <Progress 
                    value={(count / stats.totalRelationships) * 100} 
                    className="h-2" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.totalRelationships === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 py-8">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-semibold">No data to analyze</p>
              <p className="text-sm">Add some relationships and record favors to see analytics.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
