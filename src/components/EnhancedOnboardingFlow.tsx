import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Users,
  Sparkles,
  Brain,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PersonalityAssessment } from "@/components/PersonalityAssessment";
import { AssessmentResults } from "@/components/AssessmentResults";

interface OnboardingData {
  fullName: string;
  personalityType: string;
  reciprocityStyle: string;
  relationshipGoals: string[];
  preferences: {
    reminderFrequency: string;
    privacyLevel: string;
    aiInsightsEnabled: boolean;
  };
}

interface EnhancedOnboardingFlowProps {
  onComplete: () => void;
}

export const EnhancedOnboardingFlow = ({
  onComplete,
}: EnhancedOnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    fullName: "",
    personalityType: "",
    reciprocityStyle: "",
    relationshipGoals: [],
    preferences: {
      reminderFrequency: "weekly",
      privacyLevel: "private",
      aiInsightsEnabled: true,
    },
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartAssessment = () => {
    setShowAssessment(true);
  };

  const handleAssessmentComplete = (result: any) => {
    setAssessmentResult(result);
    setOnboardingData((prev) => ({
      ...prev,
      personalityType: result.personalityType,
      reciprocityStyle: result.reciprocityStyle,
    }));
    setShowAssessment(false);
    setShowResults(true);
  };

  const handleFinalComplete = async () => {
    try {
      await supabase
        .from("profiles")
        .update({
          full_name: onboardingData.fullName,
          personality_type: onboardingData.personalityType,
          reciprocity_style: onboardingData.reciprocityStyle,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      toast({
        title: "Welcome to Equify! 🎉",
        description: "Your profile has been set up successfully.",
      });

      onComplete();
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        title: "Setup Error",
        description:
          "There was an error setting up your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const steps = [
    {
      title: "Welcome to Equify",
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Equify!
            </h2>
            <p className="text-gray-600">
              Track your relationships, understand patterns, and get AI-powered
              insights to build stronger connections.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-800">
                Track your relationships
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-800">
                Get AI-powered insights
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-purple-800">
                Understand your relationship style
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Tell us about yourself",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={onboardingData.fullName}
              onChange={(e) =>
                setOnboardingData({
                  ...onboardingData,
                  fullName: e.target.value,
                })
              }
              placeholder="Enter your full name"
              className="mt-1"
            />
          </div>
          <div>
            <Label>
              What are your relationship goals? (Select all that apply)
            </Label>
            <div className="mt-2 space-y-2">
              {[
                "Build stronger friendships",
                "Maintain family connections",
                "Professional networking",
                "Community involvement",
                "Support others more",
              ].map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={goal}
                    checked={onboardingData.relationshipGoals.includes(goal)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setOnboardingData({
                          ...onboardingData,
                          relationshipGoals: [
                            ...onboardingData.relationshipGoals,
                            goal,
                          ],
                        });
                      } else {
                        setOnboardingData({
                          ...onboardingData,
                          relationshipGoals:
                            onboardingData.relationshipGoals.filter(
                              (g) => g !== goal,
                            ),
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor={goal} className="text-sm">
                    {goal}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Personality Assessment",
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              Ready for Your Assessment?
            </h3>
            <p className="text-gray-600 mb-4">
              We'll help you understand your unique relationship style with a
              quick personality assessment.
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-purple-800 font-medium">
              What you'll discover:
            </p>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Your relationship personality type</li>
              <li>• Your preferred reciprocity style</li>
              <li>• Personalized strengths & recommendations</li>
              <li>• AI insights tailored to your style</li>
            </ul>
          </div>
          <div className="text-xs text-gray-500">
            📝 Takes 3-5 minutes • Can be retaken anytime
          </div>
        </div>
      ),
    },
  ];

  const isStepComplete = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return onboardingData.fullName.length > 0;
      case 2:
        return true;
      default:
        return true;
    }
  };

  // Show assessment if requested
  if (showAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4">
        <PersonalityAssessment
          onComplete={handleAssessmentComplete}
          onSkip={() => {
            setShowAssessment(false);
            handleFinalComplete();
          }}
        />
      </div>
    );
  }

  // Show results if assessment is complete
  if (showResults && assessmentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
        <AssessmentResults
          result={assessmentResult}
          onContinue={handleFinalComplete}
          onRetake={() => {
            setShowResults(false);
            setShowAssessment(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Progress
            value={((currentStep + 1) / totalSteps) * 100}
            className="h-2"
          />
          <p className="text-xs text-gray-500 mt-2 text-center">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  {steps[currentStep].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {steps[currentStep].content}

                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  )}

                  {currentStep < totalSteps - 1 ? (
                    <Button
                      onClick={handleNext}
                      disabled={!isStepComplete()}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStartAssessment}
                      disabled={!isStepComplete()}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Start Assessment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
