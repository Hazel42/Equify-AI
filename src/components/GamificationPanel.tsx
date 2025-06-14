
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Flame, Award, Users, Heart, TrendingUp } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavors } from "@/hooks/useFavors";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'relationships' | 'favors' | 'balance' | 'consistency';
}

interface Level {
  level: number;
  title: string;
  description: string;
  requiredXP: number;
}

export const GamificationPanel = () => {
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(150);
  const [streak, setStreak] = useState(7);
  const { relationships } = useRelationships();
  const { favors } = useFavors();

  const levels: Level[] = [
    { level: 1, title: "Relationship Novice", description: "Just getting started", requiredXP: 0 },
    { level: 2, title: "Connection Builder", description: "Building meaningful connections", requiredXP: 100 },
    { level: 3, title: "Relationship Strategist", description: "Strategic relationship management", requiredXP: 250 },
    { level: 4, title: "Social Architect", description: "Designing lasting relationships", requiredXP: 500 },
    { level: 5, title: "Connection Master", description: "Master of human connections", requiredXP: 1000 },
  ];

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Connection',
      description: 'Add your first relationship',
      icon: 'Users',
      unlocked: relationships.length > 0,
      progress: Math.min(relationships.length, 1),
      maxProgress: 1,
      category: 'relationships'
    },
    {
      id: '2',
      title: 'Social Butterfly',
      description: 'Maintain 10 relationships',
      icon: 'Heart',
      unlocked: relationships.length >= 10,
      progress: Math.min(relationships.length, 10),
      maxProgress: 10,
      category: 'relationships'
    },
    {
      id: '3',
      title: 'Favor Giver',
      description: 'Give 5 favors',
      icon: 'Star',
      unlocked: favors.filter(f => f.direction === 'given').length >= 5,
      progress: Math.min(favors.filter(f => f.direction === 'given').length, 5),
      maxProgress: 5,
      category: 'favors'
    },
    {
      id: '4',
      title: 'Balance Master',
      description: 'Maintain balance in 80% of relationships',
      icon: 'Target',
      unlocked: false,
      progress: Math.floor(relationships.length * 0.7),
      maxProgress: Math.floor(relationships.length * 0.8),
      category: 'balance'
    },
    {
      id: '5',
      title: 'Consistency King',
      description: 'Maintain a 7-day streak',
      icon: 'Flame',
      unlocked: streak >= 7,
      progress: Math.min(streak, 7),
      maxProgress: 7,
      category: 'consistency'
    }
  ]);

  const currentLevel = levels.find(l => l.level === userLevel);
  const nextLevel = levels.find(l => l.level === userLevel + 1);
  const progressToNext = nextLevel ? 
    ((userXP - (currentLevel?.requiredXP || 0)) / (nextLevel.requiredXP - (currentLevel?.requiredXP || 0))) * 100 : 100;

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return <Users className="h-5 w-5" />;
      case 'Heart': return <Heart className="h-5 w-5" />;
      case 'Star': return <Star className="h-5 w-5" />;
      case 'Target': return <Target className="h-5 w-5" />;
      case 'Flame': return <Flame className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const inProgressAchievements = achievements.filter(a => !a.unlocked && a.progress > 0);

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                Level {userLevel}: {currentLevel?.title}
              </CardTitle>
              <CardDescription>{currentLevel?.description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{userXP} XP</div>
              <div className="text-sm text-gray-500">
                {nextLevel ? `${nextLevel.requiredXP - userXP} to next level` : 'Max level'}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {nextLevel && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to Level {nextLevel.level}</span>
                <span>{Math.round(progressToNext)}%</span>
              </div>
              <Progress value={progressToNext} className="h-3" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Streak */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{streak}</div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Keep up your daily relationship activities to maintain your streak!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-gold-600" />
            Achievements
          </CardTitle>
          <CardDescription>
            {unlockedAchievements.length} of {achievements.length} unlocked
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div>
              <h4 className="font-medium text-green-700 mb-3">Unlocked</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {unlockedAchievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className="p-3 border border-green-200 rounded-lg bg-green-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-green-600">
                        {getAchievementIcon(achievement.icon)}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-green-900">{achievement.title}</h5>
                        <p className="text-sm text-green-700">{achievement.description}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">✓</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* In Progress Achievements */}
          {inProgressAchievements.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-700 mb-3">In Progress</h4>
              <div className="space-y-3">
                {inProgressAchievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className="p-3 border border-blue-200 rounded-lg bg-blue-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600">
                        {getAchievementIcon(achievement.icon)}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-blue-900">{achievement.title}</h5>
                        <p className="text-sm text-blue-700 mb-2">{achievement.description}</p>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-2 flex-1" 
                          />
                          <span className="text-xs text-blue-600">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {achievements.filter(a => !a.unlocked && a.progress === 0).length > 0 && (
            <div>
              <h4 className="font-medium text-gray-500 mb-3">Locked</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {achievements.filter(a => !a.unlocked && a.progress === 0).map(achievement => (
                  <div
                    key={achievement.id}
                    className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3 opacity-60">
                      <div className="text-gray-400">
                        {getAchievementIcon(achievement.icon)}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-600">{achievement.title}</h5>
                        <p className="text-sm text-gray-500">{achievement.description}</p>
                      </div>
                      <Badge variant="outline" className="text-gray-500">Locked</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
