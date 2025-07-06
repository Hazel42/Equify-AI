import { Badge } from "@/components/ui/badge";
import {
  Home,
  Users,
  MessageCircle,
  BarChart3,
  Settings,
  Plus,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  activeColor: string;
  inactiveColor: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Home",
    icon: Home,
    activeColor: "text-green-600",
    inactiveColor: "text-gray-400",
  },
  {
    id: "relationships",
    label: "People",
    icon: Users,
    activeColor: "text-blue-600",
    inactiveColor: "text-gray-400",
  },
  {
    id: "ai-chat",
    label: "AI Chat",
    icon: MessageCircle,
    activeColor: "text-purple-600",
    inactiveColor: "text-gray-400",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    activeColor: "text-orange-600",
    inactiveColor: "text-gray-400",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    activeColor: "text-gray-600",
    inactiveColor: "text-gray-400",
  },
];

interface EnhancedMobileBottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onQuickAction?: (action: string) => void;
}

export const EnhancedMobileBottomNavigation = ({
  activeTab,
  onTabChange,
  onQuickAction,
}: EnhancedMobileBottomNavigationProps) => {
  const { user } = useAuth();
  const [longPressTab, setLongPressTab] = useState<string | null>(null);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Get notification counts
  const { data: notificationCount } = useQuery({
    queryKey: ["notification-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { data, error } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) return 0;
      return data?.length || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get recent AI insights count
  const { data: aiInsightCount } = useQuery({
    queryKey: ["ai-insight-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { data, error } = await supabase
        .from("ai_insights")
        .select("id")
        .eq("user_id", user.id)
        .eq("acted_upon", false)
        .gte(
          "created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        );

      if (error) return 0;
      return data?.length || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every minute
  });

  const handleTabPress = (tabId: string) => {
    // Haptic feedback simulation (would use actual haptic API on mobile)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    if (tabId === activeTab) {
      // Double tap action - scroll to top or refresh
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onTabChange(tabId);
    }
  };

  const handleLongPress = (tabId: string) => {
    setLongPressTab(tabId);
    // Show context menu or quick actions
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }

    // Auto hide after 2 seconds
    setTimeout(() => setLongPressTab(null), 2000);
  };

  const getBadgeCount = (tabId: string) => {
    switch (tabId) {
      case "ai-chat":
        return aiInsightCount;
      case "settings":
        return notificationCount;
      default:
        return 0;
    }
  };

  const NavigationButton = ({ item }: { item: NavigationItem }) => {
    const isActive = activeTab === item.id;
    const badgeCount = getBadgeCount(item.id);
    const Icon = item.icon;

    return (
      <motion.button
        className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
          isActive ? "bg-gray-100" : "hover:bg-gray-50"
        }`}
        onClick={() => handleTabPress(item.id)}
        onTouchStart={() => {
          const timer = setTimeout(() => handleLongPress(item.id), 500);
          setPressTimer(timer);
        }}
        onTouchEnd={() => {
          if (pressTimer) {
            clearTimeout(pressTimer);
            setPressTimer(null);
          }
        }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Badge */}
        {badgeCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 z-10"
          >
            <Badge
              variant="destructive"
              className="h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
            >
              {badgeCount > 9 ? "9+" : badgeCount}
            </Badge>
          </motion.div>
        )}

        {/* Icon */}
        <motion.div
          animate={{
            scale: isActive ? 1.15 : 1,
            rotate: isActive ? [0, -8, 8, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <Icon
            className={`h-6 w-6 ${isActive ? item.activeColor : item.inactiveColor}`}
          />
        </motion.div>

        {/* Label */}
        <span
          className={`text-xs mt-1.5 font-medium transition-colors leading-none ${
            isActive ? item.activeColor : item.inactiveColor
          }`}
        >
          {item.label}
        </span>

        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}

        {/* Long press indicator */}
        {longPressTab === item.id && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded"
          >
            Quick actions
          </motion.div>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 pb-6 z-50"
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Enhanced Layout: 2 items - Large Add Button - 2 items */}
      <div className="flex items-center justify-between px-2 pt-2">
        {/* Left Section - Home & People */}
        <div className="flex flex-1 justify-around">
          {navigationItems.slice(0, 2).map((item) => (
            <NavigationButton key={item.id} item={item} />
          ))}
        </div>

        {/* Center - Enhanced Quick Action Button */}
        <div className="flex-shrink-0 mx-4">
          <motion.button
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-lg elevation-8"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            style={{
              boxShadow:
                "0 8px 25px rgba(34, 197, 94, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}
            onClick={() => {
              // Quick add action based on current tab
              if (activeTab === "relationships") {
                onQuickAction?.("add-relationship");
              } else if (activeTab === "dashboard") {
                onQuickAction?.("add-favor");
              } else if (activeTab === "ai-chat") {
                onQuickAction?.("quick-ai-message");
              } else {
                onQuickAction?.("add-relationship"); // Default action
              }
            }}
          >
            <Plus className="h-7 w-7" />
          </motion.button>
        </div>

        {/* Right Section - AI Chat & Analytics */}
        <div className="flex flex-1 justify-around">
          {navigationItems.slice(2, 4).map((item) => (
            <NavigationButton key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Home indicator for iPhone-like devices */}
      <div className="flex justify-center pt-2">
        <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
      </div>
    </motion.div>
  );
};
