
import { RelationshipManager } from "./RelationshipManager";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { EnhancedDashboard } from "./EnhancedDashboard";
import { SettingsPage } from "./SettingsPage";
import { ExportImportManager } from "./ExportImportManager";
import { SmartRecommendationEngine } from "./SmartRecommendationEngine";
import { GamificationPanel } from "./GamificationPanel";
import { PerformanceAnalytics } from "./PerformanceAnalytics";
import { HelpSystem } from "./HelpSystem";
import { AdvancedSettingsPanel } from "./AdvancedSettingsPanel";

interface MainNavigationProps {
  userId: string;
  activeTab: string;
}

export const MainNavigation = ({ userId, activeTab }: MainNavigationProps) => {
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <EnhancedDashboard />;
      case "relationships":
        return <RelationshipManager />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "performance":
        return <PerformanceAnalytics />;
      case "recommendations":
        return <SmartRecommendationEngine />;
      case "smart-recommendations":
        return <SmartRecommendationEngine />;
      case "gamification":
        return <GamificationPanel />;
      case "data":
        return <ExportImportManager />;
      case "help":
        return <HelpSystem />;
      case "advanced":
        return <AdvancedSettingsPanel />;
      case "settings":
        return <SettingsPage />;
      default:
        return <EnhancedDashboard />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {renderContent()}
    </div>
  );
};
