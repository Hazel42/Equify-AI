
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Heart, ArrowRight, ArrowLeft } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

interface OnboardingFlowProps {
  onComplete: () => void;
}

const personalityQuestions = [
  {
    id: "reciprocity_awareness",
    question: "How aware are you of reciprocity in your relationships?",
    options: [
      { value: "very_aware", label: "Very aware - I always notice who gives and receives" },
      { value: "somewhat_aware", label: "Somewhat aware - I notice sometimes" },
      { value: "not_very_aware", label: "Not very aware - I don't think about it much" },
      { value: "unaware", label: "Unaware - I've never really considered this" }
    ]
  },
  {
    id: "giving_style",
    question: "What's your natural giving style?",
    options: [
      { value: "spontaneous_giver", label: "Spontaneous giver - I help when I see a need" },
      { value: "planned_giver", label: "Planned giver - I like to think about what to give" },
      { value: "responsive_giver", label: "Responsive giver - I give back when others give to me" },
      { value: "careful_giver", label: "Careful giver - I'm selective about when I give" }
    ]
  },
  {
    id: "social_anxiety",
    question: "How do you feel about social obligations?",
    options: [
      { value: "comfortable", label: "Comfortable - I'm at ease with social expectations" },
      { value: "sometimes_anxious", label: "Sometimes anxious - It depends on the situation" },
      { value: "often_anxious", label: "Often anxious - I worry about doing the right thing" },
      { value: "very_anxious", label: "Very anxious - Social obligations stress me out" }
    ]
  },
  {
    id: "relationship_priority",
    question: "What's most important to you in relationships?",
    options: [
      { value: "balance", label: "Balance - Equal give and take" },
      { value: "connection", label: "Connection - Deep emotional bonds" },
      { value: "support", label: "Support - Being there for each other" },
      { value: "growth", label: "Growth - Helping each other improve" }
    ]
  },
  {
    id: "reciprocity_concern",
    question: "What concerns you most about reciprocity?",
    options: [
      { value: "being_used", label: "Being taken advantage of" },
      { value: "being_selfish", label: "Appearing selfish or ungrateful" },
      { value: "forgetting", label: "Forgetting to reciprocate" },
      { value: "overdoing", label: "Overdoing it and making others uncomfortable" }
    ]
  }
];

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { updateProfile } = useProfile();
  const { toast } = useToast();

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextStep = () => {
    if (currentStep < personalityQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const completeOnboarding = async () => {
    try {
      // Determine personality type based on answers
      const personalityType = determinePersonalityType(answers);
      const reciprocityStyle = determineReciprocityStyle(answers);

      await updateProfile({
        personality_type: personalityType,
        reciprocity_style: reciprocityStyle,
        onboarding_completed: true
      });

      toast({
        title: "Welcome to RelationshipDebt AI! 🎉",
        description: `Your personality type: ${personalityType}. Let's build better relationships together!`,
      });

      onComplete();
    } catch (error) {
      toast({
        title: "Onboarding Error",
        description: "There was an issue completing your setup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const determinePersonalityType = (answers: Record<string, string>) => {
    // Simple algorithm to determine personality type based on answers
    if (answers.giving_style === 'spontaneous_giver' && answers.relationship_priority === 'support') {
      return 'Natural Giver';
    } else if (answers.reciprocity_awareness === 'very_aware' && answers.relationship_priority === 'balance') {
      return 'Balance Keeper';
    } else if (answers.social_anxiety === 'often_anxious' || answers.social_anxiety === 'very_anxious') {
      return 'Thoughtful Reciprocator';
    } else if (answers.giving_style === 'planned_giver' && answers.reciprocity_concern === 'overdoing') {
      return 'Strategic Giver';
    } else {
      return 'Relationship Builder';
    }
  };

  const determineReciprocityStyle = (answers: Record<string, string>) => {
    if (answers.giving_style === 'responsive_giver') {
      return 'Mirror Style';
    } else if (answers.giving_style === 'spontaneous_giver') {
      return 'Proactive Style';
    } else if (answers.giving_style === 'planned_giver') {
      return 'Strategic Style';
    } else {
      return 'Adaptive Style';
    }
  };

  const currentQuestion = personalityQuestions[currentStep];
  const progress = ((currentStep + 1) / personalityQuestions.length) * 100;
  const currentAnswer = answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center mb-8">
          <Heart className="h-10 w-10 text-green-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to RelationshipDebt AI</h1>
            <p className="text-sm text-green-600">Let's understand your relationship style</p>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-lg">Step {currentStep + 1} of {personalityQuestions.length}</CardTitle>
              <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="mb-4" />
            <CardDescription className="text-lg font-medium text-gray-900">
              {currentQuestion.question}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={currentAnswer}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            >
              {currentQuestion.options.map((option) => (
                <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-green-50 transition-colors">
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer text-sm leading-relaxed">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <Button
                onClick={nextStep}
                disabled={!currentAnswer}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {currentStep === personalityQuestions.length - 1 ? 'Complete Setup' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
