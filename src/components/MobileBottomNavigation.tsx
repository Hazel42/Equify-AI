
import { useState } from "react";
import { 
  Home, 
  Users, 
  Brain, 
  BarChart3, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileBottomNavigation = ({ activeTab, onTabChange }: MobileBottomNavigationProps) => {
  const menuItems = [
    {
      id: 'dashboard',
      title: 'Home',
      icon: Home,
    },
    {
      id: 'relationships',
      title: 'People',
      icon: Users,
    },
    {
      id: 'ai-chat',
      title: 'AI',
      icon: Brain,
    },
    {
      id: 'analytics',
      title: 'Stats',
      icon: BarChart3,
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
    }
  ];

  return (
    <div className="fixed left-0 right-0 bg-white border-t border-gray-200 z-50" style={{ bottom: "max(0px, env(safe-area-inset-bottom))", paddingBottom: "max(8px, calc(env(safe-area-inset-bottom) + 8px))" }}>
      <div className="flex justify-around items-center py-2 px-4">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1",
                isActive 
                  ? "text-green-600 bg-green-50" 
                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive && "text-green-600")} />
              <span className={cn(
                "text-xs font-medium truncate",
                isActive && "text-green-600"
              )}>
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
