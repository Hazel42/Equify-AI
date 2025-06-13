
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Gift, Star } from "lucide-react";

interface Relationship {
  id: number;
  name: string;
  type: string;
  balanceScore: number;
  recentActivity: string;
  lastInteraction: string;
  importance: number;
}

interface RelationshipCardProps {
  relationship: Relationship;
}

export const RelationshipCard = ({ relationship }: RelationshipCardProps) => {
  const getBalanceColor = (score: number) => {
    if (score >= 7) return "bg-green-500";
    if (score >= 5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getBalanceText = (score: number) => {
    if (score >= 7) return "Balanced";
    if (score >= 5) return "Needs Attention";
    return "Action Required";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "family": return "bg-purple-100 text-purple-700";
      case "friend": return "bg-blue-100 text-blue-700";
      case "colleague": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{relationship.name}</h3>
              <Badge className={getTypeColor(relationship.type)}>
                {relationship.type}
              </Badge>
              {relationship.importance >= 4 && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{relationship.recentActivity}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {relationship.lastInteraction}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Relationship Balance</span>
              <span className="text-sm text-gray-600">{relationship.balanceScore}/10</span>
            </div>
            <Progress 
              value={relationship.balanceScore * 10} 
              className="h-2"
            />
            <div className="flex items-center justify-between mt-1">
              <Badge 
                variant="outline" 
                className={`text-xs ${getBalanceColor(relationship.balanceScore).replace('bg-', 'border-').replace('bg-', 'text-')}`}
              >
                {getBalanceText(relationship.balanceScore)}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Gift className="h-3 w-3 mr-1" />
              Reciprocate
            </Button>
            <Button size="sm" variant="ghost" className="text-gray-600">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
