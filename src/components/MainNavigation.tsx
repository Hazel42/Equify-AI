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
        return <EnhancedDashboard />;
      case "relationships":
        return <EnhancedRelationshipManager />;
      case "ai-chat":
        return <EnhancedAIChat />;
      case "analytics":
        return <EnhancedAnalytics />;
      case "settings":
        return <EnhancedSettings />;
      default:
        return <EnhancedDashboard />;
    }
  };

  return <div className="w-full">{renderContent()}</div>;
};
