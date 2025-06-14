
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Trash2, Edit, Archive, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BulkOperationsProps {
  selectedItems: string[];
  totalItems: number;
  onSelectAll: (selected: boolean) => void;
  onClearSelection: () => void;
  onBulkUpdate: (operation: string, data?: any) => void;
}

export const BulkOperationsPanel = ({
  selectedItems,
  totalItems,
  onSelectAll,
  onClearSelection,
  onBulkUpdate
}: BulkOperationsProps) => {
  const [bulkOperation, setBulkOperation] = useState("");
  const { toast } = useToast();

  const handleBulkAction = (operation: string) => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to perform bulk operations.",
        variant: "destructive"
      });
      return;
    }

    switch (operation) {
      case "delete":
        if (confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
          onBulkUpdate("delete");
          toast({
            title: "Items deleted",
            description: `Successfully deleted ${selectedItems.length} items.`
          });
        }
        break;
      case "archive":
        onBulkUpdate("archive");
        toast({
          title: "Items archived",
          description: `Successfully archived ${selectedItems.length} items.`
        });
        break;
      case "export":
        onBulkUpdate("export");
        toast({
          title: "Export started",
          description: `Exporting ${selectedItems.length} items...`
        });
        break;
      default:
        onBulkUpdate(operation);
    }

    onClearSelection();
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg text-blue-900">
                Bulk Operations
              </CardTitle>
              <CardDescription>
                {selectedItems.length} of {totalItems} items selected
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectAll(true)}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("delete")}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("archive")}
            className="flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            Archive
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction("export")}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Select onValueChange={setBulkOperation}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="More actions..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="update-category">Update Category</SelectItem>
              <SelectItem value="update-priority">Update Priority</SelectItem>
              <SelectItem value="add-tags">Add Tags</SelectItem>
              <SelectItem value="mark-completed">Mark Completed</SelectItem>
            </SelectContent>
          </Select>

          {bulkOperation && (
            <Button
              size="sm"
              onClick={() => handleBulkAction(bulkOperation)}
            >
              Apply
            </Button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Badge variant="secondary">
            {selectedItems.length} selected
          </Badge>
          <span className="text-sm text-gray-600">
            Actions will be applied to all selected items
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
