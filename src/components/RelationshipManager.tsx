
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Heart, MessageCircle, Calendar } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { AddRelationshipDialog } from "@/components/AddRelationshipDialog";

export const RelationshipManager = () => {
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { relationships, isLoading } = useRelationships();

  const getImportanceColor = (level: number) => {
    if (level >= 4) return 'bg-red-100 text-red-700 border-red-200';
    if (level >= 3) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (level >= 2) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getImportanceLabel = (level: number) => {
    if (level >= 4) return 'Very High';
    if (level >= 3) return 'High';
    if (level >= 2) return 'Medium';
    return 'Low';
  };

  const handleRelationshipClick = (relationshipId: string) => {
    console.log('Navigating to relationship:', relationshipId);
    navigate(`/relationship/${relationshipId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            My Relationships
          </h2>
          <p className="text-gray-600">Manage your important relationships</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Relationship
        </Button>
      </div>

      {relationships.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-semibold">No relationships yet</p>
              <p className="text-sm">Start by adding your first relationship.</p>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="mt-4 bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Relationship
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relationships.map((relationship) => (
            <Card 
              key={relationship.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleRelationshipClick(relationship.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{relationship.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {relationship.relationship_type.replace('_', ' ')}
                    </CardDescription>
                  </div>
                  <Badge className={getImportanceColor(relationship.importance_level)}>
                    {getImportanceLabel(relationship.importance_level)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle add favor
                    }}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Add Favor
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle contact
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle calendar
                    }}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddRelationshipDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </div>
  );
};
