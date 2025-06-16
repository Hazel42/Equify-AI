
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRelationships } from "@/hooks/useRelationships";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAutoAI } from "@/hooks/useAutoAI";
import { Brain } from "lucide-react";

interface AddRelationshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (relationshipData: any) => void;
}

export const AddRelationshipDialog = ({ open, onOpenChange, onSave }: AddRelationshipDialogProps) => {
  const [relationshipData, setRelationshipData] = useState({
    name: "",
    relationship_type: "",
    importance_level: 3,
    contact_info: {},
    preferences: {}
  });

  const { addRelationship } = useRelationships();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [newRelationshipId, setNewRelationshipId] = useState<string | null>(null);
  const [triggerAI, setTriggerAI] = useState(false);

  const { loading: aiLoading } = useAutoAI({
    userId: user?.id || "",
    relationshipId: newRelationshipId || undefined,
    triggerAnalysis: triggerAI,
    onComplete: (success) => {
      setTriggerAI(false);
      setNewRelationshipId(null);
      if (success) {
        window.dispatchEvent(new CustomEvent("ai-recommendation-updated"));
        toast({
          title: 'AI Analysis Complete',
          description: 'Generated insights for your new relationship.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'AI analysis failed. You can try again later.',
          variant: "destructive",
        });
      }
    }
  });

  const handleSave = async () => {
    if (!relationshipData.name || !relationshipData.relationship_type) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in the name and relationship type.',
        variant: "destructive",
      });
      return;
    }

    try {
      const newRelationship = await addRelationship.mutateAsync(relationshipData);
      onSave(newRelationship);
      setNewRelationshipId(newRelationship.id);
      setTriggerAI(true);
      
      setRelationshipData({
        name: "",
        relationship_type: "",
        importance_level: 3,
        contact_info: {},
        preferences: {}
      });
    } catch (error) {
      console.error('Error saving relationship:', error);
      toast({
        title: 'Error',
        description: 'Failed to save relationship. Please try again.',
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Relationship</DialogTitle>
          <DialogDescription>
            Add someone important to your life and start tracking your interactions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter their name"
              value={relationshipData.name}
              onChange={(e) => setRelationshipData({...relationshipData, name: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="type">Relationship Type</Label>
            <Select onValueChange={(value) => setRelationshipData({...relationshipData, relationship_type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="friend">Friend</SelectItem>
                <SelectItem value="colleague">Colleague</SelectItem>
                <SelectItem value="neighbor">Neighbor</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Importance Level: {relationshipData.importance_level}/5</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setRelationshipData({...relationshipData, importance_level: level})}
                  className={`p-2 rounded ${
                    relationshipData.importance_level >= level 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!relationshipData.name || !relationshipData.relationship_type || addRelationship.isPending || aiLoading}
            >
              {addRelationship.isPending ? 'Saving...' : 
               aiLoading ? (
                  <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 animate-pulse" />
                      Analyzing...
                  </div>
               ) :
               'Save Relationship'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={addRelationship.isPending || aiLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
