import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  X,
  User,
  Settings,
  Heart,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  Star,
  CreditCard,
  Shield,
  FileText,
  Bell,
  Zap,
  Crown,
  Gift,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Get user's membership status (placeholder for future implementation)
  const { data: membershipData } = useQuery({
    queryKey: ["membership", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Placeholder for future membership API
      return {
        plan: "free", // free, premium, pro
        features: ["Basic Analytics", "5 Relationships"],
        upgradeAvailable: true,
      };
    },
    enabled: !!user?.id,
  });

  const menuSections = [
    {
      title: "Quick Actions",
      items: [
        {
          icon: Heart,
          label: "Relationships",
          action: () => navigateToTab("relationships"),
          color: "text-red-500",
        },
        {
          icon: TrendingUp,
          label: "Analytics",
          action: () => navigateToTab("analytics"),
          color: "text-blue-500",
        },
        {
          icon: MessageSquare,
          label: "AI Chat",
          action: () => navigateToTab("ai-chat"),
          color: "text-green-500",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile",
          action: () => setActiveSection("profile"),
          color: "text-gray-600",
        },
        {
          icon: Settings,
          label: "Settings",
          action: () => navigateToTab("settings"),
          color: "text-gray-600",
        },
        {
          icon: Bell,
          label: "Notifications",
          action: () => setActiveSection("notifications"),
          color: "text-gray-600",
        },
      ],
    },
    {
      title: "Membership",
      items: [
        {
          icon: membershipData?.plan === "free" ? Crown : Star,
          label:
            membershipData?.plan === "free"
              ? "Upgrade to Premium"
              : "Manage Plan",
          action: () => setActiveSection("membership"),
          color:
            membershipData?.plan === "free"
              ? "text-amber-500"
              : "text-purple-500",
          badge:
            membershipData?.plan === "free" ? "Upgrade" : membershipData?.plan,
        },
        {
          icon: CreditCard,
          label: "Billing",
          action: () => setActiveSection("billing"),
          color: "text-blue-600",
        },
        {
          icon: Gift,
          label: "Referrals",
          action: () => setActiveSection("referrals"),
          color: "text-green-600",
          badge: "Earn rewards",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help Center",
          action: () => setActiveSection("help"),
          color: "text-gray-600",
        },
        {
          icon: FileText,
          label: "Terms & Privacy",
          action: () => setActiveSection("legal"),
          color: "text-gray-600",
        },
        {
          icon: Shield,
          label: "Security",
          action: () => setActiveSection("security"),
          color: "text-gray-600",
        },
      ],
    },
  ];

  const navigateToTab = (tab: string) => {
    window.dispatchEvent(
      new CustomEvent("navigate-to-tab", {
        detail: { tab },
      }),
    );
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-green-500 to-blue-500 text-white safe-area-top">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-white/20 text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {user?.email?.split("@")[0]}
                    </p>
                    <p className="text-sm text-white/80 truncate">
                      {user?.email}
                    </p>
                  </div>
                  {membershipData?.plan !== "free" && (
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30"
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      {membershipData?.plan}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-6">
                  {menuSections.map((section, sectionIndex) => (
                    <div key={section.title}>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {section.title}
                      </h3>
                      <div className="space-y-1">
                        {section.items.map((item, itemIndex) => (
                          <motion.div
                            key={item.label}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              variant="ghost"
                              className="w-full justify-start h-auto p-3 hover:bg-gray-50"
                              onClick={item.action}
                            >
                              <item.icon
                                className={`h-5 w-5 mr-3 ${item.color}`}
                              />
                              <span className="flex-1 text-left">
                                {item.label}
                              </span>
                              {item.badge && (
                                <Badge
                                  variant={
                                    item.badge === "Upgrade"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="ml-2 text-xs"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                      {sectionIndex < menuSections.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50 safe-area-pb">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
