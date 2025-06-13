
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, Calendar, TrendingUp } from "lucide-react";

export const InsightsPanel = () => {
  const insights = [
    {
      type: "recommendation",
      title: "Perfect Time to Reciprocate",
      description: "Sarah helped you with your presentation. Consider treating her to lunch this week.",
      priority: "high",
      icon: Lightbulb,
      action: "Send Invitation"
    },
    {
      type: "reminder",
      title: "Birthday Coming Up",
      description: "Mike's birthday is in 5 days. He referred you to that job opportunity last month.",
      priority: "medium",
      icon: Calendar,
      action: "Plan Gift"
    },
    {
      type: "pattern",
      title: "Giving Pattern Insight",
      description: "You tend to give more financial favors. Consider offering time-based help too.",
      priority: "low",
      icon: TrendingUp,
      action: "Learn More"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Personalized recommendations to strengthen your relationships
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <IconComponent className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      {insight.action}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-600 to-blue-600 text-white border-0">
        <CardHeader>
          <CardTitle className="text-lg">Relationship Health Score</CardTitle>
          <CardDescription className="text-green-100">
            Your overall relationship balance this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">7.3/10</div>
            <div className="text-green-100 text-sm">
              ↗️ +0.5 from last month
            </div>
            <p className="text-green-100 text-xs mt-2">
              Great job maintaining balanced relationships!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
