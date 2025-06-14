
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, BellOff, Clock, Heart, Gift, Calendar, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: 'reminder' | 'insight' | 'recommendation' | 'birthday' | 'follow_up';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  actionable: boolean;
  relationshipName?: string;
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'reminder',
      title: 'Follow up with Sarah',
      message: 'It\'s been 2 weeks since Sarah helped you move. Consider sending a thank you gift or returning the favor.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      priority: 'medium',
      read: false,
      actionable: true,
      relationshipName: 'Sarah'
    },
    {
      id: '2',
      type: 'insight',
      title: 'AI Insight Available',
      message: 'New relationship analysis is ready for your connection with Mike Johnson.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      priority: 'low',
      read: false,
      actionable: true,
      relationshipName: 'Mike Johnson'
    },
    {
      id: '3',
      type: 'birthday',
      title: 'Birthday Reminder',
      message: 'Mom\'s birthday is tomorrow! Don\'t forget to call or send a gift.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      priority: 'high',
      read: false,
      actionable: true,
      relationshipName: 'Mom'
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'New Recommendations',
      message: 'AI has generated 3 new reciprocity suggestions for your relationship with David.',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      priority: 'medium',
      read: true,
      actionable: true,
      relationshipName: 'David'
    }
  ]);

  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: "All notifications marked as read",
      description: "Your notification center has been cleared.",
    });
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: "Notification dismissed",
      description: "The notification has been removed.",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'insight':
        return <Heart className="h-4 w-4 text-purple-600" />;
      case 'recommendation':
        return <Gift className="h-4 w-4 text-green-600" />;
      case 'birthday':
        return <Calendar className="h-4 w-4 text-red-600" />;
      case 'follow_up':
        return <Bell className="h-4 w-4 text-yellow-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-900" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <p className="text-gray-600">Stay on top of your relationship activities</p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-100 text-red-700">
                {unreadCount} unread
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-all hover:shadow-sm ${
                      notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium ${notification.read ? 'text-gray-900' : 'text-blue-900'}`}>
                              {notification.title}
                            </h4>
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            {notification.relationshipName && (
                              <Badge variant="outline" className="text-xs">
                                {notification.relationshipName}
                              </Badge>
                            )}
                          </div>
                          <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-blue-700'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.read && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => dismissNotification(notification.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {notification.actionable && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Take Action
                          </Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Pending Reminders</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">3</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">AI Insights</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">2</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Upcoming Events</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">1</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
