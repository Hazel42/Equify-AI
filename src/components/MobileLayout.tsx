import { ReactNode, useState } from "react";
import { EnhancedMobileHeader } from "@/components/EnhancedMobileHeader";
import { EnhancedMobileBottomNavigation } from "@/components/EnhancedMobileBottomNavigation";
import { GlobalSearch } from "@/components/GlobalSearch";

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const MobileLayout = ({
  children,
  title,
  activeTab,
  onTabChange,
  showBackButton = false,
  onBackClick,
}: MobileLayoutProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const shouldShowSearchButton =
    activeTab === "relationships" || activeTab === "dashboard";

  const handleSearchNavigate = (tab: string, data?: any) => {
    onTabChange(tab);
    // Could handle additional navigation data here
  };

  const handleQuickAction = (action: string) => {
    // Dispatch custom events for quick actions
    window.dispatchEvent(
      new CustomEvent("quick-action", {
        detail: { action, activeTab },
      }),
    );
  };

  return (
    <div className="h-screen bg-gray-50 relative overflow-hidden">
      {/* Fixed Header */}
      <div className="absolute top-0 left-0 right-0 z-40">
        <EnhancedMobileHeader
          title={title}
          showSearch={shouldShowSearchButton}
          onSearchClick={() => setShowSearch(true)}
          showBackButton={showBackButton}
          onBackClick={onBackClick}
        />
      </div>

      {/* Scrollable Main Content - Positioned between header and bottom nav */}
      <main
        className="absolute inset-0 overflow-y-auto content-scroll"
        style={{
          top: "60px", // Header height
          bottom: "max(80px, calc(env(safe-area-inset-bottom) + 80px))", // Navigation height + safe area
          paddingBottom: "0px",
        }}
      >
        <div className="p-4">{children}</div>
      </main>

      {/* Fixed Bottom Navigation */}
      <div 
        className="absolute left-0 right-0 z-50"
        style={{
          bottom: "0px",
        }}
      >
        <EnhancedMobileBottomNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          onQuickAction={handleQuickAction}
        />
      </div>

      {/* Search Modal */}
      <GlobalSearch
        open={showSearch}
        onOpenChange={setShowSearch}
        onNavigate={handleSearchNavigate}
      />
    </div>
  );
};
