
import { ReactNode } from "react";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileLayout = ({ children, title, activeTab, onTabChange }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MobileHeader title={title} />
      
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          {children}
        </div>
      </main>
      
      <MobileBottomNavigation 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
      />
    </div>
  );
};
