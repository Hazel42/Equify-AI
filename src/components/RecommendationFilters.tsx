
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

export const RecommendationFilters = ({ 
  filterTypes, 
  activeFilter, 
  onFilterChange 
}: RecommendationFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filterTypes.map((type) => (
        <Button
          key={type.key}
          variant={activeFilter === type.key ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(type.key)}
          className="flex items-center gap-2"
        >
          {type.label}
          <Badge variant="secondary" className="text-xs">
            {type.count}
          </Badge>
        </Button>
      ))}
    </div>
  );
};
