
import { SimpleDashboard } from "@/components/SimpleDashboard";
import { RelationshipManager } from "@/components/RelationshipManager";
import { SmartRecommendationEngine } from "@/components/SmartRecommendationEngine";
import { PerformanceAnalytics } from "@/components/PerformanceAnalytics";
import { SettingsPage } from "@/components/SettingsPage";
import { AIChatAssistant } from "@/components/AIChatAssistant";

interface MainNavigationProps {
  userId: string;
  activeTab: string;
}

export const MainNavigation = ({ userId, activeTab }: MainNavigationProps) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SimpleDashboard />;
      case 'relationships':
        return <RelationshipManager />;
      case 'ai-chat':
        return <AIChatAssistant />;
      case 'analytics':
        return <PerformanceAnalytics />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <SimpleDashboard />;
    }
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
};
