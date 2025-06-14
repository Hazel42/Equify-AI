
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Heart, Star } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useToast } from "@/hooks/use-toast";

interface AddRelationshipFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

const AddRelationshipForm = ({ onSave, onCancel }: AddRelationshipFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    relationship_type: "",
    importance_level: 3,
    contact_info: { email: "", phone: "" },
    preferences: { communication_style: "", gift_preferences: "", availability: "" }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter person's name"
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Relationship Type *</Label>
          <Select
            value={formData.relationship_type}
            onValueChange={(value) => setFormData({ ...formData, relationship_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="friend">Friend</SelectItem>
              <SelectItem value="colleague">Colleague</SelectItem>
              <SelectItem value="neighbor">Neighbor</SelectItem>
              <SelectItem value="acquaintance">Acquaintance</SelectItem>
              <SelectItem value="mentor">Mentor</SelectItem>
              <SelectItem value="romantic">Romantic Partner</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="importance">Importance Level</Label>
        <Select
          value={formData.importance_level.toString()}
          onValueChange={(value) => setFormData({ ...formData, importance_level: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - Acquaintance</SelectItem>
            <SelectItem value="2">2 - Casual</SelectItem>
            <SelectItem value="3">3 - Important</SelectItem>
            <SelectItem value="4">4 - Very Important</SelectItem>
            <SelectItem value="5">5 - Essential</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.contact_info.email}
            onChange={(e) => setFormData({
              ...formData,
              contact_info: { ...formData.contact_info, email: e.target.value }
            })}
            placeholder="email@example.com"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.contact_info.phone}
            onChange={(e) => setFormData({
              ...formData,
              contact_info: { ...formData.contact_info, phone: e.target.value }
            })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="communication">Communication Style</Label>
        <Textarea
          id="communication"
          value={formData.preferences.communication_style}
          onChange={(e) => setFormData({
            ...formData,
            preferences: { ...formData.preferences, communication_style: e.target.value }
          })}
          placeholder="How do they prefer to communicate? (e.g., text, call, email)"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="gifts">Gift & Favor Preferences</Label>
        <Textarea
          id="gifts"
          value={formData.preferences.gift_preferences}
          onChange={(e) => setFormData({
            ...formData,
            preferences: { ...formData.preferences, gift_preferences: e.target.value }
          })}
          placeholder="What do they like? Hobbies, interests, favorite things..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Add Relationship
        </Button>
      </div>
    </form>
  );
};

export const RelationshipManager = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const { relationships, addRelationship, updateRelationship, deleteRelationship, isLoading } = useRelationships();
  const { toast } = useToast();

  const handleAddRelationship = async (data: any) => {
    try {
      await addRelationship.mutateAsync(data);
      setShowAddForm(false);
      toast({
        title: "Relationship Added",
        description: `${data.name} has been added to your relationship network.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add relationship. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getImportanceColor = (level: number) => {
    switch (level) {
      case 5: return "bg-red-100 text-red-700 border-red-200";
      case 4: return "bg-orange-100 text-orange-700 border-orange-200";
      case 3: return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case 2: return "bg-blue-100 text-blue-700 border-blue-200";
      case 1: return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getImportanceIcon = (level: number) => {
    const icons = [];
    for (let i = 0; i < level; i++) {
      icons.push(<Star key={i} className="h-3 w-3 fill-current" />);
    }
    return icons;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-500">Loading relationships...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relationship Manager</h2>
          <p className="text-gray-600">Manage your personal and professional relationships</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Relationship
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Relationship</DialogTitle>
            </DialogHeader>
            <AddRelationshipForm
              onSave={handleAddRelationship}
              onCancel={() => setShowAddForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {relationships.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Relationships Yet</h3>
            <p className="text-gray-500 mb-6">Start building your relationship network by adding your first connection.</p>
            <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Relationship
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relationships.map((relationship) => (
            <Card key={relationship.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{relationship.name}</CardTitle>
                    <CardDescription className="capitalize">{relationship.relationship_type}</CardDescription>
                  </div>
                  <Badge className={getImportanceColor(relationship.importance_level)}>
                    <div className="flex items-center gap-1">
                      {getImportanceIcon(relationship.importance_level)}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Balance Score: 7.5/10</span>
                </div>
                
                {relationship.contact_info && typeof relationship.contact_info === 'object' && 'email' in relationship.contact_info && relationship.contact_info.email && (
                  <div className="text-sm text-gray-600">
                    📧 {relationship.contact_info.email as string}
                  </div>
                )}
                
                {relationship.preferences && typeof relationship.preferences === 'object' && 'communication_style' in relationship.preferences && relationship.preferences.communication_style && (
                  <div className="text-sm text-gray-600">
                    💬 {relationship.preferences.communication_style as string}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
