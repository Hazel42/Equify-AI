
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Heart, Users, Brain, TrendingUp, LogOut, User } from "lucide-react";
import { AddFavorDialog } from "@/components/AddFavorDialog";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { MainNavigation } from "@/components/MainNavigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavors } from "@/hooks/useFavors";
import { useProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [showAddFavor, setShowAddFavor] = useState(false);
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { relationships, isLoading: relationshipsLoading } = useRelationships();
  const { favors, isLoading: favorsLoading } = useFavors();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch AI insights
  const { data: aiInsights = [] } = useQuery({
    queryKey: ['ai-insights', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Show onboarding if user hasn't completed it
  if (profile && !profile.onboarding_completed) {
    return <OnboardingFlow onComplete={() => window.location.reload()} />;
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
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
                <div className="text-sm">
                  <span className="text-gray-600">{profile?.full_name}</span>
                  {profile?.personality_type && (
                    <p className="text-xs text-green-600">{profile.personality_type}</p>
                  )}
                </div>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Navigation Tabs */}
        <MainNavigation userId={user?.id || ""} />
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
