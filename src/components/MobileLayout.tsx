import { ReactNode, useState } from "react";
import { EnhancedMobileHeader } from "@/components/EnhancedMobileHeader";
import { EnhancedMobileBottomNavigation } from "@/components/EnhancedMobileBottomNavigation";
import { GlobalSearch } from "@/components/GlobalSearch";

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileLayout = ({
  children,
  title,
  activeTab,
  onTabChange,
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedMobileHeader
        title={title}
        showSearch={shouldShowSearchButton}
        onSearchClick={() => setShowSearch(true)}
      />

      <main className="flex-1 overflow-y-auto pb-24 safe-area-bottom">
        <div className="p-4">{children}</div>
      </main>

      <EnhancedMobileBottomNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        onQuickAction={handleQuickAction}
      />

      <GlobalSearch
        open={showSearch}
        onOpenChange={setShowSearch}
        onNavigate={handleSearchNavigate}
      />
    </div>
  );
};
