
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Heart, Users, Brain, TrendingUp } from "lucide-react";
import { AddFavorDialog } from "@/components/AddFavorDialog";
import { RelationshipCard } from "@/components/RelationshipCard";
import { InsightsPanel } from "@/components/InsightsPanel";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [showAddFavor, setShowAddFavor] = useState(false);
  const [relationships, setRelationships] = useState([
    {
      id: 1,
      name: "Sarah Chen",
      type: "friend",
      balanceScore: 7.5,
      recentActivity: "Bought you coffee last week",
      lastInteraction: "3 days ago",
      importance: 4
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      type: "colleague",
      balanceScore: 4.2,
      recentActivity: "Helped with project presentation",
      lastInteraction: "1 week ago",
      importance: 3
    },
    {
      id: 3,
      name: "Mom",
      type: "family",
      balanceScore: 9.1,
      recentActivity: "Sent care package",
      lastInteraction: "2 days ago",
      importance: 5
    }
  ]);

  const { toast } = useToast();

  const handleAddFavor = (favorData: any) => {
    toast({
      title: "Favor Added Successfully",
      description: `Added "${favorData.description}" to your relationship tracking.`,
    });
    setShowAddFavor(false);
  };

  const getBalanceColor = (score: number) => {
    if (score >= 7) return "text-green-600";
    if (score >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const totalRelationships = relationships.length;
  const averageBalance = relationships.reduce((sum, rel) => sum + rel.balanceScore, 0) / totalRelationships;
  const healthyRelationships = relationships.filter(rel => rel.balanceScore >= 7).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RelationshipDebt AI</h1>
                <p className="text-sm text-green-600">Building balanced, meaningful connections</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddFavor(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Favor
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h2>
          <p className="text-lg text-gray-600">
            Your relationships are looking healthy. Here's what's happening today.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Relationships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalRelationships}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Average Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getBalanceColor(averageBalance)}`}>
                {averageBalance.toFixed(1)}/10
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Healthy Relationships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {healthyRelationships}/{totalRelationships}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                3 New
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Relationships Overview */}
          <div className="lg:col-span-2">
            <Card className="bg-white/60 backdrop-blur-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Your Relationships</CardTitle>
                <CardDescription>
                  Manage your relationship reciprocity and build stronger connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {relationships.map((relationship) => (
                  <RelationshipCard 
                    key={relationship.id} 
                    relationship={relationship}
                  />
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full border-dashed border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Relationship
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Panel */}
          <div className="lg:col-span-1">
            <InsightsPanel />
          </div>
        </div>
      </div>

      {/* Add Favor Dialog */}
      <AddFavorDialog 
        open={showAddFavor}
        onOpenChange={setShowAddFavor}
        onSave={handleAddFavor}
      />
    </div>
  );
};

export default Index;
