import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  Users,
  MessageCircle,
  Heart,
  Gift,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMonthlyGoals, MonthlyGoal } from "@/hooks/useMonthlyGoals";
import { useRelationships } from "@/hooks/useRelationships";

const goalTypeConfig = {
  contact_frequency: {
    label: "Contact Frequency",
    icon: MessageCircle,
    color: "bg-blue-500",
    description: "Stay in touch more regularly",
  },
  favor_balance: {
    label: "Favor Balance",
    icon: Gift,
    color: "bg-green-500",
    description: "Improve give and take balance",
  },
  relationship_building: {
    label: "Relationship Building",
    icon: Users,
    color: "bg-purple-500",
    description: "Strengthen connections",
  },
  communication: {
    label: "Communication",
    icon: MessageCircle,
    color: "bg-orange-500",
    description: "Better communication habits",
  },
  appreciation: {
    label: "Show Appreciation",
    icon: Heart,
    color: "bg-pink-500",
    description: "Express gratitude more often",
  },
  custom: {
    label: "Custom Goal",
    icon: Target,
    color: "bg-gray-500",
    description: "Set your own objective",
  },
};

export const MonthlyGoals = () => {
  const { currentGoals, goalStats, isLoading, createGoal, updateProgress, deleteGoal } = useMonthlyGoals();
  const { relationships } = useRelationships();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<MonthlyGoal | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal_type: "relationship_building" as MonthlyGoal["goal_type"],
    target_value: 1,
    relationship_id: "",
    priority_level: 3,
    target_month: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;

    try {
      await createGoal.mutateAsync({
        ...formData,
        target_month: formData.target_month,
        metadata: {},
      });
      setShowCreateDialog(false);
      setFormData({
        title: "",
        description: "",
        goal_type: "relationship_building",
        target_value: 1,
        relationship_id: "",
        priority_level: 3,
        target_month: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  const handleProgressUpdate = async (goal: MonthlyGoal, newProgress: number) => {
    const completed = newProgress >= (goal.target_value || 1);
    await updateProgress.mutateAsync({
      goalId: goal.id,
      progress: newProgress,
      completed,
    });
  };

  const getPriorityColor = (level: number) => {
    switch (level) {
      case 5: return "bg-red-500";
      case 4: return "bg-orange-500";
      case 3: return "bg-yellow-500";
      case 2: return "bg-blue-500";
      case 1: return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityLabel = (level: number) => {
    switch (level) {
      case 5: return "Very High";
      case 4: return "High";
      case 3: return "Medium";
      case 2: return "Low";
      case 1: return "Very Low";
      default: return "Unknown";
    }
  };

  const GoalCard = ({ goal }: { goal: MonthlyGoal }) => {
    const config = goalTypeConfig[goal.goal_type];
    const IconComponent = config.icon;
    const progressPercentage = goal.target_value ? Math.min((goal.current_progress / goal.target_value) * 100, 100) : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="group"
      >
        <Card className={`relative transition-all duration-200 hover:shadow-md ${goal.completed ? 'bg-green-50 border-green-200' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${config.color} text-white`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">{goal.title}</CardTitle>
                  <CardDescription className="text-xs">{config.label}</CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`text-xs ${getPriorityColor(goal.priority_level)} text-white`}
                >
                  <Star className="h-3 w-3 mr-1" />
                  {getPriorityLabel(goal.priority_level)}
                </Badge>
                
                {goal.completed && (
                  <Badge variant="default" className="bg-green-600 text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {goal.description && (
              <p className="text-sm text-gray-600">{goal.description}</p>
            )}

            {goal.relationships && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {goal.relationships.name} ({goal.relationships.relationship_type})
                </span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">
                  {goal.current_progress} / {goal.target_value || 1}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProgressUpdate(goal, goal.current_progress + 1)}
                  disabled={goal.completed || updateProgress.isPending}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Update Progress
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingGoal(goal)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your monthly goal.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteGoal.mutate(goal.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Show content immediately with skeleton for individual goals loading
  const showSkeleton = isLoading && currentGoals.length === 0;

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Monthly Goals
              </CardTitle>
              <CardDescription>
                Track and achieve your relationship goals this month
              </CardDescription>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create Monthly Goal</DialogTitle>
                  <DialogDescription>
                    Set a goal to improve your relationships this month
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Call mom twice a week"
                    />
                  </div>

                  <div>
                    <Label htmlFor="goal_type">Goal Type</Label>
                    <Select value={formData.goal_type} onValueChange={(value) => setFormData({ ...formData, goal_type: value as MonthlyGoal["goal_type"] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(goalTypeConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <config.icon className="h-4 w-4" />
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="target_value">Target Value</Label>
                      <Input
                        id="target_value"
                        type="number"
                        min="1"
                        value={formData.target_value}
                        onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) || 1 })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="priority_level">Priority</Label>
                      <Select value={formData.priority_level.toString()} onValueChange={(value) => setFormData({ ...formData, priority_level: parseInt(value) })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">Very High</SelectItem>
                          <SelectItem value="4">High</SelectItem>
                          <SelectItem value="3">Medium</SelectItem>
                          <SelectItem value="2">Low</SelectItem>
                          <SelectItem value="1">Very Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {relationships && relationships.length > 0 && (
                    <div>
                      <Label htmlFor="relationship">Related Person (Optional)</Label>
                      <Select value={formData.relationship_id} onValueChange={(value) => setFormData({ ...formData, relationship_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a person" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {relationships.map((relationship) => (
                            <SelectItem key={relationship.id} value={relationship.id}>
                              {relationship.name} ({relationship.relationship_type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add more details about your goal..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={!formData.title.trim() || createGoal.isPending}>
                    {createGoal.isPending ? "Creating..." : "Create Goal"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{goalStats.total}</div>
              <div className="text-xs text-gray-600">Total Goals</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{goalStats.completed}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{goalStats.inProgress}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{goalStats.completionRate}%</div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="space-y-4">
        <AnimatePresence>
          {showSkeleton ? (
            // Skeleton loading for first load only
            <Card>
              <CardContent className="py-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ) : currentGoals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first monthly goal to improve your relationships!
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            currentGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};