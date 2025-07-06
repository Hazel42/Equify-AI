
import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  return (
    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
      <Sun className="h-4 w-4" />
      <span className="sr-only">Light mode active</span>
    </Button>
  );
};
