import { EnhancedDashboard } from "@/components/EnhancedDashboard";
import { EnhancedRelationshipManager } from "@/components/EnhancedRelationshipManager";
import { EnhancedAIChat } from "@/components/EnhancedAIChat";
import { EnhancedAnalytics } from "@/components/EnhancedAnalytics";
import { EnhancedSettings } from "@/components/EnhancedSettings";

interface MainNavigationProps {
  userId: string;
  activeTab: string;
}

export const MainNavigation = ({ userId, activeTab }: MainNavigationProps) => {
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <EnhancedDashboard key="dashboard" />;
      case "relationships":
        return <EnhancedRelationshipManager key="relationships" />;
      case "ai-chat":
        return <EnhancedAIChat key="ai-chat" />;
      case "analytics":
        return <EnhancedAnalytics key="analytics" />;
      case "settings":
        return <EnhancedSettings key="settings" />;
      default:
        return <EnhancedDashboard key="dashboard" />;
    }
  };

  return (
    <div className="w-full" key={activeTab}>
      {renderContent()}
    </div>
  );
};
