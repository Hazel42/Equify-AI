import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, Users, TrendingUp, Gift } from "lucide-react";
import { ResponsiveContainer } from "@/components/ResponsiveContainer";
import { useAuth } from "@/hooks/useAuth";
import { MobileLayout } from "@/components/MobileLayout";
import { MainNavigation } from "@/components/MainNavigation";
import { EnhancedOnboardingFlow } from "@/components/EnhancedOnboardingFlow";
import { RelationshipDetail } from "@/components/RelationshipDetail";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { relationshipId } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user needs onboarding
  const { data: profile } = useQuery({
    queryKey: ["profile-onboarding", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && isAuthenticated,
  });

  useEffect(() => {
    if (profile && !profile.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [profile]);

  // Listen for tab navigation events
  useEffect(() => {
    const handleTabNavigation = (event: CustomEvent) => {
      const { tab } = event.detail;
      if (tab) {
        setActiveTab(tab);
      }
    };

    window.addEventListener(
      "navigate-to-tab",
      handleTabNavigation as EventListener,
    );
    return () =>
      window.removeEventListener(
        "navigate-to-tab",
        handleTabNavigation as EventListener,
      );
  }, []);

  // Landing page untuk user yang belum login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
        <ResponsiveContainer maxWidth="lg" className="py-8 px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-10 w-10 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Equify
                </h1>
                <p className="text-lg text-green-600 mt-1">
                  Empowering relationships through equity and empathy
                </p>
              </div>
            </div>
            <p className="text-base text-gray-600 max-w-xl mx-auto">
              Track favors, build stronger relationships, and get AI-powered
              insights for healthy social connections.
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <div className="bg-green-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Track Relationships
                </h3>
                <p className="text-sm text-gray-600">
                  Keep track of favors with friends and family.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <div className="bg-blue-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Insights</h3>
                <p className="text-sm text-gray-600">
                  Get personalized relationship recommendations.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <div className="bg-orange-100 p-2 rounded-full">
                <Gift className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Balance Tracker</h3>
                <p className="text-sm text-gray-600">
                  Maintain healthy give-and-take relationships.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => navigate("/auth")}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 w-full md:w-auto"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <Card className="mt-8 bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="text-center text-lg">
                Quick Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">12</div>
                  <div className="text-xs text-gray-600">Relationships</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">8</div>
                  <div className="text-xs text-gray-600">This Month</div>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-sm font-medium text-orange-800">
                  💡 AI Insight
                </div>
                <div className="text-xs text-orange-700 mt-1">
                  Consider reaching out to Sarah - you haven't connected in 2
                  weeks!
                </div>
              </div>
            </CardContent>
          </Card>
        </ResponsiveContainer>
      </div>
    );
  }

  const getTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard";
      case "relationships":
        return "My People";
      case "ai-chat":
        return "Chat";
      case "analytics":
        return "Analytics";
      case "settings":
        return "Settings";
      default:
        return "Equify";
    }
  };

  // Show onboarding if needed
  if (showOnboarding) {
    return (
      <EnhancedOnboardingFlow
        onComplete={() => {
          setShowOnboarding(false);
          // Refresh profile data
          window.location.reload();
        }}
      />
    );
  }

  // If viewing a relationship detail, render it within mobile layout
  if (relationshipId) {
    return (
      <MobileLayout
        title="Relationship Details"
        activeTab="relationships"
        onTabChange={setActiveTab}
      >
        <RelationshipDetail />
      </MobileLayout>
    );
  }

  // Main app dengan mobile layout
  return (
    <MobileLayout
      title={getTitle()}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <MainNavigation userId={user?.id || ""} activeTab={activeTab} />
    </MobileLayout>
  );
};

export default Index;
