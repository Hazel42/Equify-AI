
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RealtimeStatsCard } from "@/components/RealtimeStatsCard";
import { Users, Heart, Gift, TrendingUp, Plus, MessageCircle } from "lucide-react";

export const SimpleDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <RealtimeStatsCard
          title="Relationships"
          icon={<Users className="h-6 w-6" />}
          type="relationships"
        />
        <RealtimeStatsCard
          title="Favors Given"
          icon={<Gift className="h-6 w-6" />}
          type="favorsGiven"
        />
        <RealtimeStatsCard
          title="Favors Received"
          icon={<Heart className="h-6 w-6" />}
          type="favorsReceived"
        />
        <RealtimeStatsCard
          title="Activity"
          icon={<TrendingUp className="h-6 w-6" />}
          type="activity"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add New Relationship
          </Button>
          <Button variant="outline" className="w-full">
            <Gift className="h-4 w-4 mr-2" />
            Record a Favor
          </Button>
          <Button variant="outline" className="w-full">
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask AI for Advice
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">New relationship added</p>
                <p className="text-xs text-gray-600">Sarah Johnson - Friend</p>
              </div>
              <span className="text-xs text-gray-500">2h ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Favor recorded</p>
                <p className="text-xs text-gray-600">Helped with moving</p>
              </div>
              <span className="text-xs text-gray-500">1d ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
