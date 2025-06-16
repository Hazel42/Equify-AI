
import {
  Home,
  Users,
  Brain,
  Heart,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Menu items organized by categories
const getMenuItems = () => [
  {
    group: 'Main',
    items: [
      {
        title: 'Dashboard',
        icon: Home,
        value: "dashboard",
      },
      {
        title: 'Relationships',
        icon: Users,
        value: "relationships",
      },
      {
        title: 'AI Recommendations',
        icon: Brain,
        value: "recommendations",
      },
    ],
  },
];

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const menuItems = getMenuItems();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-green-100">
        <div className="flex items-center gap-3 p-4">
          <Heart className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Reciprocity AI</h1>
            <p className="text-sm text-green-600">Relationship Insights</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      isActive={activeTab === item.value}
                      onClick={() => onTabChange(item.value)}
                      className="w-full justify-start"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="border-t border-green-100">
        <div className="p-4 text-xs text-gray-500">
          Version 1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
