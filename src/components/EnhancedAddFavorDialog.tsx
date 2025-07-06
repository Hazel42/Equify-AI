import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Gift,
  DollarSign,
  Clock,
  Users,
  Brain,
  Briefcase,
  Home,
  GraduationCap,
  Coffee,
} from "lucide-react";
import { motion } from "framer-motion";
import { useFavorsEnhanced } from "@/hooks/useFavorsEnhanced";
import { useRelationships } from "@/hooks/useRelationships";

interface EnhancedAddFavorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relationshipId?: string | null;
  onSuccess?: () => void;
}

export const EnhancedAddFavorDialog = ({
  open,
  onOpenChange,
  relationshipId,
  onSuccess,
}: EnhancedAddFavorDialogProps) => {
  const [favorData, setFavorData] = useState({
    relationship_id: relationshipId || "",
    direction: "given" as "given" | "received",
    category: "",
    description: "",
    emotional_weight: [3],
    estimated_value: "",
    context: "",
  });

  const { addFavor } = useFavorsEnhanced();
  const { relationships } = useRelationships();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFavorData({
        relationship_id: relationshipId || "",
        direction: "given",
        category: "",
        description: "",
        emotional_weight: [3],
        estimated_value: "",
        context: "",
      });
    }
  }, [open, relationshipId]);

  const categories = [
    {
      value: "help",
      label: "Help & Support",
      icon: Heart,
      description: "Physical help, assistance with tasks",
      color: "bg-red-50 border-red-200 text-red-700",
    },
    {
      value: "financial",
      label: "Financial",
      icon: DollarSign,
      description: "Money, loans, payments, gifts",
      color: "bg-green-50 border-green-200 text-green-700",
    },
    {
      value: "time",
      label: "Time & Effort",
      icon: Clock,
      description: "Time spent, effort invested",
      color: "bg-blue-50 border-blue-200 text-blue-700",
    },
    {
      value: "professional",
      label: "Professional",
      icon: Briefcase,
      description: "Work opportunities, career help",
      color: "bg-purple-50 border-purple-200 text-purple-700",
    },
    {
      value: "emotional",
      label: "Emotional Support",
      icon: Users,
      description: "Listening, advice, comfort",
      color: "bg-pink-50 border-pink-200 text-pink-700",
    },
    {
      value: "social",
      label: "Social",
      icon: Coffee,
      description: "Introductions, networking, events",
      color: "bg-orange-50 border-orange-200 text-orange-700",
    },
    {
      value: "education",
      label: "Learning",
      icon: GraduationCap,
      description: "Teaching, mentoring, sharing knowledge",
      color: "bg-indigo-50 border-indigo-200 text-indigo-700",
    },
    {
      value: "household",
      label: "Household",
      icon: Home,
      description: "Home-related help, maintenance",
      color: "bg-teal-50 border-teal-200 text-teal-700",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !favorData.relationship_id ||
      !favorData.description ||
      !favorData.category
    ) {
      return;
    }

    try {
      await addFavor.mutateAsync({
        relationship_id: favorData.relationship_id,
        description: favorData.description,
        category: favorData.category,
        direction: favorData.direction,
        emotional_weight: favorData.emotional_weight[0],
        estimated_value: favorData.estimated_value
          ? parseFloat(favorData.estimated_value)
          : null,
        context: favorData.context || null,
        date_occurred: new Date().toISOString().split("T")[0],
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to add favor:", error);
    }
  };

  const selectedCategory = categories.find(
    (cat) => cat.value === favorData.category,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            Record a Favor
          </DialogTitle>
          <DialogDescription>
            Track the give and take in your relationships to maintain healthy
            balance.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]"
        >
          {/* Direction Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">What happened?</Label>
            <RadioGroup
              value={favorData.direction}
              onValueChange={(value: "given" | "received") =>
                setFavorData({ ...favorData, direction: value })
              }
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    favorData.direction === "given"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem
                    value="given"
                    id="given"
                    className="sr-only"
                  />
                  <Label htmlFor="given" className="cursor-pointer">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Gift className="h-6 w-6 text-green-600" />
                      </div>
                      <span className="font-medium">I Gave a Favor</span>
                      <span className="text-xs text-gray-600">
                        I helped someone
                      </span>
                    </div>
                  </Label>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    favorData.direction === "received"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem
                    value="received"
                    id="received"
                    className="sr-only"
                  />
                  <Label htmlFor="received" className="cursor-pointer">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Heart className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="font-medium">I Received a Favor</span>
                      <span className="text-xs text-gray-600">
                        Someone helped me
                      </span>
                    </div>
                  </Label>
                </motion.div>
              </div>
            </RadioGroup>
          </div>

          {/* Person Selection */}
          <div className="space-y-2">
            <Label htmlFor="person">Person *</Label>
            <Select
              value={favorData.relationship_id}
              onValueChange={(value) =>
                setFavorData({ ...favorData, relationship_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                {relationships?.map((relationship) => (
                  <SelectItem key={relationship.id} value={relationship.id}>
                    <div className="flex items-center gap-2">
                      <span>{relationship.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {relationship.relationship_type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label>Category *</Label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isSelected = favorData.category === category.value;

                return (
                  <motion.button
                    key={category.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setFavorData({ ...favorData, category: category.value })
                    }
                    className={`p-3 border rounded-lg text-left transition-all ${
                      isSelected
                        ? category.color + " ring-2 ring-offset-1 ring-current"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {category.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {category.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder={
                favorData.direction === "given"
                  ? "What did you do for them?"
                  : "What did they do for you?"
              }
              value={favorData.description}
              onChange={(e) =>
                setFavorData({ ...favorData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Emotional Weight and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Emotional Impact: {favorData.emotional_weight[0]}/5</Label>
              <Slider
                value={favorData.emotional_weight}
                onValueChange={(value) =>
                  setFavorData({ ...favorData, emotional_weight: value })
                }
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Minor</span>
                <span>Significant</span>
                <span>Major</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Estimated Value (Optional)</Label>
              <Input
                id="value"
                type="text"
                placeholder="e.g., $50, 2 hours"
                value={favorData.estimated_value}
                onChange={(e) =>
                  setFavorData({
                    ...favorData,
                    estimated_value: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Context */}
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (Optional)</Label>
            <Textarea
              id="context"
              placeholder="Any extra details about the situation..."
              value={favorData.context}
              onChange={(e) =>
                setFavorData({ ...favorData, context: e.target.value })
              }
              rows={2}
            />
          </div>

          {/* Preview Card */}
          {favorData.description && selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-50 rounded-lg border"
            >
              <Label className="text-sm font-medium text-gray-700">
                Preview:
              </Label>
              <div className="mt-2 flex items-center gap-2">
                <selectedCategory.icon className="h-4 w-4 text-gray-600" />
                <span className="text-sm">
                  {favorData.direction === "given"
                    ? "You helped"
                    : "They helped you"}
                  : {favorData.description}
                </span>
                <Badge variant="secondary" className="text-xs">
                  Impact: {favorData.emotional_weight[0]}/5
                </Badge>
              </div>
            </motion.div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={
                addFavor.isPending ||
                !favorData.relationship_id ||
                !favorData.description ||
                !favorData.category
              }
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {addFavor.isPending ? "Recording..." : "Record Favor"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
