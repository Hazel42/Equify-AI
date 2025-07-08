import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIService {
  name: string;
  status: "online" | "offline" | "error";
  lastChecked: Date;
  responseTime?: number;
}

interface AIContext {
  // Service Status
  services: {
    chat: AIService;
    recommendations: AIService;
    insights: AIService;
  };

  // Global AI State
  isAIEnabled: boolean;
  aiQuota: {
    used: number;
    limit: number;
    resetDate: Date;
  };

  // Methods
  checkServiceHealth: () => Promise<void>;
  toggleAI: (enabled: boolean) => void;
  getAIUsage: () => Promise<void>;
  resetAIQuota: () => Promise<void>;

  // Loading states
  isCheckingHealth: boolean;
  isUpdatingSettings: boolean;
}

const AIContext = createContext<AIContext | undefined>(undefined);

export const useAIContext = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAIContext must be used within an AIProvider");
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [services, setServices] = useState<AIContext["services"]>({
    chat: { name: "AI Chat", status: "offline", lastChecked: new Date() },
    recommendations: {
      name: "AI Recommendations",
      status: "offline",
      lastChecked: new Date(),
    },
    insights: {
      name: "AI Insights",
      status: "offline",
      lastChecked: new Date(),
    },
  });

  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [aiQuota, setAiQuota] = useState({
    used: 0,
    limit: 100,
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });

  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Check AI service health
  const checkServiceHealth = async () => {
    if (!user) return;

    setIsCheckingHealth(true);
    const now = new Date();

    try {
      // Test AI Chat
      const chatStart = Date.now();
      try {
        await supabase.functions.invoke("ai-chat-assistant", {
          body: { message: "health-check", userId: user.id },
        });
        setServices((prev) => ({
          ...prev,
          chat: {
            ...prev.chat,
            status: "online",
            lastChecked: now,
            responseTime: Date.now() - chatStart,
          },
        }));
      } catch (error) {
        setServices((prev) => ({
          ...prev,
          chat: { ...prev.chat, status: "error", lastChecked: now },
        }));
      }

      // Test Recommendations
      const recStart = Date.now();
      try {
        await supabase.functions.invoke("generate-recommendations", {
          body: { userId: user.id, relationshipId: "health-check" },
        });
        setServices((prev) => ({
          ...prev,
          recommendations: {
            ...prev.recommendations,
            status: "online",
            lastChecked: now,
            responseTime: Date.now() - recStart,
          },
        }));
      } catch (error) {
        setServices((prev) => ({
          ...prev,
          recommendations: {
            ...prev.recommendations,
            status: "error",
            lastChecked: now,
          },
        }));
      }

      // Test Insights
      const insightStart = Date.now();
      try {
        await supabase.functions.invoke("generate-ai-insights", {
          body: { userId: user.id },
        });
        setServices((prev) => ({
          ...prev,
          insights: {
            ...prev.insights,
            status: "online",
            lastChecked: now,
            responseTime: Date.now() - insightStart,
          },
        }));
      } catch (error) {
        setServices((prev) => ({
          ...prev,
          insights: { ...prev.insights, status: "error", lastChecked: now },
        }));
      }
    } catch (error) {
      console.error("Health check failed:", error);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  // Get AI usage statistics
  const getAIUsage = async () => {
    if (!user) return;

    try {
      // This would typically call a backend API to get usage stats
      // For now, we'll simulate it
      const { data, error } = await supabase
        .from("ai_insights")
        .select("id, created_at")
        .eq("user_id", user.id)
        .gte(
          "created_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        );

      if (!error && data) {
        setAiQuota((prev) => ({
          ...prev,
          used: data.length,
        }));
      }
    } catch (error) {
      console.error("Failed to get AI usage:", error);
    }
  };

  // Toggle AI functionality
  const toggleAI = async (enabled: boolean) => {
    setIsUpdatingSettings(true);
    try {
      // Update user preferences in database
      const { error } = await supabase
        .from("profiles")
        .update({ subscription_tier: enabled ? 'premium' : 'free' })
        .eq("id", user?.id);

      if (error) throw error;

      setIsAIEnabled(enabled);
      toast({
        title: `AI ${enabled ? "Enabled" : "Disabled"}`,
        description: `AI features are now ${enabled ? "active" : "disabled"} for your account.`,
      });
    } catch (error) {
      console.error("Failed to update AI settings:", error);
      toast({
        title: "Settings Update Failed",
        description: "Could not update AI settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // Reset AI quota (admin function)
  const resetAIQuota = async () => {
    try {
      setAiQuota((prev) => ({
        ...prev,
        used: 0,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }));

      toast({
        title: "AI Quota Reset",
        description: "Your AI usage quota has been reset.",
      });
    } catch (error) {
      console.error("Failed to reset AI quota:", error);
    }
  };

  // Load initial settings and check health on mount
  useEffect(() => {
    if (user) {
      checkServiceHealth();
      getAIUsage();

      // Check health every 5 minutes
      const healthInterval = setInterval(checkServiceHealth, 5 * 60 * 1000);

      return () => clearInterval(healthInterval);
    }
  }, [user]);

  // Monitor AI quota
  useEffect(() => {
    if (aiQuota.used >= aiQuota.limit * 0.9) {
      toast({
        title: "AI Quota Warning",
        description: `You've used ${aiQuota.used}/${aiQuota.limit} AI requests this month.`,
        variant: "destructive",
      });
    }
  }, [aiQuota.used]);

  const contextValue: AIContext = {
    services,
    isAIEnabled,
    aiQuota,
    checkServiceHealth,
    toggleAI,
    getAIUsage,
    resetAIQuota,
    isCheckingHealth,
    isUpdatingSettings,
  };

  return (
    <AIContext.Provider value={contextValue}>{children}</AIContext.Provider>
  );
};

// Hook for checking if AI is available and enabled
export const useAIAvailable = () => {
  const { isAIEnabled, services, aiQuota } = useAIContext();

  const isAvailable =
    isAIEnabled &&
    Object.values(services).some((service) => service.status === "online") &&
    aiQuota.used < aiQuota.limit;

  const hasQuota = aiQuota.used < aiQuota.limit;
  const quotaPercentage = (aiQuota.used / aiQuota.limit) * 100;

  return {
    isAvailable,
    hasQuota,
    quotaPercentage,
    servicesOnline: Object.values(services).filter((s) => s.status === "online")
      .length,
    totalServices: Object.values(services).length,
  };
};

// Hook for AI service metrics
export const useAIMetrics = () => {
  const { services } = useAIContext();

  const averageResponseTime =
    Object.values(services)
      .filter((s) => s.responseTime)
      .reduce((acc, s) => acc + (s.responseTime || 0), 0) /
    Object.values(services).filter((s) => s.responseTime).length;

  const healthyServices = Object.values(services).filter(
    (s) => s.status === "online",
  ).length;
  const totalServices = Object.values(services).length;
  const healthPercentage = (healthyServices / totalServices) * 100;

  return {
    averageResponseTime: isNaN(averageResponseTime) ? 0 : averageResponseTime,
    healthPercentage,
    healthyServices,
    totalServices,
    lastHealthCheck: Math.max(
      ...Object.values(services).map((s) => s.lastChecked.getTime()),
    ),
  };
};
