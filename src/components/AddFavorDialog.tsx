
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DollarSign, Clock, Heart, Briefcase, Brain } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavors } from "@/hooks/useFavors";
import { useAuth } from "@/hooks/useAuth";
import { useAutoAI } from "@/hooks/useAutoAI";
import { useToast } from "@/hooks/use-toast";

interface AddFavorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (favorData: any) => void;
}

export const AddFavorDialog = ({ open, onOpenChange, onSave }: AddFavorDialogProps) => {
  const [favorData, setFavorData] = useState({
    relationship_id: "",
    direction: "received" as "received" | "given",
    category: "",
    description: "",
    estimated_value: "",
    emotional_weight: 3,
    context: ""
  });
  const [triggerAI, setTriggerAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const { user } = useAuth();
  const { relationships } = useRelationships();
  const { createFavor } = useFavors();
  const { toast } = useToast();

  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);

  const { loading: aiLoading } = useAutoAI({
    userId: user?.id || "",
    relationshipId: favorData.relationship_id,
    triggerAnalysis: triggerAI,
    onComplete: (success) => {
      if (success) {
        toast({
          title: 'AI Analysis Complete',
          description: 'Generated new insights based on this interaction.',
        });
        window.dispatchEvent(new CustomEvent("ai-recommendation-updated"));
        setAiError(null);
      } else {
        setAiError('AI analysis failed. You can try again later.');
      }
    }
  });

  const categories = [
    { id: "financial", label: "Financial", icon: DollarSign, description: "Money, loans, purchases" },
    { id: "time", label: "Time & Effort", icon: Clock, description: "Help with tasks, time spent" },
    { id: "emotional", label: "Emotional", icon: Heart, description: "Support, listening, advice" },
    { id: "professional", label: "Professional", icon: Briefcase, description: "Work opportunities, introductions" }
  ];

  const handleSave = async () => {
    if (!favorData.relationship_id || !favorData.category || !favorData.description) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: "destructive",
      });
      return;
    }

    try {
      setAiError(null);
      console.log('💾 Saving favor...');
      await createFavor.mutateAsync({
        relationship_id: favorData.relationship_id,
        direction: favorData.direction,
        category: favorData.category,
        description: favorData.description,
        estimated_value: favorData.estimated_value ? parseFloat(favorData.estimated_value) : undefined,
        emotional_weight: favorData.emotional_weight,
        context: favorData.context || undefined,
        date_occurred: new Date().toISOString().split('T')[0],
        reciprocated: false,
      });

      console.log('✅ Favor saved, triggering AI analysis...');
      setTriggerAI(true);

      onSave(favorData);

      setFavorData({
        relationship_id: "",
        direction: "received",
        category: "",
        description: "",
        estimated_value: "",
        emotional_weight: 3,
        context: ""
      });

      setTimeout(() => setTriggerAI(false), 2000);

      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
      refreshTimeout.current = setTimeout(() => {
        window.dispatchEvent(new CustomEvent("favor-added"));
      }, 1500);

    } catch (error) {
      console.error('❌ Error saving favor:', error);
      toast({
        title: 'Error',
        description: 'Failed to save favor. Please try again.',
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            Record Favor
            {aiLoading && (
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <Brain className="h-4 w-4 animate-pulse" />
                Analyzing...
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            Track favors to understand your relationship dynamics better.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] px-1">
          <div className="space-y-6">
            {/* Direction Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">What happened?</Label>
              <RadioGroup 
                value={favorData.direction} 
                onValueChange={(value: "received" | "given") => setFavorData({...favorData, direction: value})}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div className="flex items-center space-x-3 bg-green-50 p-4 rounded-lg border border-green-200">
                  <RadioGroupItem value="received" id="received" />
                  <Label htmlFor="received" className="text-green-700 font-medium cursor-pointer">
                    I received a favor
                  </Label>
                </div>
                <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <RadioGroupItem value="given" id="given" />
                  <Label htmlFor="given" className="text-blue-700 font-medium cursor-pointer">
                    I gave a favor
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Person Selection */}
            <div className="space-y-2">
              <Label htmlFor="person" className="text-sm font-medium">Person *</Label>
              <Select onValueChange={(value) => setFavorData({...favorData, relationship_id: value})}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((relationship) => (
                    <SelectItem key={relationship.id} value={relationship.id}>
                      {relationship.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {relationships.length === 0 && (
                <p className="text-xs text-gray-500">
                  No relationships added yet. Add one first!
                </p>
              )}
            </div>

            {/* Category Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Category *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = favorData.category === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setFavorData({...favorData, category: category.id})}
                      className={`p-4 border rounded-lg text-left transition-all hover:shadow-sm ${
                        isSelected 
                          ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-sm">{category.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">{category.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
              <Textarea
                id="description"
                placeholder={favorData.direction === "received" 
                  ? "What did they do for you?"
                  : "What did you do for them?"
                }
                value={favorData.description}
                onChange={(e) => setFavorData({...favorData, description: e.target.value})}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Value and Emotional Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value" className="text-sm font-medium">Estimated Value</Label>
                <Input
                  id="value"
                  placeholder="e.g., $50 or 2 hours"
                  value={favorData.estimated_value}
                  onChange={(e) => setFavorData({...favorData, estimated_value: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Emotional Impact ({favorData.emotional_weight}/5)</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFavorData({...favorData, emotional_weight: level})}
                      className={`p-2 rounded-lg border transition-colors ${
                        favorData.emotional_weight >= level 
                          ? 'bg-red-100 text-red-600 border-red-300' 
                          : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Context */}
            <div className="space-y-2">
              <Label htmlFor="context" className="text-sm font-medium">Additional Context</Label>
              <Textarea
                id="context"
                placeholder="Any additional details about the situation..."
                value={favorData.context}
                onChange={(e) => setFavorData({...favorData, context: e.target.value})}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* AI Status */}
            {(aiLoading || aiError) && (
              <div className={`rounded-lg p-4 ${aiLoading ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'}`}>
                {aiLoading ? (
                  <div className="flex items-center gap-2 text-blue-700">
                    <Brain className="h-4 w-4 animate-pulse" />
                    <span className="text-sm font-medium">AI is analyzing this interaction...</span>
                  </div>
                ) : (
                  <div className="text-red-600 text-sm">
                    {aiError}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={
                !favorData.relationship_id ||
                !favorData.category ||
                !favorData.description ||
                createFavor.isPending ||
                aiLoading
              }
            >
              {createFavor.isPending
                ? 'Saving...'
                : aiLoading
                ? 'Analyzing with AI...'
                : 'Save Favor'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={createFavor.isPending || aiLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
