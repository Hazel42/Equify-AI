import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const usePersonalityInsights = () => {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["personality-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("personality_type, reciprocity_style, full_name")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getPersonalityTypeInfo = (type: string) => {
    const personalityTypes = {
      giving_helper: {
        title: "The Giving Helper",
        emoji: "🤗",
        description:
          "You naturally help others and thrive on making positive impact",
        strengths: ["High empathy", "Quick to help", "Generous with time"],
        tips: [
          "Set boundaries to avoid burnout",
          "Allow others to help you too",
        ],
      },
      thoughtful_strategist: {
        title: "The Thoughtful Strategist",
        emoji: "🧠",
        description:
          "You approach relationships with careful consideration and long-term thinking",
        strengths: [
          "Strategic thinking",
          "Long-term planning",
          "Reliable support",
        ],
        tips: [
          "Don't overthink every interaction",
          "Embrace spontaneous connections",
        ],
      },
      social_connector: {
        title: "The Social Connector",
        emoji: "🌟",
        description:
          "You excel at bringing people together and maintaining vibrant networks",
        strengths: [
          "Strong social skills",
          "Network building",
          "Communication",
        ],
        tips: ["Balance quantity with quality", "Ensure deep connections"],
      },
      balanced_coordinator: {
        title: "The Balanced Coordinator",
        emoji: "⚖️",
        description:
          "You maintain a balanced approach, adapting based on situation and person",
        strengths: ["Adaptability", "Balance", "Diplomatic"],
        tips: [
          "Develop your unique strengths",
          "Lead relationship initiatives",
        ],
      },
    };

    return (
      personalityTypes[type as keyof typeof personalityTypes] || {
        title: "Unique Style",
        emoji: "✨",
        description: "You have a unique approach to relationships",
        strengths: ["Individual approach"],
        tips: ["Explore your relationship patterns"],
      }
    );
  };

  const getReciprocityStyleInfo = (style: string) => {
    const reciprocityStyles = {
      immediate_exchanger: {
        title: "Immediate Exchanger",
        description: "You prefer quick, balanced exchanges",
        approach: "You like to balance things right away",
      },
      flexible_giver: {
        title: "Flexible Giver",
        description: "You adapt your giving style to situations",
        approach: "You're comfortable with various forms of reciprocity",
      },
      long_term_planner: {
        title: "Long-term Planner",
        description: "You think about balance over extended periods",
        approach: "You trust in long-term relationship balance",
      },
      emotional_investor: {
        title: "Emotional Investor",
        description: "You focus on emotional connections over transactions",
        approach: "Relationships matter more than immediate balance",
      },
    };

    return (
      reciprocityStyles[style as keyof typeof reciprocityStyles] || {
        title: "Adaptive Style",
        description: "You have a flexible approach to reciprocity",
        approach: "You adapt based on the situation",
      }
    );
  };

  const hasCompletedAssessment = () => {
    return profile?.personality_type && profile?.reciprocity_style;
  };

  const getPersonalizedInsights = () => {
    if (!profile?.personality_type || !profile?.reciprocity_style) {
      return [];
    }

    const personalityType = profile.personality_type;
    const reciprocityStyle = profile.reciprocity_style;

    // Generate personalized insights based on type combination
    const insights = [];

    // Personality-based insights
    if (personalityType === "giving_helper") {
      insights.push({
        type: "strength",
        title: "Your Helping Nature",
        description:
          "You naturally notice when others need support and act quickly to help.",
        action: "Consider tracking your giving to maintain healthy balance.",
      });
    }

    if (personalityType === "thoughtful_strategist") {
      insights.push({
        type: "strength",
        title: "Your Strategic Approach",
        description:
          "You think carefully about relationship dynamics and long-term outcomes.",
        action: "Use your planning skills to set relationship goals.",
      });
    }

    // Reciprocity-based insights
    if (reciprocityStyle === "immediate_exchanger") {
      insights.push({
        type: "tip",
        title: "Balance Timing",
        description:
          "Your preference for quick exchanges keeps relationships balanced.",
        action:
          "Remember that some people prefer delayed reciprocity - be patient.",
      });
    }

    if (reciprocityStyle === "emotional_investor") {
      insights.push({
        type: "tip",
        title: "Emotional Connections",
        description: "You value emotional bonds over transactional exchanges.",
        action:
          "Use Equify to track the emotional impact of your interactions.",
      });
    }

    return insights;
  };

  return {
    profile,
    isLoading,
    hasCompletedAssessment: hasCompletedAssessment(),
    personalityTypeInfo: profile?.personality_type
      ? getPersonalityTypeInfo(profile.personality_type)
      : null,
    reciprocityStyleInfo: profile?.reciprocity_style
      ? getReciprocityStyleInfo(profile.reciprocity_style)
      : null,
    personalizedInsights: getPersonalizedInsights(),
  };
};
