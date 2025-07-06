import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Heart,
  Users,
  Zap,
  Target,
  CheckCircle,
  Star,
  ArrowRight,
  Share,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";

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

interface AssessmentResultsProps {
  result: AssessmentResult;
  onContinue: () => void;
  onRetake?: () => void;
}

export const AssessmentResults = ({
  result,
  onContinue,
  onRetake,
}: AssessmentResultsProps) => {
  const personalityTypeLabels = {
    giving_helper: {
      title: "The Giving Helper",
      emoji: "🤗",
      color: "from-green-500 to-emerald-600",
    },
    thoughtful_strategist: {
      title: "The Thoughtful Strategist",
      emoji: "🧠",
      color: "from-blue-500 to-indigo-600",
    },
    social_connector: {
      title: "The Social Connector",
      emoji: "🌟",
      color: "from-purple-500 to-pink-600",
    },
    balanced_coordinator: {
      title: "The Balanced Coordinator",
      emoji: "⚖️",
      color: "from-orange-500 to-red-600",
    },
  };

  const reciprocityStyleLabels = {
    immediate_exchanger: {
      title: "Immediate Exchanger",
      description: "You prefer quick, balanced exchanges",
    },
    flexible_giver: {
      title: "Flexible Giver",
      description: "You adapt your giving style to situations",
    },
    long_term_planner: {
      title: "Long-term Planner",
      description: "You think about balance over time",
    },
    emotional_investor: {
      title: "Emotional Investor",
      description: "You focus on emotional connections",
    },
  };

  const personalityInfo = personalityTypeLabels[result.personalityType];
  const reciprocityInfo = reciprocityStyleLabels[result.reciprocityStyle];

  const maxTrait = Math.max(...Object.values(result.traits));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
            <p className="text-gray-600">
              Here's your personalized relationship profile
            </p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Personality Type */}
      <motion.div variants={itemVariants}>
        <Card
          className={`bg-gradient-to-r ${personalityInfo.color} text-white`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <span className="text-3xl">{personalityInfo.emoji}</span>
              <div>
                <h2>{personalityInfo.title}</h2>
                <p className="text-sm opacity-90 font-normal">
                  Your Personality Type
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed opacity-95">
              {result.description}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reciprocity Style */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Your Reciprocity Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-blue-900">
                  {reciprocityInfo.title}
                </h3>
                <p className="text-blue-700 text-sm">
                  {reciprocityInfo.description}
                </p>
              </div>
              <Badge className="bg-blue-600">Your Style</Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trait Analysis */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Trait Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(result.traits).map(([trait, value]) => (
              <div key={trait} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize font-medium">
                    {trait.replace("_", " ")}
                  </span>
                  <span className="text-gray-600">{value}/5</span>
                </div>
                <Progress value={(value / maxTrait) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Strengths and Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Star className="h-5 w-5" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Target className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onContinue}
                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial"
              >
                Continue to Equify
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <Button variant="outline" className="flex-1 sm:flex-initial">
                <Share className="h-4 w-4 mr-2" />
                Share Results
              </Button>

              <Button variant="outline" className="flex-1 sm:flex-initial">
                <Download className="h-4 w-4 mr-2" />
                Save Report
              </Button>

              {onRetake && (
                <Button
                  variant="ghost"
                  onClick={onRetake}
                  className="flex-1 sm:flex-initial"
                >
                  Retake Assessment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
