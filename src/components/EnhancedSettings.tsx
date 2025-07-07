import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Brain,
  Database,
  LogOut,
  Info,
  Heart,
  Save,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AIStatusMonitor } from "@/components/AIStatusMonitor";

interface UserSettings {
  notifications: {
    aiInsights: boolean;
    relationshipReminders: boolean;
    weeklyReports: boolean;
    pushNotifications: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analyticsTracking: boolean;
    aiTraining: boolean;
  };
  preferences: {
    theme: "light" | "dark" | "system";
    language: string;
    reminderFrequency: "daily" | "weekly" | "monthly";
    defaultPrivacy: "private" | "friends" | "public";
  };
  ai: {
    personalityAssessment: boolean;
    autoInsights: boolean;
    conversationMemory: boolean;
    deepAnalysis: boolean;
  };
}

export const EnhancedSettings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      aiInsights: true,
      relationshipReminders: true,
      weeklyReports: true,
      pushNotifications: true,
    },
    privacy: {
      dataSharing: false,
      analyticsTracking: true,
      aiTraining: true,
    },
    preferences: {
      theme: "system",
      language: "en",
      reminderFrequency: "weekly",
      defaultPrivacy: "private",
    },
    ai: {
      personalityAssessment: true,
      autoInsights: true,
      conversationMemory: true,
      deepAnalysis: true,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved! ✅",
        description: "Your preferences have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (error) => {
      console.error("Settings update error:", error);
      toast({
        title: "Save Failed",
        description:
          "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    updateProfileMutation.mutate({
      preferences: settings.preferences,
      updated_at: new Date().toISOString(),
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Sign Out Error",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const SettingCard = ({
    title,
    description,
    icon: Icon,
    children,
  }: {
    title: string;
    description: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
          <p className="text-sm text-gray-600">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
      </Card>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-600">
            Customize your Equify experience
          </p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={updateProfileMutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateProfileMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Profile Section */}
      <SettingCard
        title="Profile"
        description="Your personal information and preferences"
        icon={User}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profile?.full_name || ""}
              onChange={(e) =>
                updateProfileMutation.mutate({ full_name: e.target.value })
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile?.email || ""}
              disabled
              className="mt-1 bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Personality Type</Label>
              <p className="text-xs text-gray-500">Based on your assessment</p>
            </div>
            <Badge variant="secondary" className="capitalize">
              {profile?.personality_type || "Not assessed"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Reciprocity Style</Label>
              <p className="text-xs text-gray-500">
                Your relationship approach
              </p>
            </div>
            <Badge variant="secondary" className="capitalize">
              {profile?.reciprocity_style?.replace(/_/g, " ") || "Not defined"}
            </Badge>
          </div>
        </div>
      </SettingCard>

      {/* Notifications */}
      <SettingCard
        title="Notifications"
        description="Control what notifications you receive"
        icon={Bell}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>AI Insights</Label>
              <p className="text-xs text-gray-500">
                Get personalized relationship insights
              </p>
            </div>
            <Switch
              checked={settings.notifications.aiInsights}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, aiInsights: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Relationship Reminders</Label>
              <p className="text-xs text-gray-500">
                Reminders to connect with people
              </p>
            </div>
            <Switch
              checked={settings.notifications.relationshipReminders}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    relationshipReminders: checked,
                  },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Reports</Label>
              <p className="text-xs text-gray-500">
                Summary of your relationship activity
              </p>
            </div>
            <Switch
              checked={settings.notifications.weeklyReports}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    weeklyReports: checked,
                  },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-xs text-gray-500">Mobile push notifications</p>
            </div>
            <Switch
              checked={settings.notifications.pushNotifications}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    pushNotifications: checked,
                  },
                }))
              }
            />
          </div>
        </div>
      </SettingCard>

      {/* AI Settings */}
      <SettingCard
        title="AI Features"
        description="Configure AI-powered insights and recommendations"
        icon={Brain}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Insights</Label>
              <p className="text-xs text-gray-500">
                Automatically generate relationship insights
              </p>
            </div>
            <Switch
              checked={settings.ai.autoInsights}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  ai: { ...prev.ai, autoInsights: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Conversation Memory</Label>
              <p className="text-xs text-gray-500">
                AI remembers previous conversations
              </p>
            </div>
            <Switch
              checked={settings.ai.conversationMemory}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  ai: { ...prev.ai, conversationMemory: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Deep Analysis</Label>
              <p className="text-xs text-gray-500">
                Advanced relationship pattern analysis
              </p>
            </div>
            <Switch
              checked={settings.ai.deepAnalysis}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  ai: { ...prev.ai, deepAnalysis: checked },
                }))
              }
            />
          </div>

          <Separator />

          <div>
            <Label>Reminder Frequency</Label>
            <RadioGroup
              value={settings.preferences.reminderFrequency}
              onValueChange={(value: any) =>
                setSettings((prev) => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    reminderFrequency: value,
                  },
                }))
              }
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </SettingCard>

      {/* Privacy */}
      <SettingCard
        title="Privacy & Security"
        description="Control your data privacy and security settings"
        icon={Shield}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Data Sharing</Label>
              <p className="text-xs text-gray-500">
                Share anonymized data for research
              </p>
            </div>
            <Switch
              checked={settings.privacy.dataSharing}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  privacy: { ...prev.privacy, dataSharing: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Analytics Tracking</Label>
              <p className="text-xs text-gray-500">
                Help improve the app with usage data
              </p>
            </div>
            <Switch
              checked={settings.privacy.analyticsTracking}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  privacy: { ...prev.privacy, analyticsTracking: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>AI Training</Label>
              <p className="text-xs text-gray-500">
                Use your data to improve AI models
              </p>
            </div>
            <Switch
              checked={settings.privacy.aiTraining}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  privacy: { ...prev.privacy, aiTraining: checked },
                }))
              }
            />
          </div>
        </div>
      </SettingCard>

      {/* App Information */}
      <SettingCard
        title="About"
        description="App information and support"
        icon={Info}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Version</span>
            <Badge variant="secondary">1.0.0</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Last Sync</span>
            <span className="text-sm text-gray-500">Just now</span>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Heart className="h-4 w-4 mr-2" />
              Rate Equify
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check for Updates
            </Button>
          </div>
        </div>
      </SettingCard>

      {/* Sign Out */}
      <Card className="border-red-200">
        <CardContent className="p-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
