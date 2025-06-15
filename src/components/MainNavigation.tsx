
import { RelationshipManager } from "./RelationshipManager";
import { EnhancedDashboard } from "./EnhancedDashboard";
import { SmartRecommendationEngine } from "./SmartRecommendationEngine";

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
      case "recommendations":
        return <SmartRecommendationEngine />;
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
