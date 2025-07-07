import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bell,
  Menu,
  Search,
  Settings,
  User,
  LogOut,
  Heart,
  Gift,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/Sidebar";

interface EnhancedMobileHeaderProps {
  title: string;
  showSearch?: boolean;
  onSearchClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const EnhancedMobileHeader = ({
  title,
  showSearch = false,
  onSearchClick,
  showBackButton = false,
  onBackClick,
}: EnhancedMobileHeaderProps) => {
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get notification count
  const { data: notifications } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "favor":
        return <Gift className="h-4 w-4 text-green-600" />;
      case "insight":
        return <MessageCircle className="h-4 w-4 text-blue-600" />;
      case "relationship":
        return <Heart className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);
  };

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <header className="relative bg-white border-b border-gray-200 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Menu/Back and Title */}
          <div className="flex items-center gap-3 flex-1">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 h-auto hover:bg-gray-100"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </Button>
            </motion.div>

            <div>
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
              {user && (
                <p className="text-xs text-gray-500">
                  Welcome back, {user.email?.split("@")[0]}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {showSearch && (
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSearchClick}
                  className="h-8 w-8 p-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* Notifications */}
            <motion.div whileTap={{ scale: 0.95 }} className="relative">
              <DropdownMenu
                open={showNotifications}
                onOpenChange={setShowNotifications}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 relative"
                  >
                    <Bell className="h-4 w-4" />
                    {notifications && notifications.length > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full"
                      >
                        {notifications.length > 9 ? "9+" : notifications.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {notifications && notifications.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="flex items-start gap-3 p-3 cursor-pointer"
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                        >
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(
                                notification.created_at,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No new notifications</p>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs">
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("navigate-to-tab", {
                        detail: { tab: "settings" },
                      }),
                    );
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
};
