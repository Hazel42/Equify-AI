
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Bell, Download, Trash2, Eye, EyeOff } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SettingsPage = () => {
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    personality_type: profile?.personality_type || '',
    reciprocity_style: profile?.reciprocity_style || '',
    notifications_enabled: true,
    email_reminders: true,
    weekly_reports: true,
  });

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateProfile.mutateAsync({
        full_name: formData.full_name,
        personality_type: formData.personality_type,
        reciprocity_style: formData.reciprocity_style,
      });
      
      toast({
        title: "Profile Updated",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { data: relationships } = await supabase
        .from('relationships')
        .select('*')
        .eq('user_id', profile?.id);
        
      const { data: favors } = await supabase
        .from('favors')
        .select('*')
        .eq('user_id', profile?.id);

      const exportData = {
        profile,
        relationships,
        favors,
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relationshipdebt-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Manage your account preferences and data</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="personality">Personality Type</Label>
              <Select
                value={formData.personality_type}
                onValueChange={(value) => setFormData({ ...formData, personality_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select personality type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="giving">The Giver</SelectItem>
                  <SelectItem value="balanced">The Balanced</SelectItem>
                  <SelectItem value="receiver">The Receiver</SelectItem>
                  <SelectItem value="analyzer">The Analyzer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reciprocity">Reciprocity Style</Label>
              <Select
                value={formData.reciprocity_style}
                onValueChange={(value) => setFormData({ ...formData, reciprocity_style: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reciprocity style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="thoughtful">Thoughtful</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="emotional">Emotional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleUpdateProfile} disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Control how and when you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Push Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications about relationship insights</p>
            </div>
            <Switch
              id="notifications"
              checked={formData.notifications_enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, notifications_enabled: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-reminders">Email Reminders</Label>
              <p className="text-sm text-gray-500">Get weekly relationship check-ins via email</p>
            </div>
            <Switch
              id="email-reminders"
              checked={formData.email_reminders}
              onCheckedChange={(checked) => setFormData({ ...formData, email_reminders: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-reports">Weekly Reports</Label>
              <p className="text-sm text-gray-500">Receive weekly analytics and insights</p>
            </div>
            <Switch
              id="weekly-reports"
              checked={formData.weekly_reports}
              onCheckedChange={(checked) => setFormData({ ...formData, weekly_reports: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Subscription & Billing */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Current Plan</span>
                <Badge className="bg-green-100 text-green-700">Free Tier</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Upgrade to unlock advanced AI insights and unlimited relationships
              </p>
            </div>
            <Button variant="outline">
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Export or delete your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Export Data</Label>
              <p className="text-sm text-gray-500">Download all your relationship data</p>
            </div>
            <Button onClick={handleExportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
            <div>
              <Label className="text-red-700">Delete Account</Label>
              <p className="text-sm text-red-500">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            Privacy & Security
          </CardTitle>
          <CardDescription>Manage your privacy and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
          <Button variant="outline" className="w-full">
            Two-Factor Authentication
          </Button>
          <Button variant="outline" className="w-full">
            Privacy Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
