
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, User, Bell, Shield, Database, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600" />
          Settings
        </h2>
        <p className="text-gray-600">Manage your account and app preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Email</Label>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Member Since</Label>
            <p className="text-sm text-gray-600">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <Button variant="outline" size="sm">
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            App Preferences
          </CardTitle>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-gray-600">Receive notifications about relationship reminders</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI Recommendations</Label>
              <p className="text-sm text-gray-600">Get AI-powered relationship suggestions</p>
            </div>
            <Switch checked={aiRecommendations} onCheckedChange={setAiRecommendations} />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>Control your data and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Sharing</Label>
              <p className="text-sm text-gray-600">Share anonymized data to improve AI features</p>
            </div>
            <Switch checked={dataSharing} onCheckedChange={setDataSharing} />
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline" size="sm" className="mr-2">
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Manage your stored data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" size="sm">
              Backup Data
            </Button>
            <Button variant="outline" size="sm">
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={signOut}
            variant="destructive" 
            className="w-full"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
