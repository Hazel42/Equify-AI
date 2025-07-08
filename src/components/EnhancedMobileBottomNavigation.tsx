import { Badge } from "@/components/ui/badge";
import {
  Home,
  Users,
  MessageCircle,
  BarChart3,
  Settings,
  Plus,
  Bell,
  Gift,
  X,
  UserPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    label: "Chat",
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
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleQuickAction = (actionId: string) => {
    onQuickAction?.(actionId);
    setIsExpanded(false);
  };

  const getQuickActions = () => {
    return [
      {
        id: "add-relationship",
        label: "Add Person",
        icon: UserPlus,
        color: "bg-blue-500",
      },
      {
        id: "add-favor",
        label: "Add Favor",
        icon: Gift,
        color: "bg-green-500",
      },
    ];
  };

  const quickActions = getQuickActions();

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
        className={`relative flex flex-col items-center justify-center p-1.5 rounded-lg transition-all duration-200 ${
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
              className="h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full"
            >
              {badgeCount > 9 ? "9+" : badgeCount}
            </Badge>
          </motion.div>
        )}

        {/* Icon */}
        <motion.div
          animate={{
            scale: isActive ? 1.1 : 1,
            rotate: isActive ? [0, -6, 6, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <Icon
            className={`h-5 w-5 ${isActive ? item.activeColor : item.inactiveColor}`}
          />
        </motion.div>

        {/* Label */}
        <span
          className={`text-xs mt-1 font-medium transition-colors leading-none ${
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
            className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded"
          >
            Quick actions
          </motion.div>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div
      className="fixed left-0 right-0 bg-white border-t border-gray-200 px-3 py-2 z-50"
      style={{
        bottom: "max(0px, env(safe-area-inset-bottom))",
        paddingBottom: "max(8px, calc(env(safe-area-inset-bottom) + 8px))",
        marginBottom: "max(0px, calc(env(keyboard-inset-height, 0px)))",
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Enhanced Layout: 2 items - Large Add Button - 2 items */}
      <div className="flex items-center justify-between px-1 pt-1">
        {/* Left Section - Home & People */}
        <div className="flex flex-1 justify-around">
          {navigationItems.slice(0, 2).map((item) => (
            <NavigationButton key={item.id} item={item} />
          ))}
        </div>

        {/* Center - Enhanced Quick Action Button */}
        <div className="flex-shrink-0 mx-4 relative">
          {/* Expanded Actions */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bottom-14 left-1/2 transform -translate-x-1/2 space-y-2"
              >
                {quickActions.map((action, index) => {
                  const ActionIcon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: index * 0.1 },
                      }}
                      exit={{ opacity: 0, y: 20 }}
                      onClick={() => handleQuickAction(action.id)}
                      className={`${action.color} text-white p-2.5 rounded-full shadow-lg flex items-center gap-2 pr-3 hover:shadow-xl transition-shadow whitespace-nowrap`}
                    >
                      <ActionIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {action.label}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-lg opacity-30"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.button
            className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-full shadow-lg"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            style={{
              boxShadow:
                "0 6px 20px rgba(34, 197, 94, 0.3), 0 3px 10px rgba(0, 0, 0, 0.15)",
            }}
            onClick={() => setIsExpanded(!isExpanded)}
            animate={{
              rotate: isExpanded ? 45 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? (
              <X className="h-6 w-6" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
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
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-32 h-1 bg-gray-300 rounded-full opacity-60"></div>
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
