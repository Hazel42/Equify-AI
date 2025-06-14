
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RelationshipManager } from "./RelationshipManager";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { EnhancedDashboard } from "./EnhancedDashboard";
import { SettingsPage } from "./SettingsPage";
import { ExportImportManager } from "./ExportImportManager";
import { SmartRecommendationEngine } from "./SmartRecommendationEngine";
import { GamificationPanel } from "./GamificationPanel";
import { PerformanceAnalytics } from "./PerformanceAnalytics";
import { NotificationSystem } from "./NotificationSystem";
import { HelpSystem } from "./HelpSystem";
import { AdvancedSettingsPanel } from "./AdvancedSettingsPanel";
import { 
  Users, 
  BarChart3, 
  Settings, 
  Brain, 
  Trophy,
  TrendingUp,
  Download,
  Home,
  Lightbulb,
  HelpCircle,
  Sliders
} from "lucide-react";

interface MainNavigationProps {
  userId: string;
}

export const MainNavigation = ({ userId }: MainNavigationProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-11 lg:w-auto lg:grid-cols-11">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="relationships" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Relationships</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Performance</span>
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">AI Insights</span>
              </TabsTrigger>
              <TabsTrigger value="smart-recommendations" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Smart Tips</span>
              </TabsTrigger>
              <TabsTrigger value="gamification" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Achievements</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Data</span>
              </TabsTrigger>
              <TabsTrigger value="help" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Help</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                <span className="hidden sm:inline">Advanced</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="ml-4">
              <NotificationSystem />
            </div>
          </div>

          <div className="mt-6">
            <TabsContent value="dashboard" className="space-y-6">
              <EnhancedDashboard />
            </TabsContent>

            <TabsContent value="relationships" className="space-y-6">
              <RelationshipManager />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <PerformanceAnalytics />
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <SmartRecommendationEngine />
            </TabsContent>

            <TabsContent value="smart-recommendations" className="space-y-6">
              <SmartRecommendationEngine />
            </TabsContent>

            <TabsContent value="gamification" className="space-y-6">
              <GamificationPanel />
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <ExportImportManager />
            </TabsContent>

            <TabsContent value="help" className="space-y-6">
              <HelpSystem />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <AdvancedSettingsPanel />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <SettingsPage />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
