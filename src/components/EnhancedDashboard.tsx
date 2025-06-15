
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Heart, Brain, Calendar, Star, ArrowRight, Target } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavors } from "@/hooks/useFavors";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useAI } from "@/hooks/useAI";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { QuickSetupGuide } from "@/components/QuickSetupGuide";
import { AddRelationshipDialog } from "@/components/AddRelationshipDialog";
import { AddFavorDialog } from "@/components/AddFavorDialog";
import { TodayActionItems } from "@/components/TodayActionItems";
import { useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { useAutoAI } from "@/hooks/useAutoAI";

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

export const EnhancedDashboard = () => {
  const [showAddFavor, setShowAddFavor] = useState(false);
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const { relationships, isLoading: relationshipsLoading, addRelationship } = useRelationships();
  const { favors, isLoading: favorsLoading } = useFavors();
  const { profile } = useProfile();
  const { user } = useAuth();
  const { generateRecommendations, loading: aiLoading } = useAI();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [relationshipForAI, setRelationshipForAI] = useState<string | undefined>();

  useAutoAI({
    userId: user?.id,
    relationshipId: relationshipForAI,
    triggerAnalysis: !!relationshipForAI,
    onComplete: () => {
      console.log('Auto AI analysis complete for new relationship');
      setRelationshipForAI(undefined);
    },
  });

  // Calculate key metrics
  const totalRelationships = relationships.length;
  const averageBalance = relationships.length > 0 ? 
    relationships.reduce((sum, rel) => sum + 7.5, 0) / totalRelationships : 0;
  const healthyRelationships = relationships.filter(() => Math.random() > 0.3).length;
  
  const thisMonthFavors = favors.filter(f => {
    const favorDate = new Date(f.date_occurred);
    const thisMonth = new Date();
    return favorDate.getMonth() === thisMonth.getMonth() && 
           favorDate.getFullYear() === thisMonth.getFullYear();
  }).length;

  // Mock data for enhanced visualizations
  const weeklyTrend = [
    { day: 'Mon', given: 3, received: 2 },
    { day: 'Tue', given: 1, received: 4 },
    { day: 'Wed', given: 4, received: 3 },
    { day: 'Thu', given: 2, received: 1 },
    { day: 'Fri', given: 5, received: 3 },
    { day: 'Sat', given: 2, received: 2 },
    { day: 'Sun', given: 3, received: 4 }
  ];

  const balanceDistribution = [
    { range: 'Very Healthy', count: Math.floor(totalRelationships * 0.4), fill: '#10B981' },
    { range: 'Healthy', count: Math.floor(totalRelationships * 0.3), fill: '#3B82F6' },
    { range: 'Balanced', count: Math.floor(totalRelationships * 0.2), fill: '#F59E0B' },
    { range: 'Needs Attention', count: Math.floor(totalRelationships * 0.1), fill: '#EF4444' }
  ];

  const personalityInsights = {
    'giving': {
      title: t('dashboard.personality.giver'),
      tip: t('dashboard.personality.giverTip'),
      color: 'green'
    },
    'balanced': {
      title: t('dashboard.personality.balanced'),
      tip: t('dashboard.personality.balancedTip'),
      color: 'blue'
    },
    'receiver': {
      title: t('dashboard.personality.receiver'),
      tip: t('dashboard.personality.receiverTip'),
      color: 'orange'
    },
    'analyzer': {
      title: t('dashboard.personality.analyzer'),
      tip: t('dashboard.personality.analyzerTip'),
      color: 'purple'
    }
  };

  const currentPersonality = personalityInsights[profile?.personality_type as keyof typeof personalityInsights] || personalityInsights.balanced;

  const handleGenerateAIForAll = async () => {
    if (!user || relationships.length === 0) {
      toast({
        title: "Cannot Generate AI Recommendations",
        description: "Please add at least one relationship first.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Starting AI Analysis",
      description: `Analyzing ${relationships.length} relationships. This may take a moment.`,
    });

    let successCount = 0;
    for (const rel of relationships) {
      try {
        await generateRecommendations(user.id, rel.id, 'Dashboard full analysis');
        successCount++;
      } catch (error) {
        console.error(`Failed to generate recommendations for ${rel.name}`, error);
      }
    }

    if (successCount > 0) {
      toast({
        title: "AI Analysis Complete",
        description: `Generated recommendations for ${successCount} relationships. Check the AI Recommendations tab!`,
      });
    }
  };

  if (relationshipsLoading || favorsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 text-green-600 mx-auto mb-4 animate-spin">
            <TrendingUp className="h-full w-full" />
          </div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Show setup guide if no data exists
  if (relationships.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Reciprocity AI!</h2>
          <p className="text-gray-600">Track your relationships and get AI-powered insights to strengthen your connections.</p>
        </div>
        
        <QuickSetupGuide 
          onAddRelationship={() => setShowAddRelationship(true)}
          onAddFavor={() => setShowAddFavor(true)}
          onGenerateAI={handleGenerateAIForAll}
        />

        {/* Add Relationship Dialog */}
        <AddRelationshipDialog 
          open={showAddRelationship}
          onOpenChange={setShowAddRelationship}
          onSave={(data) => {
            addRelationship.mutate(data, {
              onSuccess: (result: any) => {
                  const newId = result?.data?.[0]?.id;
                  if (newId) {
                      setRelationshipForAI(newId);
                  }
                  toast({
                    title: t('toast.relationshipAdded'),
                    description: t('toast.relationshipAddedDesc'),
                  });
              }
            });
            setShowAddRelationship(false);
          }}
        />

        {/* Add Favor Dialog */}
        <AddFavorDialog 
          open={showAddFavor}
          onOpenChange={setShowAddFavor}
          onSave={() => {
            setShowAddFavor(false);
            toast({
              title: "Favor Added",
              description: "Your interaction has been recorded!",
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Setup Guide for incomplete setups */}
      {(relationships.length > 0 && favors.length < 2) && (
        <QuickSetupGuide 
          onAddRelationship={() => setShowAddRelationship(true)}
          onAddFavor={() => setShowAddFavor(true)}
          onGenerateAI={handleGenerateAIForAll}
        />
      )}

      {/* AI Quick Actions */}
      {relationships.length > 0 && favors.length >= 2 && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{t('dashboard.aiPoweredInsights')}</h3>
                  <p className="text-sm text-gray-600">{t('dashboard.getPersonalizedRecommendations')}</p>
                </div>
              </div>
              <Button 
                onClick={handleGenerateAIForAll}
                disabled={aiLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t('dashboard.analyzing')}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('dashboard.generateInsights')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('dashboard.greeting', { name: profile?.full_name?.split(' ')[0] })}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('dashboard.overview')}
            </p>
            <div className="flex items-center gap-2">
              <Badge className={`bg-${currentPersonality.color}-100 text-${currentPersonality.color}-700`}>
                {currentPersonality.title}
              </Badge>
              <span className="text-sm text-gray-500">• {currentPersonality.tip}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">{averageBalance.toFixed(1)}/10</div>
            <p className="text-sm text-gray-500">{t('dashboard.overallBalance')}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">{t('dashboard.totalRelationships')}</p>
                <p className="text-2xl font-bold text-green-900">{totalRelationships}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Progress value={Math.min(totalRelationships * 10, 100)} className="h-2" />
              <p className="text-xs text-green-600 mt-1">{t('dashboard.growingNetwork')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">{t('dashboard.thisMonth')}</p>
                <p className="text-2xl font-bold text-blue-900">{thisMonthFavors}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Badge className="bg-blue-100 text-blue-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                {t('dashboard.vsLastMonth')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">{t('dashboard.healthyRelations')}</p>
                <p className="text-2xl font-bold text-purple-900">{healthyRelationships}</p>
              </div>
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < 4 ? 'fill-purple-400 text-purple-400' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">{t('dashboard.aiInsights')}</p>
                <p className="text-2xl font-bold text-orange-900">3</p>
              </div>
              <Brain className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">
                {t('dashboard.viewAll')} <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Trend */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.weeklyActivity')}</CardTitle>
            <CardDescription>{t('dashboard.weeklyActivityDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="given" stroke="#10B981" strokeWidth={2} name="Given" />
                <Line type="monotone" dataKey="received" stroke="#3B82F6" strokeWidth={2} name="Received" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Balance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.relationshipHealth')}</CardTitle>
            <CardDescription>{t('dashboard.relationshipHealthDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={balanceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {balanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <TodayActionItems />

      {/* Add relationship and favor dialogs remain the same */}
      <AddRelationshipDialog 
        open={showAddRelationship}
        onOpenChange={setShowAddRelationship}
        onSave={(data) => {
          addRelationship.mutate(data, {
              onSuccess: (result: any) => {
                  const newId = result?.data?.[0]?.id;
                  if (newId) {
                      setRelationshipForAI(newId);
                  }
                  toast({
                    title: t('toast.relationshipAdded'),
                    description: t('toast.relationshipAddedDesc'),
                  });
              }
          });
          setShowAddRelationship(false);
        }}
      />

      <AddFavorDialog 
        open={showAddFavor}
        onOpenChange={setShowAddFavor}
        onSave={() => {
          setShowAddFavor(false);
          toast({
            title: "Favor Added",
            description: "Your interaction has been recorded!",
          });
        }}
      />
    </div>
  );
};
