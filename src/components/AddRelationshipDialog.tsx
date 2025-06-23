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
import { Brain, Star } from "lucide-react";

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
      <DialogContent className="max-w-md mx-4 sm:mx-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            Add New Relationship
            {aiLoading && (
              <Brain className="h-4 w-4 animate-pulse text-blue-600 dark:text-blue-400" aria-label="AI analyzing" />
            )}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
            Add someone important to your life and start tracking your interactions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Name *
            </Label>
            <Input
              id="name"
              placeholder="Enter their name"
              value={relationshipData.name}
              onChange={(e) => setRelationshipData({...relationshipData, name: e.target.value})}
              className="w-full"
              aria-required="true"
              disabled={addRelationship.isPending || aiLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Relationship Type *
            </Label>
            <Select 
              onValueChange={(value) => setRelationshipData({...relationshipData, relationship_type: value})}
              disabled={addRelationship.isPending || aiLoading}
            >
              <SelectTrigger id="type" aria-required="true">
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

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Importance Level: {relationshipData.importance_level}/5
            </Label>
            <div className="flex gap-2 justify-center sm:justify-start">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setRelationshipData({...relationshipData, importance_level: level})}
                  disabled={addRelationship.isPending || aiLoading}
                  className={`p-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 ${
                    relationshipData.importance_level >= level 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 border-green-300 dark:border-green-700 scale-110' 
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
                  }`}
                  aria-label={`Set importance level to ${level}`}
                >
                  <Star className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {aiLoading && (
            <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-3" role="status" aria-live="polite">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Brain className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">AI is analyzing this relationship...</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={handleSave}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 focus:ring-green-500"
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
              className="w-full border-gray-300 dark:border-gray-600"
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
