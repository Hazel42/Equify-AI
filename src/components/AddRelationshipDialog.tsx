
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useRelationships } from "@/hooks/useRelationships";

interface AddRelationshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddRelationshipDialog = ({ open, onOpenChange }: AddRelationshipDialogProps) => {
  const [name, setName] = useState("");
  const [relationshipType, setRelationshipType] = useState("");
  const [importanceLevel, setImportanceLevel] = useState([3]);
  const [loading, setLoading] = useState(false);
  const { addRelationship } = useRelationships();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !relationshipType) return;

    setLoading(true);
    try {
      await addRelationship.mutateAsync({
        name,
        relationship_type: relationshipType,
        importance_level: importanceLevel[0]
      });
      
      // Reset form
      setName("");
      setRelationshipType("");
      setImportanceLevel([3]);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add relationship:', error);
    } finally {
      setLoading(false);
    }
  };

  const relationshipTypes = [
    { value: "family", label: "Family" },
    { value: "friend", label: "Friend" },
    { value: "colleague", label: "Colleague" },
    { value: "partner", label: "Partner" },
    { value: "mentor", label: "Mentor" },
    { value: "acquaintance", label: "Acquaintance" },
    { value: "other", label: "Other" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Relationship</DialogTitle>
          <DialogDescription>
            Add someone important to your relationship network.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter person's name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Relationship Type</Label>
            <Select value={relationshipType} onValueChange={setRelationshipType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship type" />
              </SelectTrigger>
              <SelectContent>
                {relationshipTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Importance Level: {importanceLevel[0]}/5</Label>
            <Slider
              value={importanceLevel}
              onValueChange={setImportanceLevel}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading || !name || !relationshipType}>
              {loading ? 'Adding...' : 'Add Relationship'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
