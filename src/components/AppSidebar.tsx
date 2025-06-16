import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Home,
  Users,
  Brain,
  BarChart3,
  Settings,
  MessageCircle,
  Lightbulb,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Link } from "react-router-dom";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AppSidebar = ({ activeTab, onTabChange }: AppSidebarProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: Home,
      description: 'Overview and quick actions'
    },
    {
      id: 'relationships',
      title: 'Relationships',
      icon: Users,
      description: 'Manage your connections'
    },
    {
      id: 'recommendations',
      title: 'AI Recommendations',
      icon: Brain,
      description: 'Smart suggestions'
    },
    {
      id: 'ai-chat',
      title: 'AI Assistant',
      icon: MessageCircle,
      description: 'Chat with relationship advisor'
    },
    {
      id: 'ai-insights',
      title: 'AI Insights',
      icon: Lightbulb,
      description: 'Deep relationship analytics'
    },
    {
      id: 'automation',
      title: 'Smart Automation',
      icon: Zap,
      description: 'Automated relationship management'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: BarChart3,
      description: 'Performance metrics'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      description: 'App preferences'
    }
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden">
          Menu
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-64">
        <SheetHeader className="text-left">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate through your relationship management tools.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onTabChange(item.id)}
              asChild
            >
              <Link to="/">
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
