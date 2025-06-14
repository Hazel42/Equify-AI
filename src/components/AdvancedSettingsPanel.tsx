
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, Shield, Palette, Database, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AdvancedSettingsPanel = () => {
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    reminderFrequency: "daily",
    urgentAlertsOnly: false,
    
    // Privacy Settings
    dataSharing: false,
    analyticsTracking: true,
    publicProfile: false,
    
    // AI Settings
    aiInsightFrequency: "weekly",
    personalizedRecommendations: true,
    aiAnalysisDepth: [7], // Scale 1-10
    autoGenerateInsights: true,
    
    // Display Settings
    theme: "system",
    compactMode: false,
    animationsEnabled: true,
    defaultView: "dashboard",
    
    // Data Settings
    autoBackup: true,
    retentionPeriod: "1year",
    exportFormat: "json"
  });

  const { toast } = useToast();

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Setting Updated",
      description: `${key} has been updated successfully.`,
    });
  };

  const resetToDefaults = () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      // Reset to default values
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to their default values.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced Settings</h2>
        <p className="text-gray-600">Customize your RelationshipDebt AI experience</p>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Control how and when you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Email Notifications</label>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Push Notifications</label>
              <p className="text-sm text-gray-500">Browser push notifications</p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium">Reminder Frequency</label>
            <Select
              value={settings.reminderFrequency}
              onValueChange={(value) => handleSettingChange("reminderFrequency", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Urgent Alerts Only</label>
              <p className="text-sm text-gray-500">Only receive high-priority notifications</p>
            </div>
            <Switch
              checked={settings.urgentAlertsOnly}
              onCheckedChange={(checked) => handleSettingChange("urgentAlertsOnly", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* AI & Intelligence Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            AI & Intelligence
          </CardTitle>
          <CardDescription>Configure AI behavior and analysis preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="font-medium">AI Insight Frequency</label>
            <Select
              value={settings.aiInsightFrequency}
              onValueChange={(value) => handleSettingChange("aiInsightFrequency", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="manual">Manual Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="font-medium">AI Analysis Depth</label>
            <p className="text-sm text-gray-500">Higher values provide more detailed analysis</p>
            <Slider
              value={settings.aiAnalysisDepth}
              onValueChange={(value) => handleSettingChange("aiAnalysisDepth", value)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Basic</span>
              <span>Current: {settings.aiAnalysisDepth[0]}</span>
              <span>Deep</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Personalized Recommendations</label>
              <p className="text-sm text-gray-500">AI tailors suggestions to your patterns</p>
            </div>
            <Switch
              checked={settings.personalizedRecommendations}
              onCheckedChange={(checked) => handleSettingChange("personalizedRecommendations", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Auto-Generate Insights</label>
              <p className="text-sm text-gray-500">Automatically create new insights</p>
            </div>
            <Switch
              checked={settings.autoGenerateInsights}
              onCheckedChange={(checked) => handleSettingChange("autoGenerateInsights", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Privacy & Security
          </CardTitle>
          <CardDescription>Control your data privacy and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Data Sharing</label>
              <p className="text-sm text-gray-500">Share anonymized data for research</p>
            </div>
            <Switch
              checked={settings.dataSharing}
              onCheckedChange={(checked) => handleSettingChange("dataSharing", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Analytics Tracking</label>
              <p className="text-sm text-gray-500">Help us improve the app with usage data</p>
            </div>
            <Switch
              checked={settings.analyticsTracking}
              onCheckedChange={(checked) => handleSettingChange("analyticsTracking", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Public Profile</label>
              <p className="text-sm text-gray-500">Make your profile visible to others</p>
            </div>
            <Switch
              checked={settings.publicProfile}
              onCheckedChange={(checked) => handleSettingChange("publicProfile", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Display & Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-green-600" />
            Display & Interface
          </CardTitle>
          <CardDescription>Customize the app's appearance and behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="font-medium">Theme</label>
            <Select
              value={settings.theme}
              onValueChange={(value) => handleSettingChange("theme", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="font-medium">Default View</label>
            <Select
              value={settings.defaultView}
              onValueChange={(value) => handleSettingChange("defaultView", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="relationships">Relationships</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Compact Mode</label>
              <p className="text-sm text-gray-500">Denser layout with more information</p>
            </div>
            <Switch
              checked={settings.compactMode}
              onCheckedChange={(checked) => handleSettingChange("compactMode", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Animations</label>
              <p className="text-sm text-gray-500">Enable smooth transitions and effects</p>
            </div>
            <Switch
              checked={settings.animationsEnabled}
              onCheckedChange={(checked) => handleSettingChange("animationsEnabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-orange-600" />
            Data Management
          </CardTitle>
          <CardDescription>Control how your data is stored and managed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Auto Backup</label>
              <p className="text-sm text-gray-500">Automatically backup your data</p>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium">Data Retention</label>
            <Select
              value={settings.retentionPeriod}
              onValueChange={(value) => handleSettingChange("retentionPeriod", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
                <SelectItem value="forever">Forever</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="font-medium">Export Format</label>
            <Select
              value={settings.exportFormat}
              onValueChange={(value) => handleSettingChange("exportFormat", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                Import Settings
              </Button>
              <Button>
                Export Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
