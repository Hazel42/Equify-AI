
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, Bell, Target, Calendar, MessageSquare, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  type: 'reminder' | 'categorization' | 'priority_adjustment' | 'notification';
  enabled: boolean;
  conditions: any;
  actions: any;
  lastTriggered?: Date;
  triggerCount: number;
}

export const SmartAutomation = () => {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const defaultRules: AutomationRule[] = [
    {
      id: '1',
      name: "Smart Reminders",
      description: "Automatically create reminders based on relationship balance and importance",
      type: "reminder",
      enabled: true,
      conditions: { balanceThreshold: -2, importanceLevel: 3 },
      actions: { createReminder: true, reminderDelay: 3 },
      triggerCount: 12
    },
    {
      id: '2',
      name: "Auto-Categorization",
      description: "Automatically categorize favors using AI analysis",
      type: "categorization",
      enabled: true,
      conditions: { newFavor: true },
      actions: { aiCategorize: true, confidence: 80 },
      triggerCount: 8
    },
    {
      id: '3',
      name: "Priority Adjustment",
      description: "Dynamically adjust recommendation priorities based on recent activities",
      type: "priority_adjustment",
      enabled: true,
      conditions: { activityPattern: true, timeWindow: 7 },
      actions: { adjustPriority: true, maxAdjustment: 2 },
      triggerCount: 5
    },
    {
      id: '4',
      name: "Intelligent Notifications",
      description: "Send notifications at optimal times based on user patterns",
      type: "notification",
      enabled: false,
      conditions: { optimalTiming: true, userActive: true },
      actions: { smartNotify: true, quietHours: [22, 8] },
      triggerCount: 0
    }
  ];

  useEffect(() => {
    // Initialize with default rules
    setAutomationRules(defaultRules);
  }, []);

  const toggleRule = (ruleId: string) => {
    const updatedRules = automationRules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );
    setAutomationRules(updatedRules);

    toast({
      title: 'Automation Updated',
      description: `Rule ${updatedRules.find(r => r.id === ruleId)?.enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  const testAutomation = async () => {
    setIsLoading(true);
    try {
      // Simulate automation testing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const enabledRules = automationRules.filter(r => r.enabled);
      
      toast({
        title: 'Automation Test Complete',
        description: `Processed ${enabledRules.length} rules successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Test Failed',
        description: 'Failed to test automation rules.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return Clock;
      case 'categorization': return Target;
      case 'priority_adjustment': return Calendar;
      case 'notification': return Bell;
      default: return Zap;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'categorization': return 'bg-green-100 text-green-700 border-green-200';
      case 'priority_adjustment': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'notification': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            Smart Automation
          </h2>
          <p className="text-gray-600">AI-powered automation to streamline your relationship management</p>
        </div>
        <Button onClick={testAutomation} disabled={isLoading} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          {isLoading ? 'Testing...' : 'Test Automation'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automationRules.map((rule) => {
          const Icon = getTypeIcon(rule.type);
          return (
            <Card key={rule.id} className={`transition-all ${rule.enabled ? 'border-blue-200 bg-blue-50/20' : 'border-gray-200'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <Badge className={getTypeColor(rule.type)}>
                      {rule.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                </div>
                <CardTitle className="text-lg">{rule.name}</CardTitle>
                <CardDescription>{rule.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={rule.enabled ? 'text-green-600' : 'text-gray-500'}>
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Triggers:</span>
                    <span className="text-gray-900">{rule.triggerCount}</span>
                  </div>

                  {rule.lastTriggered && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last run:</span>
                      <span className="text-gray-900">
                        {new Date(rule.lastTriggered).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <Label className="text-xs text-gray-500">
                      Conditions: {JSON.stringify(rule.conditions).length > 50 
                        ? JSON.stringify(rule.conditions).substring(0, 50) + '...' 
                        : JSON.stringify(rule.conditions)}
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
