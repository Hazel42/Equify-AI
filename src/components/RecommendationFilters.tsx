
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface FilterType {
  key: string;
  label: string;
  count: number;
}

interface RecommendationFiltersProps {
  filterTypes: FilterType[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const RecommendationFilters = ({ filterTypes, activeFilter, onFilterChange }: RecommendationFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filterTypes.map(filter => (
        filter.count > 0 &&
        <Button
          key={filter.key}
          variant={activeFilter === filter.key ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.key)}
          className="flex items-center gap-2"
        >
          {filter.key === 'ai' && <Sparkles className="h-3 w-3" />}
          {filter.label}
          <Badge variant="secondary" className="ml-1">
            {filter.count}
          </Badge>
        </Button>
      ))}
    </div>
  );
};
