import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Gift, MessageCircle, TrendingUp, ChevronRight,
  CheckCircle, Star, ArrowRight, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuickStartTutorialProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export const QuickStartTutorial = ({ onComplete, onSkip }: QuickStartTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 'add-person',
      title: 'Add Your First Relationship',
      description: 'Start by adding someone important to you - family, friends, or colleagues.',
      icon: Users,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      action: 'Add a Person',
      tip: 'Tip: You can add contact info to make it easier to reach out later!'
    },
    {
      id: 'record-favor',
      title: 'Record a Favor',
      description: 'Track when you help someone or when they help you to maintain balance.',
      icon: Gift,
      color: 'bg-green-50 border-green-200 text-green-700',
      action: 'Record Favor',
      tip: 'Tip: Include emotional weight to understand the true impact!'
    },
    {
      id: 'get-insights',
      title: 'Get AI Insights',
      description: 'Ask our AI assistant for personalized relationship advice and patterns.',
      icon: MessageCircle,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      action: 'Try AI Chat',
      tip: 'Tip: The more data you add, the better insights you\'ll get!'
    },
    {
      id: 'view-analytics',
      title: 'Explore Analytics',
      description: 'See visual insights about your relationship patterns and trends.',
      icon: TrendingUp,
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      action: 'View Analytics',
      tip: 'Tip: Set monthly goals to stay motivated!'
    }
  ];

  const handleStepAction = (stepId: string) => {
    // Mark step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    // Trigger navigation or action based on step
    switch (stepId) {
      case 'add-person':
        window.dispatchEvent(new CustomEvent('quick-action', { 
          detail: { action: 'add-relationship', activeTab: 'dashboard' } 
        }));
        break;
      case 'record-favor':
        window.dispatchEvent(new CustomEvent('quick-action', { 
          detail: { action: 'add-favor', activeTab: 'dashboard' } 
        }));
        break;
      case 'get-insights':
        window.dispatchEvent(new CustomEvent('navigate-to-tab', { 
          detail: { tab: 'ai-chat' } 
        }));
        break;
      case 'view-analytics':
        window.dispatchEvent(new CustomEvent('navigate-to-tab', { 
          detail: { tab: 'analytics' } 
        }));
        break;
    }

    // Move to next step or complete
    if (currentStep < steps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 500);
    } else {
      setTimeout(() => onComplete?.(), 1000);
    }
  };

  const progress = ((completedSteps.length) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">Quick Start Guide</h2>
            <Badge variant="secondary" className="bg-white/20 text-white">
              {currentStep + 1}/{steps.length}
            </Badge>
          </div>
          <p className="text-green-100 text-sm">Let's get you started with Equify!</p>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-white rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`p-4 rounded-xl border-2 ${steps[currentStep].color} mb-4`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg">
                    <steps[currentStep].icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{steps[currentStep].title}</h3>
                    <p className="text-sm opacity-80">{steps[currentStep].description}</p>
                  </div>
                </div>
                
                <div className="bg-white/50 rounded-lg p-3 text-xs">
                  💡 {steps[currentStep].tip}
                </div>
              </div>

              <Button
                onClick={() => handleStepAction(steps[currentStep].id)}
                className="w-full bg-green-600 hover:bg-green-700 h-12 text-base"
                disabled={completedSteps.includes(currentStep)}
              >
                {completedSteps.includes(currentStep) ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Completed!
                  </>
                ) : (
                  <>
                    {steps[currentStep].action}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Steps Overview */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-4 gap-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = completedSteps.includes(index);
              const isCurrent = index === currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg text-center transition-all ${
                    isCompleted 
                      ? 'bg-green-100 text-green-600' 
                      : isCurrent 
                      ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-300' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <StepIcon className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-xs font-medium">Step {index + 1}</p>
                  {isCompleted && (
                    <CheckCircle className="h-3 w-3 mx-auto mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1"
          >
            Skip Tutorial
          </Button>
          
          {completedSteps.length === steps.length && (
            <Button
              onClick={onComplete}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Start Using Equify!
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};