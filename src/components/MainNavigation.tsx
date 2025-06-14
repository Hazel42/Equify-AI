
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Brain, BarChart3, Bell, Settings, Home } from "lucide-react";
import { RelationshipManager } from "./RelationshipManager";
import { SmartRecommendations } from "./SmartRecommendations";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { NotificationCenter } from "./NotificationCenter";
import { EnhancedDashboard } from "./EnhancedDashboard";
import { SettingsPage } from "./SettingsPage";

interface MainNavigationProps {
  userId: string;
  defaultTab?: string;
}

export const MainNavigation = ({ userId, defaultTab = "dashboard" }: MainNavigationProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-white/60 backdrop-blur-sm border border-green-100">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="relationships" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Relationships</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI Insights</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 relative">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
            <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
              3
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="dashboard" className="space-y-6">
            <EnhancedDashboard />
          </TabsContent>

          <TabsContent value="relationships">
            <RelationshipManager />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Insights</h2>
              <p className="text-gray-600">Smart recommendations and relationship analysis</p>
            </div>
            <SmartRecommendations 
              relationshipId="" 
              userId={userId} 
              relationshipName="All Relationships" 
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsPage />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
