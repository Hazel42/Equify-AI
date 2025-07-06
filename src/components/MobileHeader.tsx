
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { NotificationCenter } from "@/components/NotificationCenter";

interface MobileHeaderProps {
  title: string;
}

export const MobileHeader = ({ title }: MobileHeaderProps) => {
  const { signOut } = useAuth();

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-gray-600 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
