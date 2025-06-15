
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
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

  // Ref for debouncing recommendations refresh
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);

  // Auto AI hook - trigger on favor save; refresh recommendation after
  const { loading: aiLoading } = useAutoAI({
    userId: user?.id || "",
    relationshipId: favorData.relationship_id,
    triggerAnalysis: triggerAI,
    onComplete: (success) => {
      // If AI finished, propagate up/refresh data (assume parent listeners or next steps)
      if (success) {
        toast({
          title: t('toast.aiAnalysisComplete'),
          description: t('toast.aiAnalysisCompleteDesc'),
        });
        // Signal a global event so recommendations and dashboard can refetch (simple approach)
        window.dispatchEvent(new CustomEvent("ai-recommendation-updated"));
        setAiError(null);
      } else {
        setAiError(t('toast.aiAutoAnalysisError'));
      }
    }
  });

  const categories = [
    { id: "financial", label: t('addFavor.categories.financial'), icon: DollarSign, description: t('addFavor.categories.financialDesc') },
    { id: "time", label: t('addFavor.categories.time'), icon: Clock, description: t('addFavor.categories.timeDesc') },
    { id: "emotional", label: t('addFavor.categories.emotional'), icon: Heart, description: t('addFavor.categories.emotionalDesc') },
    { id: "professional", label: t('addFavor.categories.professional'), icon: Briefcase, description: t('addFavor.categories.professionalDesc') }
  ];

  const handleSave = async () => {
    if (!favorData.relationship_id || !favorData.category || !favorData.description) {
      toast({
        title: t('toast.missingInfo'),
        description: t('toast.missingInfoDesc'),
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

      // Debounce: give time for AI/favors to process, then trigger dashboard refresh
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
      refreshTimeout.current = setTimeout(() => {
        window.dispatchEvent(new CustomEvent("favor-added"));
      }, 1500);

    } catch (error) {
      console.error('❌ Error saving favor:', error);
      toast({
        title: t('common.error'),
        description: t('toast.errorSavingFavor'),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl h-[90vh] max-h-[600px] p-0 gap-0">
        <div className="flex flex-col h-full">
          {/* Header - Fixed */}
          <DialogHeader className="p-4 pb-2 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg">
              {t('addFavor.title')}
              {aiLoading && (
                <div className="flex items-center gap-1 text-sm text-blue-600">
                  <Brain className="h-4 w-4 animate-pulse" />
                  {t('dashboard.analyzing')}
                </div>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t('addFavor.description')}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Direction Selection */}
            <div>
              <Label className="text-base font-medium">{t('addFavor.whatHappened')}</Label>
              <RadioGroup 
                value={favorData.direction} 
                onValueChange={(value: "received" | "given") => setFavorData({...favorData, direction: value})}
                className="flex flex-col sm:flex-row gap-3 mt-2"
              >
                <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg border border-green-200 flex-1">
                  <RadioGroupItem value="received" id="received" />
                  <Label htmlFor="received" className="text-green-700 font-medium text-sm">
                    {t('addFavor.receivedFavor')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg border border-blue-200 flex-1">
                  <RadioGroupItem value="given" id="given" />
                  <Label htmlFor="given" className="text-blue-700 font-medium text-sm">
                    {t('addFavor.gaveFavor')}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Person Selection */}
            <div>
              <Label htmlFor="person">{t('addFavor.person')}</Label>
              <Select onValueChange={(value) => setFavorData({...favorData, relationship_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t('addFavor.selectPerson')} />
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
                <p className="text-sm text-gray-500 mt-1">
                  {t('addFavor.noRelationships')}
                </p>
              )}
            </div>

            {/* Category Selection */}
            <div>
              <Label className="text-base font-medium">{t('addFavor.category')}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = favorData.category === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setFavorData({...favorData, category: category.id})}
                      className={`p-3 border rounded-lg text-left transition-all ${
                        isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="h-4 w-4" />
                        <span className="font-medium text-sm">{category.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">{category.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">{t('addFavor.description')}</Label>
              <Textarea
                id="description"
                placeholder={favorData.direction === "received" 
                  ? t('addFavor.descriptionPlaceholderReceived')
                  : t('addFavor.descriptionPlaceholderGiven')
                }
                value={favorData.description}
                onChange={(e) => setFavorData({...favorData, description: e.target.value})}
                rows={3}
                className="text-sm"
              />
            </div>

            {/* Value and Emotional Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value">{t('addFavor.estimatedValue')}</Label>
                <Input
                  id="value"
                  placeholder={t('addFavor.valuePlaceholder')}
                  value={favorData.estimated_value}
                  onChange={(e) => setFavorData({...favorData, estimated_value: e.target.value})}
                  className="text-sm"
                />
              </div>
              <div>
                <Label>{t('addFavor.emotionalImpact')}</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFavorData({...favorData, emotional_weight: level})}
                      className={`p-2 rounded ${
                        favorData.emotional_weight >= level 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Heart className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Context */}
            <div>
              <Label htmlFor="context">{t('addFavor.context')}</Label>
              <Textarea
                id="context"
                placeholder={t('addFavor.contextPlaceholder')}
                value={favorData.context}
                onChange={(e) => setFavorData({...favorData, context: e.target.value})}
                rows={2}
                className="text-sm"
              />
            </div>

            {/* AI Status */}
            {aiLoading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <Brain className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">{t('addFavor.aiAnalyzing')}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {t('addFavor.aiAnalyzingDesc')}
                </p>
                {aiError && (
                  <div className="text-red-600 border border-red-300 mt-2 rounded p-2 bg-white/80 text-xs">
                    {aiError}
                  </div>
                )}
              </div>
            )}
            {aiError && !aiLoading && (
              <div className="text-red-600 border border-red-300 mt-2 rounded p-2 bg-white/80 text-xs">
                {aiError}
              </div>
            )}
          </div>

          {/* Footer - Fixed */}
          <div className="border-t p-4 shrink-0">
            <div className="flex gap-3">
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
                  ? t('common.saving')
                  : aiLoading
                  ? t('addFavor.analyzingWithAI')
                  : t('addFavor.saveFavor')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={createFavor.isPending || aiLoading}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
