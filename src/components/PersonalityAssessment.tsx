import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Brain,
  Heart,
  Users,
  Clock,
  ArrowRight,
  CheckCircle,
  Zap,
  Balance,
  Target,
  Gift,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AssessmentQuestion {
  id: string;
  category: string;
  question: string;
  description: string;
  options: {
    value: string;
    label: string;
    description: string;
    traits: string[];
  }[];
}

interface AssessmentResult {
  personalityType:
    | "giving_helper"
    | "balanced_coordinator"
    | "thoughtful_strategist"
    | "social_connector";
  reciprocityStyle:
    | "immediate_exchanger"
    | "flexible_giver"
    | "long_term_planner"
    | "emotional_investor";
  traits: {
    helpfulness: number;
    planning: number;
    social: number;
    emotional: number;
    structure: number;
  };
  description: string;
  strengths: string[];
  recommendations: string[];
}

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "help_approach",
    category: "Helping Style",
    question: "When someone needs help, you typically:",
    description: "This helps us understand your natural helping tendencies",
    options: [
      {
        value: "immediate_offer",
        label: "Immediately offer help without being asked",
        description: "You notice needs and act quickly",
        traits: ["helpfulness", "social"],
      },
      {
        value: "wait_and_respond",
        label: "Wait to be asked, then help enthusiastically",
        description: "You prefer to respect boundaries first",
        traits: ["planning", "emotional"],
      },
      {
        value: "assess_then_help",
        label: "Assess the situation, then offer specific help",
        description: "You think strategically about how to help best",
        traits: ["planning", "structure"],
      },
    ],
  },
  {
    id: "reciprocity_timing",
    category: "Reciprocity Style",
    question: "When someone helps you, you feel best when:",
    description: "This reveals your preferred reciprocity pattern",
    options: [
      {
        value: "immediate_return",
        label: "You can return the favor quickly",
        description: "You like to balance things right away",
        traits: ["structure", "helpfulness"],
      },
      {
        value: "future_opportunity",
        label: "You know you can help them in the future",
        description: "You're comfortable with delayed reciprocity",
        traits: ["planning", "emotional"],
      },
      {
        value: "emotional_connection",
        label: "You feel emotionally connected regardless of timing",
        description: "Relationships matter more than immediate balance",
        traits: ["emotional", "social"],
      },
    ],
  },
  {
    id: "relationship_energy",
    category: "Social Energy",
    question: "Your ideal way to maintain relationships is:",
    description: "This shows how you naturally connect with others",
    options: [
      {
        value: "regular_checkins",
        label: "Regular check-ins and consistent contact",
        description: "You maintain steady, predictable connections",
        traits: ["structure", "social"],
      },
      {
        value: "meaningful_moments",
        label: "Deep, meaningful conversations when needed",
        description: "You prefer quality over quantity",
        traits: ["emotional", "planning"],
      },
      {
        value: "activity_based",
        label: "Doing activities and favors together",
        description: "You connect through shared actions",
        traits: ["helpfulness", "social"],
      },
    ],
  },
  {
    id: "conflict_style",
    category: "Conflict Resolution",
    question: "When there's imbalance in a relationship, you:",
    description: "This reveals how you handle relationship challenges",
    options: [
      {
        value: "address_directly",
        label: "Address it directly and work to fix it",
        description: "You tackle problems head-on",
        traits: ["structure", "helpfulness"],
      },
      {
        value: "give_time_space",
        label: "Give it time and space to resolve naturally",
        description: "You trust that things will balance out",
        traits: ["planning", "emotional"],
      },
      {
        value: "increase_giving",
        label: "Increase your giving to restore balance",
        description: "You actively work to rebalance through action",
        traits: ["helpfulness", "social"],
      },
    ],
  },
  {
    id: "motivation_driver",
    category: "Core Motivation",
    question: "What motivates you most in relationships?",
    description: "This identifies your primary relationship driver",
    options: [
      {
        value: "helping_others",
        label: "Knowing you've helped someone improve their life",
        description: "You're driven by impact and helpfulness",
        traits: ["helpfulness", "emotional"],
      },
      {
        value: "mutual_growth",
        label: "Mutual growth and learning together",
        description: "You value development and progress",
        traits: ["planning", "social"],
      },
      {
        value: "stable_network",
        label: "Having a stable, reliable support network",
        description: "You prioritize security and consistency",
        traits: ["structure", "planning"],
      },
    ],
  },
];

interface PersonalityAssessmentProps {
  onComplete: (result: AssessmentResult) => void;
  onSkip?: () => void;
}

export const PersonalityAssessment = ({
  onComplete,
  onSkip,
}: PersonalityAssessmentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;
  const isComplete = Object.keys(answers).length === assessmentQuestions.length;

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = (): AssessmentResult => {
    const traits = {
      helpfulness: 0,
      planning: 0,
      social: 0,
      emotional: 0,
      structure: 0,
    };

    // Calculate trait scores based on answers
    Object.entries(answers).forEach(([questionId, answerValue]) => {
      const question = assessmentQuestions.find((q) => q.id === questionId);
      const option = question?.options.find((opt) => opt.value === answerValue);

      option?.traits.forEach((trait) => {
        if (trait in traits) {
          traits[trait as keyof typeof traits]++;
        }
      });
    });

    // Determine personality type based on dominant traits
    let personalityType: AssessmentResult["personalityType"];
    let reciprocityStyle: AssessmentResult["reciprocityStyle"];

    // Personality Type Logic
    if (traits.helpfulness >= 3 && traits.social >= 2) {
      personalityType = "giving_helper";
    } else if (traits.planning >= 3 && traits.structure >= 2) {
      personalityType = "thoughtful_strategist";
    } else if (traits.social >= 3 && traits.emotional >= 2) {
      personalityType = "social_connector";
    } else {
      personalityType = "balanced_coordinator";
    }

    // Reciprocity Style Logic
    if (traits.structure >= 3) {
      reciprocityStyle = "immediate_exchanger";
    } else if (traits.emotional >= 3) {
      reciprocityStyle = "emotional_investor";
    } else if (traits.planning >= 3) {
      reciprocityStyle = "long_term_planner";
    } else {
      reciprocityStyle = "flexible_giver";
    }

    // Generate descriptions and recommendations
    const descriptions = {
      giving_helper:
        "You're naturally inclined to help others and thrive on making a positive impact. You notice when people need help and act quickly to support them.",
      thoughtful_strategist:
        "You approach relationships with careful consideration and long-term thinking. You prefer to plan your help and maintain structured connections.",
      social_connector:
        "You're energized by social connections and emotional bonds. You excel at bringing people together and maintaining vibrant relationship networks.",
      balanced_coordinator:
        "You maintain a balanced approach to relationships, adapting your style based on the situation and person. You're flexible and considerate.",
    };

    const strengthsMap = {
      giving_helper: [
        "Quick to help others",
        "High empathy",
        "Action-oriented",
        "Generous with time",
      ],
      thoughtful_strategist: [
        "Strategic thinking",
        "Long-term planning",
        "Reliable support",
        "Thoughtful approach",
      ],
      social_connector: [
        "Strong social skills",
        "Emotional intelligence",
        "Network building",
        "Communication",
      ],
      balanced_coordinator: [
        "Adaptability",
        "Balance",
        "Diplomatic",
        "Consistent relationships",
      ],
    };

    const recommendationsMap = {
      giving_helper: [
        "Set boundaries to avoid burnout",
        "Allow others to help you too",
        "Track your giving to maintain balance",
      ],
      thoughtful_strategist: [
        "Don't overthink every interaction",
        "Embrace spontaneous connections",
        "Share your planning approach with others",
      ],
      social_connector: [
        "Balance quantity with quality",
        "Ensure deep connections alongside broad networks",
        "Use your skills to help others connect",
      ],
      balanced_coordinator: [
        "Develop your unique strengths further",
        "Lead relationship initiatives",
        "Share your balanced perspective with others",
      ],
    };

    return {
      personalityType,
      reciprocityStyle,
      traits,
      description: descriptions[personalityType],
      strengths: strengthsMap[personalityType],
      recommendations: recommendationsMap[personalityType],
    };
  };

  const handleComplete = () => {
    const result = calculateResult();
    onComplete(result);
  };

  const currentQ = assessmentQuestions[currentQuestion];
  const currentAnswer = answers[currentQ.id];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Personality Assessment
            </CardTitle>
            <Badge variant="secondary">
              {currentQuestion + 1} / {assessmentQuestions.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-600 mt-2">
            Help us understand your relationship style for personalized insights
          </p>
        </CardHeader>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">
                    {currentQ.category}
                  </Badge>
                  <CardTitle className="text-lg">{currentQ.question}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {currentQ.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={currentAnswer || ""}
                onValueChange={(value) => handleAnswer(currentQ.id, value)}
                className="space-y-4"
              >
                {currentQ.options.map((option) => (
                  <motion.div
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      currentAnswer === option.value
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="sr-only"
                    />
                    <Label htmlFor={option.value} className="cursor-pointer">
                      <div>
                        <p className="font-medium mb-1">{option.label}</p>
                        <p className="text-sm text-gray-600">
                          {option.description}
                        </p>
                      </div>
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {onSkip && (
                <Button variant="ghost" onClick={onSkip}>
                  Skip Assessment
                </Button>
              )}

              {currentQuestion < assessmentQuestions.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!currentAnswer}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!isComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Complete Assessment
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
