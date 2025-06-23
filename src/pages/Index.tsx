import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ArrowRight, Users, TrendingUp, Gift, LogOut } from "lucide-react";
import { ResponsiveContainer } from "@/components/ResponsiveContainer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ActivityFeed } from "@/components/ActivityFeed";
import { RealtimeStatsCard } from "@/components/RealtimeStatsCard";

const Index = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
        <ResponsiveContainer maxWidth="2xl" className="py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-green-600 mr-4" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">RelationshipDebt AI</h1>
                <p className="text-xl text-green-600 mt-2">Building balanced connections with AI insights</p>
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track favors, build stronger relationships, and get AI-powered insights to maintain healthy social connections.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Track Relationships</h3>
                    <p className="text-gray-600">Keep track of favors given and received with friends, family, and colleagues.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                    <p className="text-gray-600">Get personalized recommendations to strengthen your relationships.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Gift className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Balance Tracker</h3>
                    <p className="text-gray-600">Maintain healthy give-and-take in all your relationships.</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => navigate("/auth")} 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader>
                <CardTitle className="text-center">Quick Preview</CardTitle>
                <CardDescription className="text-center">
                  See how RelationshipDebt AI helps you build better connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-sm text-gray-600">Active Relationships</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">8</div>
                    <div className="text-sm text-gray-600">Favors This Month</div>
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm font-medium text-orange-800">💡 AI Insight</div>
                  <div className="text-sm text-orange-700 mt-1">
                    Consider reaching out to Sarah - you haven't connected in 2 weeks!
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      <ResponsiveContainer maxWidth="2xl" className="py-6">
        {/* Header with Notification Center */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">RelationshipDebt AI</h1>
            <p className="text-green-600">Building balanced connections with AI insights</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationCenter />
            <Button
              variant="outline"
              onClick={signOut}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Real-time Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <RealtimeStatsCard
            title="Total Relationships"
            icon={<Users className="h-8 w-8" />}
            type="relationships"
          />
          <RealtimeStatsCard
            title="Favors Given"
            icon={<Gift className="h-8 w-8" />}
            type="favorsGiven"
          />
          <RealtimeStatsCard
            title="Favors Received"
            icon={<Heart className="h-8 w-8" />}
            type="favorsReceived"
          />
          <RealtimeStatsCard
            title="Weekly Activity"
            icon={<TrendingUp className="h-8 w-8" />}
            type="activity"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Features */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Relationship Manager
                </CardTitle>
                <CardDescription>
                  Manage your relationships and track favors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your relationship management tools will appear here once you start adding connections.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Enhanced Dashboard
                </CardTitle>
                <CardDescription>
                  AI-powered insights and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your personalized dashboard with AI insights will be displayed here.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity Feed */}
          <div className="space-y-6">
            <ActivityFeed />
            
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-orange-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Add New Relationship
                </Button>
                <Button variant="outline" className="w-full">
                  Record a Favor
                </Button>
                <Button variant="outline" className="w-full">
                  View AI Insights
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
};

export default Index;
