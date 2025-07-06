import { ReactNode } from "react";
import { MobileHeader } from "@/components/MobileHeader";
import { EnhancedMobileBottomNavigation } from "@/components/EnhancedMobileBottomNavigation";

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
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MobileHeader title={title} />

      <main className="flex-1 overflow-y-auto pb-24 safe-area-bottom">
        <div className="p-4">{children}</div>
      </main>

      <EnhancedMobileBottomNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    </div>
  );
};
