import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  Users,
  MessageCircle,
  Gift,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Brain,
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

const personalityQuestions = [
  {
    id: "social_energy",
    question: "How do you prefer to recharge after social interactions?",
    options: [
      {
        value: "alone_time",
        label: "Alone time and quiet activities",
        type: "introvert",
      },
      {
        value: "more_social",
        label: "More social activities and group settings",
        type: "extrovert",
      },
      { value: "balanced", label: "A balance of both", type: "ambivert" },
    ],
  },
  {
    id: "favor_approach",
    question: "When someone needs help, you typically:",
    options: [
      {
        value: "immediate_help",
        label: "Offer help immediately without being asked",
        type: "proactive",
      },
      {
        value: "wait_asked",
        label: "Wait to be asked, then help enthusiastically",
        type: "responsive",
      },
      {
        value: "think_first",
        label: "Think carefully about what help you can provide",
        type: "thoughtful",
      },
    ],
  },
  {
    id: "reciprocity_style",
    question: "Your approach to reciprocity is:",
    options: [
      {
        value: "immediate",
        label: "I prefer immediate exchange of favors",
        type: "immediate",
      },
      {
        value: "flexible",
        label: "I'm flexible about timing and form",
        type: "flexible",
      },
      {
        value: "long_term",
        label: "I think in terms of long-term balance",
        type: "long_term",
      },
    ],
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
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
  const [personalityAnswers, setPersonalityAnswers] = useState<
    Record<string, string>
  >({});
  const { user } = useAuth();
  const { toast } = useToast();

  const totalSteps = 4; // Reduced since assessment is separate

  const analyzePersonality = () => {
    const answers = Object.values(personalityAnswers);

    // Simple personality analysis based on answers
    if (answers.includes("proactive") && answers.includes("immediate")) {
      return "activist";
    } else if (
      answers.includes("thoughtful") &&
      answers.includes("long_term")
    ) {
      return "strategist";
    } else if (answers.includes("responsive") && answers.includes("flexible")) {
      return "harmonizer";
    } else {
      return "balanced";
    }
  };

  const analyzeReciprocityStyle = () => {
    if (personalityAnswers.reciprocity_style === "immediate") {
      return "immediate_reciprocator";
    } else if (personalityAnswers.reciprocity_style === "flexible") {
      return "flexible_giver";
    } else {
      return "long_term_balancer";
    }
  };

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

  const handleAssessmentComplete = (result: any) => {
    setAssessmentResult(result);
    setShowAssessment(false);
    setShowResults(true);
  };

  const handleComplete = async () => {
    try {
      const personalityType = analyzePersonality();
      const reciprocityStyle = analyzeReciprocityStyle();

      await supabase
        .from("profiles")
        .update({
          full_name: onboardingData.fullName,
          personality_type: personalityType,
          reciprocity_style: reciprocityStyle,
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
              Let's set up your profile to provide personalized relationship
              insights and recommendations.
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
              <Gift className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-purple-800">
                Maintain healthy balance
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
    ...personalityQuestions.map((q, index) => ({
      title: `Personality Assessment ${index + 1}/3`,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{q.question}</h3>
          <RadioGroup
            value={personalityAnswers[q.id] || ""}
            onValueChange={(value) =>
              setPersonalityAnswers({
                ...personalityAnswers,
                [q.id]: value,
              })
            }
          >
            {q.options.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50"
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ),
    })),
    {
      title: "Preferences",
      content: (
        <div className="space-y-4">
          <div>
            <Label>How often would you like AI insights?</Label>
            <RadioGroup
              value={onboardingData.preferences.reminderFrequency}
              onValueChange={(value) =>
                setOnboardingData({
                  ...onboardingData,
                  preferences: {
                    ...onboardingData.preferences,
                    reminderFrequency: value,
                  },
                })
              }
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="font-medium">Enable AI Insights</Label>
              <p className="text-xs text-gray-500">
                Get personalized relationship recommendations
              </p>
            </div>
            <input
              type="checkbox"
              checked={onboardingData.preferences.aiInsightsEnabled}
              onChange={(e) =>
                setOnboardingData({
                  ...onboardingData,
                  preferences: {
                    ...onboardingData.preferences,
                    aiInsightsEnabled: e.target.checked,
                  },
                })
              }
              className="rounded"
            />
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
        return personalityAnswers.social_energy;
      case 3:
        return personalityAnswers.favor_approach;
      case 4:
        return personalityAnswers.reciprocity_style;
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
            setShowResults(false);
            handleComplete();
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
          onContinue={handleComplete}
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
                      {currentStep === 2 ? "Start Assessment" : "Next"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleComplete}
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
