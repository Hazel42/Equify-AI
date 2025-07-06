import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Gift, MessageCircle, X } from "lucide-react";

interface FloatingActionButtonProps {
  activeTab: string;
  onAction: (action: string) => void;
}

export const FloatingActionButton = ({
  activeTab,
  onAction,
}: FloatingActionButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getQuickActions = () => {
    switch (activeTab) {
      case "dashboard":
        return [
          {
            id: "add-relationship",
            label: "Add Person",
            icon: Users,
            color: "bg-blue-500",
          },
          {
            id: "add-favor",
            label: "Record Favor",
            icon: Gift,
            color: "bg-green-500",
          },
        ];
      case "relationships":
        return [
          {
            id: "add-relationship",
            label: "Add Person",
            icon: Users,
            color: "bg-blue-500",
          },
        ];
      case "ai-chat":
        return [
          {
            id: "quick-ai-message",
            label: "Quick Question",
            icon: MessageCircle,
            color: "bg-purple-500",
          },
        ];
      default:
        return [
          {
            id: "add-relationship",
            label: "Add Person",
            icon: Users,
            color: "bg-blue-500",
          },
        ];
    }
  };

  const quickActions = getQuickActions();
  const primaryAction = quickActions[0];

  const handlePrimaryAction = () => {
    if (quickActions.length === 1) {
      onAction(primaryAction.id);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleQuickAction = (actionId: string) => {
    onAction(actionId);
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {/* Expanded Actions */}
      <AnimatePresence>
        {isExpanded && quickActions.length > 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {quickActions
              .slice(1)
              .reverse()
              .map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: { delay: index * 0.1 },
                    }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => handleQuickAction(action.id)}
                    className={`${action.color} text-white p-3 rounded-full shadow-lg flex items-center gap-2 pr-4 hover:shadow-xl transition-shadow`}
                  >
                    <ActionIcon className="h-5 w-5" />
                    <span className="text-sm font-medium whitespace-nowrap">
                      {action.label}
                    </span>
                  </motion.button>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-xl"
        style={{
          boxShadow:
            "0 8px 25px rgba(34, 197, 94, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        }}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={handlePrimaryAction}
        animate={{
          rotate: isExpanded ? 45 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        {isExpanded && quickActions.length > 1 ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </motion.button>

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
    </div>
  );
};
