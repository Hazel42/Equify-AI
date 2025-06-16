
import { Dashboard } from "@/components/EnhancedDashboard";
import { RelationshipManager } from "@/components/RelationshipManager";
import { SmartRecommendationEngine } from "@/components/SmartRecommendationEngine";
import { PerformanceAnalytics } from "@/components/PerformanceAnalytics";
import { SettingsPage } from "@/components/SettingsPage";
import { AIChatAssistant } from "@/components/AIChatAssistant";
import { EnhancedAIInsights } from "@/components/EnhancedAIInsights";
import { SmartAutomation } from "@/components/SmartAutomation";

interface MainNavigationProps {
  userId: string;
  activeTab: string;
}

export const MainNavigation = ({ userId, activeTab }: MainNavigationProps) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'relationships':
        return <RelationshipManager />;
      case 'recommendations':
        return <SmartRecommendationEngine />;
      case 'analytics':
        return <PerformanceAnalytics />;
      case 'ai-chat':
        return <AIChatAssistant />;
      case 'ai-insights':
        return <EnhancedAIInsights />;
      case 'automation':
        return <SmartAutomation />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
};
