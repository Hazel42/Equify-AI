import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Heart,
  TrendingUp,
  Bot,
  Gift,
  Calendar,
  MessageCircle,
  Sparkles,
  Save,
  Trash2,
  Check,
  X,
  CheckCircle,
} from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavorsEnhanced } from "@/hooks/useFavorsEnhanced";
import { useAI } from "@/hooks/useAI";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const RelationshipDetail = () => {
  const { relationshipId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("history");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const { getRelationship } = useRelationships();
  const { getFavorsForRelationship, getRelationshipBalance } =
    useFavorsEnhanced();
  const { generateRecommendations, loading: aiLoading } = useAI();

  const relationship = getRelationship(relationshipId || "");
  const favors = getFavorsForRelationship(relationshipId || "");
  const balance = getRelationshipBalance(relationshipId || "");

  const givenFavors = favors.filter((f) => f.direction === "given");
  const receivedFavors = favors.filter((f) => f.direction === "received");

  const getImportanceColor = (level: number) => {
    if (level >= 4) return "bg-red-100 text-red-700 border-red-200";
    if (level >= 3) return "bg-orange-100 text-orange-700 border-orange-200";
    if (level >= 2) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  const getImportanceLabel = (level: number) => {
    if (level >= 4) return "Very High";
    if (level >= 3) return "High";
    if (level >= 2) return "Medium";
    return "Low";
  };

  const getBalanceStatus = () => {
    if (balance > 2)
      return {
        label: "You're giving more",
        color: "text-blue-600",
        bg: "bg-blue-50",
      };
    if (balance < -2)
      return {
        label: "They're giving more",
        color: "text-orange-600",
        bg: "bg-orange-50",
      };
    return {
      label: "Balanced relationship",
      color: "text-green-600",
      bg: "bg-green-50",
    };
  };

  const handleGenerateRecommendations = async () => {
    if (!relationship) return;

    setLoadingRecommendations(true);
    try {
      const result = await generateRecommendations(
        relationship.user_id,
        relationship.id,
        `Generate recommendations for ${relationship.name} (${relationship.relationship_type})`,
      );

      if (result.recommendations) {
        setRecommendations(result.recommendations);
        setActiveTab("recommendations");
      }
    } catch (error) {
      console.error("Failed to generate recommendations:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  if (!relationship) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Relationship not found</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const balanceStatus = getBalanceStatus();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate(-1)} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {relationship.name}
              </h1>
              <Badge
                className={getImportanceColor(
                  relationship.importance_level || 3,
                )}
              >
                {getImportanceLabel(relationship.importance_level || 3)}
              </Badge>
            </div>
            <p className="text-gray-600 capitalize">
              {relationship.relationship_type.replace("_", " ")}
            </p>
          </div>
        </div>

        {/* Balance Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Relationship Balance
                </h3>
                <p className={`text-sm ${balanceStatus.color}`}>
                  {balanceStatus.label}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg ${balanceStatus.bg}`}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {balance > 0 ? `+${balance}` : balance}
                  </div>
                  <div className="text-xs text-gray-600">Balance</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {givenFavors.length}
                </div>
                <div className="text-xs text-gray-600">Given</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {receivedFavors.length}
                </div>
                <div className="text-xs text-gray-600">Received</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => {
              // You could implement a quick add favor modal here
              // or navigate to add favor with pre-filled relationship
              toast({
                title: "Add Favor",
                description:
                  "Navigate to the main page to add a favor for this relationship.",
              });
            }}
          >
            <Heart className="h-4 w-4 mr-2" />
            Add Favor
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => {
              // Handle contact action
              toast({
                title: "Contact",
                description: "Contact functionality can be implemented here.",
              });
            }}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button
            onClick={handleGenerateRecommendations}
            disabled={loadingRecommendations}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Bot className="h-4 w-4 mr-2" />
            {loadingRecommendations ? "Generating..." : "AI Insights"}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Favor History</TabsTrigger>
            <TabsTrigger value="recommendations">
              AI Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            {favors.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500 py-8">
                    <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-semibold">No favor history yet</p>
                    <p className="text-sm">
                      Start by adding your first favor with {relationship.name}.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {favors.map((favor) => (
                  <Card
                    key={favor.id}
                    className="hover:shadow-sm transition-shadow"
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={
                                favor.direction === "given"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {favor.direction === "given"
                                ? "Given"
                                : "Received"}
                            </Badge>
                            <span className="text-xs text-gray-500 capitalize">
                              {favor.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 mb-1">
                            {favor.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {format(
                              new Date(favor.date_occurred),
                              "MMM d, yyyy",
                            )}
                            {favor.emotional_weight && (
                              <>
                                <span>•</span>
                                <span>Weight: {favor.emotional_weight}/5</span>
                              </>
                            )}
                          </div>
                        </div>
                        {favor.reciprocated && (
                          <Badge variant="outline" className="text-xs">
                            Reciprocated
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {recommendations.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500 py-8">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-semibold">No AI recommendations yet</p>
                    <p className="text-sm mb-4">
                      Click "AI Insights" to get personalized relationship
                      recommendations.
                    </p>
                    <Button
                      onClick={handleGenerateRecommendations}
                      disabled={loadingRecommendations}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      {loadingRecommendations
                        ? "Generating..."
                        : "Generate Recommendations"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-sm transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <Badge
                          variant={
                            rec.priority_level >= 4
                              ? "destructive"
                              : rec.priority_level >= 3
                                ? "default"
                                : "secondary"
                          }
                        >
                          {rec.priority_level >= 4
                            ? "High"
                            : rec.priority_level >= 3
                              ? "Medium"
                              : "Low"}{" "}
                          Priority
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-3">{rec.description}</p>
                      {rec.suggested_actions?.how_to_execute && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-gray-900">
                            How to execute:
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {rec.suggested_actions.how_to_execute.map(
                              (action: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-purple-600">•</span>
                                  <span>{action}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                      {rec.due_date && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          Due: {format(new Date(rec.due_date), "MMM d, yyyy")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                <Button
                  onClick={handleGenerateRecommendations}
                  disabled={loadingRecommendations}
                  variant="outline"
                  className="w-full"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Generate New Recommendations
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
