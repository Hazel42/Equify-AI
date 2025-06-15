
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Brain, Plus, ArrowRight, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavors } from "@/hooks/useFavors";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuickSetupGuideProps {
  onAddRelationship: () => void;
  onAddFavor: () => void;
  onGenerateAI: () => void;
}

export const QuickSetupGuide = ({ onAddRelationship, onAddFavor, onGenerateAI }: QuickSetupGuideProps) => {
  const [creatingDemo, setCreatingDemo] = useState(false);
  const { user } = useAuth();
  const { relationships } = useRelationships();
  const { favors } = useFavors();
  const { toast } = useToast();

  const hasRelationships = relationships.length > 0;
  const hasFavors = favors.length > 0;
  const hasAIRecommendations = favors.length >= 2; // Simple check

  const steps = [
    {
      id: 'relationships',
      title: 'Add Your First Relationship',
      description: 'Start by adding people you interact with regularly',
      completed: hasRelationships,
      action: onAddRelationship,
      icon: Users,
      buttonText: 'Add Relationship'
    },
    {
      id: 'favors',
      title: 'Record Some Interactions',
      description: 'Log favors given and received to build your history',
      completed: hasFavors,
      action: onAddFavor,
      icon: Plus,
      buttonText: 'Add Favor',
      disabled: !hasRelationships
    },
    {
      id: 'ai',
      title: 'Get AI Recommendations',
      description: 'Let AI analyze your relationships and suggest improvements',
      completed: hasAIRecommendations,
      action: onGenerateAI,
      icon: Brain,
      buttonText: 'Generate AI Insights',
      disabled: !hasFavors
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const createDemoData = async () => {
    if (!user) return;
    
    setCreatingDemo(true);
    try {
      // Create sample relationships
      const sampleRelationships = [
        { name: 'Sarah Johnson', type: 'colleague', importance: 4 },
        { name: 'Mike Chen', type: 'friend', importance: 5 },
        { name: 'Lisa Rodriguez', type: 'family', importance: 5 }
      ];

      const { data: createdRelationships, error: relError } = await supabase
        .from('relationships')
        .insert(sampleRelationships.map(rel => ({
          ...rel,
          user_id: user.id,
          relationship_type: rel.type,
          importance_level: rel.importance
        })))
        .select();

      if (relError) throw relError;

      // Create sample favors
      if (createdRelationships && createdRelationships.length > 0) {
        const sampleFavors = [
          {
            relationship_id: createdRelationships[0].id,
            direction: 'given',
            category: 'professional',
            description: 'Helped with project presentation',
            emotional_weight: 3,
            date_occurred: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            relationship_id: createdRelationships[1].id,
            direction: 'received',
            category: 'personal',
            description: 'Gave advice on career change',
            emotional_weight: 4,
            date_occurred: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            relationship_id: createdRelationships[2].id,
            direction: 'given',
            category: 'family',
            description: 'Helped move to new apartment',
            emotional_weight: 5,
            date_occurred: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ];

        const { error: favorError } = await supabase
          .from('favors')
          .insert(sampleFavors.map(favor => ({
            ...favor,
            user_id: user.id
          })));

        if (favorError) throw favorError;
      }

      toast({
        title: "Demo Data Created! 🎉",
        description: "Sample relationships and favors have been added. Now you can try the AI features!",
      });

      // Refresh the page to show new data
      window.location.reload();

    } catch (error) {
      console.error('Error creating demo data:', error);
      toast({
        title: "Error Creating Demo Data",
        description: "There was an issue setting up the demo. Please try adding data manually.",
        variant: "destructive"
      });
    } finally {
      setCreatingDemo(false);
    }
  };

  if (completedSteps === steps.length) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-700">
            <CheckCircle className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Setup Complete!</h3>
              <p className="text-sm">Your reciprocity tracking system is ready. Explore the AI recommendations!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          Quick Setup Guide
        </CardTitle>
        <CardDescription>
          Get started with AI-powered relationship insights in 3 easy steps
        </CardDescription>
        <div className="mt-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{completedSteps}/{steps.length} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className={`flex items-center gap-4 p-3 rounded-lg border ${
            step.completed ? 'bg-green-50 border-green-200' : 
            step.disabled ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
          }`}>
            <div className={`p-2 rounded-full ${
              step.completed ? 'bg-green-100 text-green-600' :
              step.disabled ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'
            }`}>
              {step.completed ? <CheckCircle className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
            </div>
            
            <div className="flex-1">
              <h4 className={`font-medium ${step.disabled ? 'text-gray-400' : 'text-gray-900'}`}>
                {step.title}
              </h4>
              <p className={`text-sm ${step.disabled ? 'text-gray-400' : 'text-gray-600'}`}>
                {step.description}
              </p>
            </div>

            {!step.completed && (
              <Button 
                onClick={step.action}
                disabled={step.disabled}
                size="sm"
                className={step.disabled ? '' : 'bg-blue-600 hover:bg-blue-700'}
              >
                {step.buttonText}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}

            {step.completed && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Done
              </Badge>
            )}
          </div>
        ))}

        {!hasRelationships && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Want to try it quickly?</h4>
            <p className="text-sm text-blue-700 mb-3">
              Create sample relationships and favors to experience the AI features immediately.
            </p>
            <Button 
              onClick={createDemoData}
              disabled={creatingDemo}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              {creatingDemo ? 'Creating...' : 'Create Demo Data'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
