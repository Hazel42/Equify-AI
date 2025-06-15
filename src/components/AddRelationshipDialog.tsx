
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRelationships } from "@/hooks/useRelationships";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
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
          title: t('toast.aiAnalysisComplete'),
          description: t('toast.aiAnalysisCompleteDesc'),
        });
      } else {
        toast({
          title: t('common.error'),
          description: t('toast.aiAutoAnalysisError'),
          variant: "destructive",
        });
      }
    }
  });


  const handleSave = async () => {
    if (!relationshipData.name || !relationshipData.relationship_type) {
      toast({
        title: t('toast.missingInfo'),
        description: t('toast.missingInfoDesc'),
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
        title: t('common.error'),
        description: t('toast.errorSavingRelationship'),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('addRelationship.title')}</DialogTitle>
          <DialogDescription>
            {t('addRelationship.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">{t('addRelationship.nameLabel')}</Label>
            <Input
              id="name"
              placeholder={t('addRelationship.namePlaceholder')}
              value={relationshipData.name}
              onChange={(e) => setRelationshipData({...relationshipData, name: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="type">{t('addRelationship.typeLabel')}</Label>
            <Select onValueChange={(value) => setRelationshipData({...relationshipData, relationship_type: value})}>
              <SelectTrigger>
                <SelectValue placeholder={t('addRelationship.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="family">{t('addRelationship.relationshipTypes.family')}</SelectItem>
                <SelectItem value="friend">{t('addRelationship.relationshipTypes.friend')}</SelectItem>
                <SelectItem value="colleague">{t('addRelationship.relationshipTypes.colleague')}</SelectItem>
                <SelectItem value="neighbor">{t('addRelationship.relationshipTypes.neighbor')}</SelectItem>
                <SelectItem value="mentor">{t('addRelationship.relationshipTypes.mentor')}</SelectItem>
                <SelectItem value="other">{t('addRelationship.relationshipTypes.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('addRelationship.importanceLabel', { level: relationshipData.importance_level })}</Label>
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
              {addRelationship.isPending ? t('common.saving') : 
               aiLoading ? (
                  <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 animate-pulse" />
                      {t('dashboard.analyzing')}
                  </div>
               ) :
               t('addRelationship.saveButton')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={addRelationship.isPending || aiLoading}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
