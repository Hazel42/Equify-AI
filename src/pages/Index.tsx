
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Heart, Users, Brain, TrendingUp, LogOut, User } from "lucide-react";
import { AddFavorDialog } from "@/components/AddFavorDialog";
import { RelationshipCard } from "@/components/RelationshipCard";
import { InsightsPanel } from "@/components/InsightsPanel";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavors } from "@/hooks/useFavors";
import { useProfile } from "@/hooks/useProfile";

const Index = () => {
  const [showAddFavor, setShowAddFavor] = useState(false);
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { relationships, isLoading: relationshipsLoading } = useRelationships();
  const { favors, isLoading: favorsLoading } = useFavors();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleAddFavor = (favorData: any) => {
    toast({
      title: "Favor Added Successfully",
      description: `Added "${favorData.description}" to your relationship tracking.`,
    });
    setShowAddFavor(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You've been signed out of your account.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getBalanceColor = (score: number) => {
    if (score >= 7) return "text-green-600";
    if (score >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  // Show loading while checking auth
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-green-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const totalRelationships = relationships.length;
  const averageBalance = relationships.length > 0 ? 
    relationships.reduce((sum, rel) => sum + 7.5, 0) / totalRelationships : 0; // Placeholder calculation
  const healthyRelationships = relationships.filter(() => Math.random() > 0.3).length; // Placeholder

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
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowAddFavor(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Favor
              </Button>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">{profile?.full_name}</span>
              </div>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-lg text-gray-600">
            {relationships.length === 0 
              ? "Let's start building your relationship network. Add your first relationship below!" 
              : "Your relationships are looking healthy. Here's what's happening today."
            }
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
                {totalRelationships > 0 ? averageBalance.toFixed(1) : "0.0"}/10
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
                {relationshipsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading relationships...</p>
                  </div>
                ) : relationships.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No relationships yet</h3>
                    <p className="text-gray-500 mb-4">Start by adding your first relationship to track reciprocity.</p>
                  </div>
                ) : (
                  relationships.map((relationship) => (
                    <RelationshipCard 
                      key={relationship.id} 
                      relationship={{
                        id: parseInt(relationship.id),
                        name: relationship.name,
                        type: relationship.relationship_type,
                        balanceScore: 7.5, // Will be calculated dynamically later
                        recentActivity: "Recent activity placeholder",
                        lastInteraction: "Recent",
                        importance: relationship.importance_level
                      }}
                    />
                  ))
                )}
                
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
