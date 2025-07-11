import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Plus,
  Search,
  Filter,
  Heart,
  Gift,
  MessageCircle,
  TrendingUp,
  Calendar,
  Star,
  MoreVertical,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavorsEnhanced } from "@/hooks/useFavorsEnhanced";
import { AddRelationshipDialog } from "@/components/AddRelationshipDialog";
import { EnhancedAddFavorDialog } from "@/components/EnhancedAddFavorDialog";

interface Relationship {
  id: string;
  name: string;
  relationship_type: string;
  importance_level: number;
  created_at: string;
  contact_info?: any;
  preferences?: any;
  favorCount?: number;
  lastContact?: string;
  balance?: number;
}

const EnhancedRelationshipManagerComponent = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFavorDialog, setShowFavorDialog] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<
    string | null
  >(null);
  const [editingRelationship, setEditingRelationship] =
    useState<Relationship | null>(null);
  const [deletingRelationship, setDeletingRelationship] = useState<
    string | null
  >(null);

  // Listen for quick actions
  useEffect(() => {
    const handleQuickAction = (event: CustomEvent) => {
      const { action, activeTab } = event.detail;

      if (activeTab === "relationships") {
        if (action === "add-relationship") {
          setShowAddDialog(true);
        }
      }
    };

    window.addEventListener("quick-action", handleQuickAction as EventListener);
    return () =>
      window.removeEventListener(
        "quick-action",
        handleQuickAction as EventListener,
      );
  }, []);

  const { relationships, isLoading, updateRelationship, deleteRelationship } =
    useRelationships();
  const { getFavorsForRelationship, getRelationshipBalance } =
    useFavorsEnhanced();

  // Enrich relationships with favor data
  const enrichedRelationships =
    relationships?.map((rel) => {
      const relationshipFavors = getFavorsForRelationship(rel.id);
      const balance = getRelationshipBalance(rel.id);
      const lastFavor = relationshipFavors[0];

      return {
        ...rel,
        favorCount: relationshipFavors.length,
        balance,
        lastContact: lastFavor?.created_at,
      };
    }) || [];

  const filteredRelationships = enrichedRelationships.filter((rel) => {
    const matchesSearch = rel.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "family")
      return matchesSearch && rel.relationship_type === "family";
    if (selectedFilter === "friends")
      return matchesSearch && rel.relationship_type === "friend";
    if (selectedFilter === "colleagues")
      return matchesSearch && rel.relationship_type === "colleague";
    if (selectedFilter === "positive")
      return matchesSearch && (rel.balance || 0) > 0;
    if (selectedFilter === "negative")
      return matchesSearch && (rel.balance || 0) < 0;

    return matchesSearch;
  });

  const handleContactClick = (relationship: any) => {
    const contactInfo = relationship?.contact_info as any;
    if (contactInfo?.phone) {
      window.location.href = `tel:${contactInfo.phone}`;
    } else if (contactInfo?.email) {
      window.location.href = `mailto:${contactInfo.email}`;
    } else {
      alert("No contact information available");
    }
  };

  const getRelationshipEmoji = (type: string) => {
    switch (type) {
      case "family":
        return "👨‍👩‍👧‍👦";
      case "friend":
        return "👫";
      case "colleague":
        return "💼";
      case "romantic":
        return "💕";
      default:
        return "👤";
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-green-600 bg-green-50";
    if (balance < 0) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  const handleEditRelationship = (relationship: Relationship) => {
    setEditingRelationship(relationship);
    setShowAddDialog(true);
  };

  const handleDeleteRelationship = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this relationship? This action cannot be undone.",
      )
    ) {
      await deleteRelationship.mutateAsync(id);
    }
  };

  const handleRelationshipClick = (relationshipId: string) => {
    navigate(`/relationship/${relationshipId}`);
  };

  const RelationshipCard = ({
    relationship,
  }: {
    relationship: Relationship;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative"
    >
      <Card
        className="bg-white border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleRelationshipClick(relationship.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {relationship.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {relationship.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    {getRelationshipEmoji(relationship.relationship_type)}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {relationship.relationship_type}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`text-xs ${getBalanceColor(relationship.balance || 0)}`}
              >
                {relationship.balance > 0 ? "+" : ""}
                {relationship.balance}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRelationshipClick(relationship.id);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditRelationship(relationship);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRelationship(relationship.id);
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Gift className="h-3 w-3" />
                {relationship.favorCount} favors
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {relationship.importance_level}/5
              </span>
            </div>
            {relationship.lastContact && (
              <span>
                Last: {new Date(relationship.lastContact).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRelationship(relationship.id);
                setShowFavorDialog(true);
              }}
            >
              <Gift className="h-3 w-3 mr-1" />
              Add Favor
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8"
              onClick={(e) => {
                e.stopPropagation();
                handleContactClick(relationship);
              }}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My People</h2>
          <p className="text-sm text-gray-600">
            {enrichedRelationships.length} relationships
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search relationships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="family" className="text-xs">
              Family
            </TabsTrigger>
            <TabsTrigger value="friends" className="text-xs">
              Friends
            </TabsTrigger>
            <TabsTrigger value="colleagues" className="text-xs">
              Work
            </TabsTrigger>
            <TabsTrigger value="positive" className="text-xs">
              +
            </TabsTrigger>
            <TabsTrigger value="negative" className="text-xs">
              -
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Relationships List */}
      <AnimatePresence>
        {filteredRelationships.length > 0 ? (
          <div className="space-y-3">
            {filteredRelationships.map((relationship) => (
              <RelationshipCard
                key={relationship.id}
                relationship={relationship}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchTerm ? "No relationships found" : "No relationships yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "Try adjusting your search or filters"
                : "Start building your relationship network"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Relationship
              </Button>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      <AddRelationshipDialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) {
            setEditingRelationship(null);
          }
        }}
        onSuccess={() => {
          setShowAddDialog(false);
          setEditingRelationship(null);
        }}
        editingRelationship={editingRelationship}
      />

      <EnhancedAddFavorDialog
        open={showFavorDialog}
        onOpenChange={setShowFavorDialog}
        relationshipId={selectedRelationship}
        onSuccess={() => {
          setShowFavorDialog(false);
          setSelectedRelationship(null);
        }}
      />
    </div>
  );
};

export const EnhancedRelationshipManager = memo(
  EnhancedRelationshipManagerComponent,
);
