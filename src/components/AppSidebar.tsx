import {
  Calendar,
  Home,
  Users,
  BarChart3,
  Brain,
  Trophy,
  Download,
  Settings,
  TrendingUp,
  HelpCircle,
  Sliders,
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
import { useLanguage } from "@/hooks/useLanguage";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Menu items organized by categories
const getMenuItems = (t: any) => [
  {
    group: t('navigation.main'),
    items: [
      {
        title: t('navigation.dashboard'),
        icon: Home,
        value: "dashboard",
      },
      {
        title: t('navigation.relationships'),
        icon: Users,
        value: "relationships",
      },
    ],
  },
  {
    group: t('navigation.analytics'),
    items: [
      {
        title: t('navigation.analytics'),
        icon: BarChart3,
        value: "analytics",
      },
      {
        title: t('navigation.performance'),
        icon: TrendingUp,
        value: "performance",
      },
    ],
  },
  {
    group: t('navigation.aiTools'),
    items: [
      {
        title: 'AI Recommendations',
        icon: Brain,
        value: "recommendations",
      },
    ],
  },
  {
    group: t('navigation.tools'),
    items: [
      {
        title: t('navigation.achievements'),
        icon: Trophy,
        value: "gamification",
      },
      {
        title: t('navigation.data'),
        icon: Download,
        value: "data",
      },
      {
        title: t('navigation.help'),
        icon: HelpCircle,
        value: "help",
      },
    ],
  },
  {
    group: t('navigation.configuration'),
    items: [
      {
        title: t('navigation.advanced'),
        icon: Sliders,
        value: "advanced",
      },
      {
        title: t('common.settings'),
        icon: Settings,
        value: "settings",
      },
    ],
  },
];

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { t } = useLanguage();
  const menuItems = getMenuItems(t);

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-green-100">
        <div className="flex items-center gap-3 p-4">
          <Heart className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('header.title')}</h1>
            <p className="text-sm text-green-600">{t('header.subtitle')}</p>
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
          {t('footer.version')} 1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
