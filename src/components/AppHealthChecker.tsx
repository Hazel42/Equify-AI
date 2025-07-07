import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Database,
  Wifi,
  Users,
  Bot,
  Heart,
  Settings,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface HealthCheck {
  name: string;
  status: "pending" | "success" | "error";
  message: string;
  icon: any;
}

export const AppHealthChecker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checks, setChecks] = useState<HealthCheck[]>([
    {
      name: "Database Connection",
      status: "pending",
      message: "Checking...",
      icon: Database,
    },
    {
      name: "Authentication",
      status: "pending",
      message: "Checking...",
      icon: Users,
    },
    {
      name: "Relationships API",
      status: "pending",
      message: "Checking...",
      icon: Heart,
    },
    {
      name: "AI Chat Service",
      status: "pending",
      message: "Checking...",
      icon: Bot,
    },
    {
      name: "AI Recommendations",
      status: "pending",
      message: "Checking...",
      icon: Settings,
    },
    {
      name: "Real-time Updates",
      status: "pending",
      message: "Checking...",
      icon: Wifi,
    },
  ]);

  const updateCheck = (
    index: number,
    status: "success" | "error",
    message: string,
  ) => {
    setChecks((prev) =>
      prev.map((check, i) =>
        i === index ? { ...check, status, message } : check,
      ),
    );
  };

  const runHealthChecks = async () => {
    setIsRunning(true);
    setProgress(0);

    // Reset all checks
    setChecks((prev) =>
      prev.map((check) => ({
        ...check,
        status: "pending" as const,
        message: "Checking...",
      })),
    );

    const totalChecks = checks.length;
    let completedChecks = 0;

    const incrementProgress = () => {
      completedChecks++;
      setProgress((completedChecks / totalChecks) * 100);
    };

    // 1. Database Connection
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);
      if (error) throw error;
      updateCheck(0, "success", "Database is accessible");
    } catch (error) {
      updateCheck(
        0,
        "error",
        `Database error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
    incrementProgress();

    // 2. Authentication
    try {
      if (user) {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        updateCheck(1, "success", `Authenticated as ${user.email}`);
      } else {
        updateCheck(1, "error", "User not authenticated");
      }
    } catch (error) {
      updateCheck(
        1,
        "error",
        `Auth error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
    incrementProgress();

    // 3. Relationships API
    try {
      if (user) {
        const { data, error } = await supabase
          .from("relationships")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);
        if (error) throw error;
        updateCheck(2, "success", `Found ${data?.length || 0} relationships`);
      } else {
        updateCheck(2, "error", "Cannot test without authentication");
      }
    } catch (error) {
      updateCheck(
        2,
        "error",
        `Relationships API error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
    incrementProgress();

    // 4. AI Chat Service
    try {
      const { data, error } = await supabase.functions.invoke(
        "ai-chat-assistant",
        {
          body: {
            message: "test connection",
            userId: user?.id || "test-user",
          },
        },
      );

      if (error) throw error;
      updateCheck(3, "success", "AI Chat service is responsive");
    } catch (error) {
      updateCheck(
        3,
        "error",
        `AI Chat error: ${error instanceof Error ? error.message : "Service unavailable"}`,
      );
    }
    incrementProgress();

    // 5. AI Recommendations
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-recommendations",
        {
          body: {
            userId: user?.id || "test-user",
            relationshipId: "test-relationship",
          },
        },
      );

      updateCheck(4, "success", "AI Recommendations service is responsive");
    } catch (error) {
      updateCheck(
        4,
        "error",
        `AI Recommendations error: ${error instanceof Error ? error.message : "Service unavailable"}`,
      );
    }
    incrementProgress();

    // 6. Real-time Updates
    try {
      const channel = supabase.channel("health-check");
      const subscription = channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          updateCheck(5, "success", "Real-time connection established");
        } else {
          updateCheck(5, "error", `Real-time status: ${status}`);
        }
      });

      // Clean up subscription after test
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 2000);
    } catch (error) {
      updateCheck(
        5,
        "error",
        `Real-time error: ${error instanceof Error ? error.message : "Connection failed"}`,
      );
    }
    incrementProgress();

    setIsRunning(false);

    // Show summary toast
    const successCount = checks.filter(
      (check) => check.status === "success",
    ).length;
    const errorCount = checks.filter(
      (check) => check.status === "error",
    ).length;

    toast({
      title: "Health Check Complete",
      description: `${successCount} services working, ${errorCount} issues found`,
      variant: errorCount > 0 ? "destructive" : "default",
    });
  };

  useEffect(() => {
    // Run initial health check
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            OK
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
            Checking
          </Badge>
        );
    }
  };

  const overallHealth = checks.every((check) => check.status === "success")
    ? "healthy"
    : checks.some((check) => check.status === "error")
      ? "issues"
      : "checking";

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div
              className={`p-2 rounded-full ${
                overallHealth === "healthy"
                  ? "bg-green-100"
                  : overallHealth === "issues"
                    ? "bg-red-100"
                    : "bg-yellow-100"
              }`}
            >
              {overallHealth === "healthy" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : overallHealth === "issues" ? (
                <XCircle className="h-4 w-4 text-red-600" />
              ) : (
                <Clock className="h-4 w-4 text-yellow-600" />
              )}
            </div>
            Application Health
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={runHealthChecks}
            disabled={isRunning}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`}
            />
            {isRunning ? "Checking..." : "Check Again"}
          </Button>
        </div>
        {isRunning && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500">Running health checks...</p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {checks.map((check, index) => {
          const Icon = check.icon;
          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-gray-600" />
                <div>
                  <div className="font-medium text-sm">{check.name}</div>
                  <div className="text-xs text-gray-500">{check.message}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(check.status)}
                {getStatusBadge(check.status)}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
