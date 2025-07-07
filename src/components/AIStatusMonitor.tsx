import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bot,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIServiceStatus {
  aiChat: "online" | "offline" | "error";
  recommendations: "online" | "offline" | "error";
  insights: "online" | "offline" | "error";
  lastChecked: Date;
}

export const AIStatusMonitor = () => {
  const [status, setStatus] = useState<AIServiceStatus>({
    aiChat: "offline",
    recommendations: "offline",
    insights: "offline",
    lastChecked: new Date(),
  });
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkAIServices = async () => {
    setIsChecking(true);
    const newStatus: AIServiceStatus = {
      aiChat: "offline",
      recommendations: "offline",
      insights: "offline",
      lastChecked: new Date(),
    };

    // Test AI Chat function
    try {
      const { data, error } = await supabase.functions.invoke(
        "ai-chat-assistant",
        {
          body: {
            message: "test",
            userId: "test-user-id",
          },
        },
      );
      newStatus.aiChat = error ? "error" : "online";
    } catch (error) {
      console.error("AI Chat test failed:", error);
      newStatus.aiChat = "error";
    }

    // Test Recommendations function
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-recommendations",
        {
          body: {
            userId: "test-user-id",
            relationshipId: "test-relationship-id",
          },
        },
      );
      newStatus.recommendations = error ? "error" : "online";
    } catch (error) {
      console.error("Recommendations test failed:", error);
      newStatus.recommendations = "error";
    }

    // Test AI Insights function
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-ai-insights",
        {
          body: {
            userId: "test-user-id",
          },
        },
      );
      newStatus.insights = error ? "error" : "online";
    } catch (error) {
      console.error("AI Insights test failed:", error);
      newStatus.insights = "error";
    }

    setStatus(newStatus);
    setIsChecking(false);

    // Show notification for failed services
    const failedServices = Object.entries(newStatus)
      .filter(([key, value]) => key !== "lastChecked" && value !== "online")
      .map(([key]) => key);

    if (failedServices.length > 0) {
      toast({
        title: "AI Services Status",
        description: `${failedServices.length} AI service(s) are experiencing issues`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkAIServices();
    // Check every 5 minutes
    const interval = setInterval(checkAIServices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (serviceStatus: string) => {
    switch (serviceStatus) {
      case "online":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "error":
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
    }
  };

  const getStatusBadge = (serviceStatus: string) => {
    switch (serviceStatus) {
      case "online":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Online
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            Error
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            Offline
          </Badge>
        );
    }
  };

  const allServicesOnline = Object.values(status).every(
    (value, index) => index === 3 || value === "online", // Skip lastChecked
  );

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-sm">AI Services Status</span>
            {allServicesOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkAIServices}
            disabled={isChecking}
            className="h-8 w-8 p-0"
          >
            <RefreshCw
              className={`h-3 w-3 ${isChecking ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.aiChat)}
              <span>AI Chat</span>
            </div>
            {getStatusBadge(status.aiChat)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.recommendations)}
              <span>Recommendations</span>
            </div>
            {getStatusBadge(status.recommendations)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.insights)}
              <span>AI Insights</span>
            </div>
            {getStatusBadge(status.insights)}
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-3 text-center">
          Last checked: {status.lastChecked.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};
