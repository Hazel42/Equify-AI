
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavors } from "@/hooks/useFavors";
import { ReactNode } from "react";

interface RealtimeStatsCardProps {
  title: string;
  icon: ReactNode;
  type: 'relationships' | 'favorsGiven' | 'favorsReceived' | 'activity';
}

export const RealtimeStatsCard = ({ title, icon, type }: RealtimeStatsCardProps) => {
  const { relationships } = useRelationships();
  const { favors } = useFavors();

  const getValue = () => {
    switch (type) {
      case 'relationships':
        return relationships.length;
      case 'favorsGiven':
        return favors.filter(f => f.direction === 'given').length;
      case 'favorsReceived':
        return favors.filter(f => f.direction === 'received').length;
      case 'activity':
        const thisMonth = new Date();
        thisMonth.setDate(1);
        return favors.filter(f => new Date(f.date_occurred) >= thisMonth).length;
      default:
        return 0;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'relationships':
        return 'text-blue-600';
      case 'favorsGiven':
        return 'text-green-600';
      case 'favorsReceived':
        return 'text-purple-600';
      case 'activity':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={getColor()}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{getValue()}</div>
      </CardContent>
    </Card>
  );
};
