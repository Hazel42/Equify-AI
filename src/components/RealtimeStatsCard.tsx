
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  type: 'relationships' | 'favorsGiven' | 'favorsReceived' | 'activity';
  format?: 'number' | 'percentage';
}

export const RealtimeStatsCard = ({ title, icon, type, format = 'number' }: StatCardProps) => {
  const { stats, loading } = useRealtimeDashboard();

  const getValue = () => {
    switch (type) {
      case 'relationships':
        return stats.totalRelationships;
      case 'favorsGiven':
        return stats.favorsGiven;
      case 'favorsReceived':
        return stats.favorsReceived;
      case 'activity':
        return stats.recentActivity;
      default:
        return 0;
    }
  };

  const getGrowthIndicator = () => {
    if (type !== 'activity') return null;
    
    const growth = stats.weeklyGrowth;
    
    if (growth > 0) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-200">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{growth}%
        </Badge>
      );
    } else if (growth < 0) {
      return (
        <Badge variant="outline" className="text-red-600 border-red-200">
          <TrendingDown className="h-3 w-3 mr-1" />
          {growth}%
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-200">
          <Minus className="h-3 w-3 mr-1" />
          0%
        </Badge>
      );
    }
  };

  const formatValue = (value: number) => {
    if (format === 'percentage') {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded" />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded w-12" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{formatValue(getValue())}</p>
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
        
        {type === 'activity' && (
          <div className="mt-4 flex items-center gap-2">
            {getGrowthIndicator()}
            <span className="text-xs text-muted-foreground">vs last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
