
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
  className?: string;
}

export const EmptyStateCard = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  onAction,
  className = ""
}: EmptyStateCardProps) => {
  return (
    <Card className={`text-center ${className}`}>
      <CardContent className="pt-8 pb-6">
        <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">{description}</p>
        <Button onClick={onAction} className="bg-green-600 hover:bg-green-700">
          {actionText}
        </Button>
      </CardContent>
    </Card>
  );
};
