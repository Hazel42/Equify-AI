import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Users,
  Gift,
  MessageCircle,
  TrendingUp,
  Clock,
  Heart,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavorsEnhanced } from "@/hooks/useFavorsEnhanced";
import { useAuth } from "@/hooks/useAuth";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (tab: string, data?: any) => void;
}

export const GlobalSearch = ({
  open,
  onOpenChange,
  onNavigate,
}: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    relationships: [] as any[],
    favors: [] as any[],
    insights: [] as any[],
  });

  const { relationships } = useRelationships();
  const { favors } = useFavorsEnhanced();
  const { user } = useAuth();

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults({ relationships: [], favors: [], insights: [] });
      return;
    }

    const lowercaseQuery = query.toLowerCase();

    // Search relationships
    const matchingRelationships =
      relationships
        ?.filter(
          (rel) =>
            rel.name.toLowerCase().includes(lowercaseQuery) ||
            rel.relationship_type.toLowerCase().includes(lowercaseQuery),
        )
        .slice(0, 5) || [];

    // Search favors
    const matchingFavors =
      favors
        ?.filter(
          (favor) =>
            favor.description.toLowerCase().includes(lowercaseQuery) ||
            favor.category.toLowerCase().includes(lowercaseQuery),
        )
        .slice(0, 5) || [];

    // Mock insights search (would search AI insights in real app)
    const mockInsights =
      query.length > 2
        ? [
            {
              id: "1",
              title: "Relationship Pattern",
              description: `Your search for "${query}" shows you often help others with similar requests`,
              type: "pattern",
            },
          ]
        : [];

    setSearchResults({
      relationships: matchingRelationships,
      favors: matchingFavors,
      insights: mockInsights,
    });
  }, [query, relationships, favors]);

  const handleResultClick = (type: string, item: any) => {
    onOpenChange(false);
    setQuery("");

    switch (type) {
      case "relationship":
        onNavigate?.("relationships", { selectedId: item.id });
        break;
      case "favor":
        onNavigate?.("relationships", { selectedId: item.relationship_id });
        break;
      case "insight":
        onNavigate?.("analytics");
        break;
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "relationship":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "favor":
        return <Gift className="h-4 w-4 text-green-600" />;
      case "insight":
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default:
        return <Search className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTotalResults = () => {
    return (
      searchResults.relationships.length +
      searchResults.favors.length +
      searchResults.insights.length
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Everything
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search relationships, favors, insights..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Quick Suggestions */}
          {!query && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Quick searches:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "family",
                  "help",
                  "financial",
                  "recent favors",
                  "balance",
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {query && (
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                {getTotalResults() === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No results found for "{query}"
                    </p>
                    <p className="text-sm text-gray-400">
                      Try different keywords or check spelling
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Relationships Results */}
                    {searchResults.relationships.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          People ({searchResults.relationships.length})
                        </h3>
                        <div className="space-y-2">
                          <AnimatePresence>
                            {searchResults.relationships.map((rel, index) => (
                              <motion.div
                                key={rel.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() =>
                                  handleResultClick("relationship", rel)
                                }
                                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-blue-600 font-medium text-sm">
                                        {rel.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">
                                        {rel.name}
                                      </p>
                                      <p className="text-xs text-gray-600 capitalize">
                                        {rel.relationship_type}
                                      </p>
                                    </div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-gray-400" />
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {/* Favors Results */}
                    {searchResults.favors.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Gift className="h-4 w-4" />
                          Favors ({searchResults.favors.length})
                        </h3>
                        <div className="space-y-2">
                          <AnimatePresence>
                            {searchResults.favors.map((favor, index) => (
                              <motion.div
                                key={favor.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  delay:
                                    (searchResults.relationships.length +
                                      index) *
                                    0.05,
                                }}
                                onClick={() =>
                                  handleResultClick("favor", favor)
                                }
                                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        favor.direction === "given"
                                          ? "bg-green-100"
                                          : "bg-blue-100"
                                      }`}
                                    >
                                      {favor.direction === "given" ? (
                                        <Gift className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Heart className="h-4 w-4 text-blue-600" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">
                                        {favor.description}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {favor.category}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                          {new Date(
                                            favor.created_at,
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-gray-400" />
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {/* Insights Results */}
                    {searchResults.insights.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Insights ({searchResults.insights.length})
                        </h3>
                        <div className="space-y-2">
                          <AnimatePresence>
                            {searchResults.insights.map((insight, index) => (
                              <motion.div
                                key={insight.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  delay:
                                    (searchResults.relationships.length +
                                      searchResults.favors.length +
                                      index) *
                                    0.05,
                                }}
                                onClick={() =>
                                  handleResultClick("insight", insight)
                                }
                                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                      <TrendingUp className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">
                                        {insight.title}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {insight.description}
                                      </p>
                                    </div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-gray-400" />
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          )}

          {/* Search Tips */}
          {query && getTotalResults() > 0 && (
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 text-center">
                💡 Tip: Click on any result to navigate directly to it
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
