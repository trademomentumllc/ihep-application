import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { 
  Award, 
  CheckCircle2, 
  Gift, 
  Activity, 
  Flame, 
  Heart, 
  Calendar, 
  BookOpen, 
  Pill, 
  User, 
  LayoutList,
  Star,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Define types for our data
interface HealthActivity {
  id: number;
  name: string;
  description: string;
  category: string;
  pointsValue: number;
  frequency: string;
}

interface UserActivity {
  id: number;
  userId: number;
  activityId: number;
  completedAt: string;
  pointsEarned: number;
  activity: HealthActivity;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  level: number;
  pointsRequired: number;
  category: string;
}

interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  unlockedAt: string;
  achievement: Achievement;
}

interface UserPoints {
  id: number;
  userId: number;
  totalPoints: number;
  availablePoints: number;
  lifetimePoints: number;
  currentStreak: number;
  longestStreak: number;
  lastActivity: string;
}

interface Reward {
  id: number;
  name: string;
  description: string;
  category: string;
  pointsCost: number;
  imageUrl?: string;
}

interface UserReward {
  id: number;
  userId: number;
  rewardId: number;
  earnedAt: string;
  redeemedAt?: string;
  code?: string;
  status: 'active' | 'redeemed' | 'expired';
  reward: Reward;
}

interface PointsTransaction {
  id: number;
  userId: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  physical: <Activity className="h-5 w-5" />,
  mental: <Heart className="h-5 w-5" />,
  medication: <Pill className="h-5 w-5" />,
  appointment: <Calendar className="h-5 w-5" />,
  education: <BookOpen className="h-5 w-5" />,
  social: <User className="h-5 w-5" />,
  streak: <Flame className="h-5 w-5" />,
  general: <Star className="h-5 w-5" />
};

const Rewards = () => {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedActivity, setSelectedActivity] = useState<HealthActivity | null>(null);
  const [activityNotes, setActivityNotes] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  
  // Fetch user points
  const { 
    data: userPoints,
    isLoading: pointsLoading 
  } = useQuery({
    queryKey: ['/api/gamification/user/points'],
    enabled: isAuthenticated,
  });
  
  // Fetch available activities
  const { 
    data: availableActivities,
    isLoading: activitiesLoading 
  } = useQuery({
    queryKey: ['/api/gamification/activities', filterCategory],
    enabled: isAuthenticated,
  });
  
  // Fetch user's completed activities
  const { 
    data: userActivities,
    isLoading: userActivitiesLoading 
  } = useQuery({
    queryKey: ['/api/gamification/user/activities'],
    enabled: isAuthenticated,
  });
  
  // Fetch achievements
  const { 
    data: achievements,
    isLoading: achievementsLoading 
  } = useQuery({
    queryKey: ['/api/gamification/achievements'],
    enabled: isAuthenticated,
  });
  
  // Fetch user's earned achievements
  const { 
    data: userAchievements,
    isLoading: userAchievementsLoading 
  } = useQuery({
    queryKey: ['/api/gamification/user/achievements'],
    enabled: isAuthenticated,
  });
  
  // Fetch rewards
  const { 
    data: rewards,
    isLoading: rewardsLoading 
  } = useQuery({
    queryKey: ['/api/gamification/rewards'],
    enabled: isAuthenticated,
  });
  
  // Fetch user's redeemed rewards
  const { 
    data: userRewards,
    isLoading: userRewardsLoading 
  } = useQuery({
    queryKey: ['/api/gamification/user/rewards'],
    enabled: isAuthenticated,
  });
  
  // Fetch points history
  const { 
    data: pointsHistory,
    isLoading: historyLoading 
  } = useQuery({
    queryKey: ['/api/gamification/user/points/history'],
    enabled: isAuthenticated,
  });
  
  // Record activity mutation
  const recordActivity = useMutation({
    mutationFn: (data: { activityId: number; notes?: string }) => {
      return apiRequest('/api/gamification/activities/record', {
        method: 'POST',
        data
      });
    },
    onSuccess: () => {
      toast({
        title: "Activity Recorded!",
        description: "You've earned points for completing this activity",
      });
      setSelectedActivity(null);
      setActivityNotes('');
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/user/points'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/user/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/user/achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/user/points/history'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Recording Activity",
        description: error.message || "Something went wrong. Please try again.",
      });
    }
  });
  
  // Redeem reward mutation
  const redeemReward = useMutation({
    mutationFn: (rewardId: number) => {
      return apiRequest('/api/gamification/rewards/redeem', {
        method: 'POST',
        data: { rewardId }
      });
    },
    onSuccess: () => {
      toast({
        title: "Reward Redeemed!",
        description: "Check your rewards tab to view your redemption code",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/user/points'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/user/rewards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/user/points/history'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Redeeming Reward",
        description: error.message || "Something went wrong. Please try again.",
      });
    }
  });
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login?redirect=/rewards');
    return null;
  }
  
  // Handle recording an activity
  const handleRecordActivity = (activity: HealthActivity) => {
    setSelectedActivity(activity);
    setActiveTab('record');
  };
  
  // Submit activity completion
  const handleSubmitActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;
    
    recordActivity.mutate({
      activityId: selectedActivity.id,
      notes: activityNotes || undefined
    });
  };
  
  // Handle redeeming a reward
  const handleRedeemReward = (reward: Reward) => {
    if (!userPoints || userPoints.availablePoints < reward.pointsCost) {
      toast({
        variant: "destructive",
        title: "Insufficient Points",
        description: `You need ${reward.pointsCost} points to redeem this reward. You currently have ${userPoints?.availablePoints || 0} points.`,
      });
      return;
    }
    
    if (window.confirm(`Are you sure you want to redeem "${reward.name}" for ${reward.pointsCost} points?`)) {
      redeemReward.mutate(reward.id);
    }
  };
  
  // Filter activities by category
  const handleFilterActivities = (category: string | null) => {
    setFilterCategory(category);
  };
  
  // Count completed activities by category
  const getCompletedActivitiesByCategory = (category: string) => {
    if (!userActivities) return 0;
    return userActivities.filter(ua => ua.activity.category === category).length;
  };
  
  // Get the next achievement for a category
  const getNextAchievement = (category: string) => {
    if (!achievements || !userAchievements) return null;
    
    const earnedAchievementIds = userAchievements.map(ua => ua.id);
    
    return achievements
      .filter(a => a.category === category && !earnedAchievementIds.includes(a.id))
      .sort((a, b) => a.pointsRequired - b.pointsRequired)[0];
  };
  
  // Format date with time
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Format date only
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <>
      <Helmet>
        <title>Health Rewards | {APP_NAME}</title>
        <meta name="description" content="Earn points and rewards for healthy activities and achievements" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-primary">
            Health Engagement Rewards
          </h1>
          
          {userPoints && (
            <div className="flex flex-col mt-4 md:mt-0 md:flex-row md:items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Points</p>
                  <p className="text-2xl font-bold text-primary">{userPoints.availablePoints}</p>
                </div>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-lg flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Flame className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-amber-700">Current Streak</p>
                  <p className="text-2xl font-bold text-amber-600">{userPoints.currentStreak} days</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="record">Record Activity</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            {pointsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="spinner"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Your Health Engagement Summary
                      </CardTitle>
                      <CardDescription>
                        Track your progress and unlock achievements by completing health activities
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Progress Overview */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="text-sm font-medium">Lifetime Points</h3>
                            <p className="text-2xl font-bold">{userPoints?.lifetimePoints || 0}</p>
                          </div>
                          
                          {userAchievements && userAchievements.length > 0 && (
                            <div className="text-right">
                              <h3 className="text-sm font-medium">Achievements Earned</h3>
                              <p className="text-2xl font-bold">{userAchievements.length}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Progress to next tier */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progress to next tier</span>
                            <span className="font-medium">
                              {userPoints?.lifetimePoints || 0} / 1000
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(((userPoints?.lifetimePoints || 0) / 1000) * 100, 100)} 
                            className="h-2"
                          />
                          <p className="text-xs text-gray-500">
                            Earn {1000 - (userPoints?.lifetimePoints || 0)} more points to reach the next tier
                          </p>
                        </div>
                      </div>
                      
                      {/* Recent Activities */}
                      <div>
                        <h3 className="font-medium mb-3">Recent Activities</h3>
                        {userActivitiesLoading ? (
                          <p>Loading activities...</p>
                        ) : userActivities && userActivities.length > 0 ? (
                          <div className="space-y-2">
                            {userActivities.slice(0, 3).map((activity) => (
                              <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                                <div className="p-2 bg-primary/10 rounded-full mr-3">
                                  {categoryIcons[activity.activity.category] || <Activity className="h-4 w-4 text-primary" />}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{activity.activity.name}</p>
                                  <p className="text-xs text-gray-500">{formatDateTime(activity.completedAt)}</p>
                                </div>
                                <Badge variant="outline" className="ml-auto bg-primary/5">
                                  +{activity.pointsEarned} pts
                                </Badge>
                              </div>
                            ))}
                            <Button variant="ghost" className="w-full text-sm" onClick={() => setActiveTab('activities')}>
                              View All Activities
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-gray-50 rounded-md">
                            <p className="text-gray-500">You haven't recorded any activities yet</p>
                            <Button variant="link" onClick={() => setActiveTab('activities')}>
                              Start earning points now
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Streak Info */}
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <Flame className="h-6 w-6 text-amber-500" />
                          <h3 className="font-medium text-amber-800">Activity Streak</h3>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-amber-800">
                              You're on a <span className="font-bold">{userPoints?.currentStreak || 0}-day</span> streak!
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              Longest streak: {userPoints?.longestStreak || 0} days
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-amber-200 bg-white text-amber-800 hover:bg-amber-100"
                            onClick={() => setActiveTab('activities')}
                          >
                            Keep It Going
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  {/* Achievements Card */}
                  <Card className="mb-6">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Recent Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userAchievementsLoading ? (
                        <p>Loading achievements...</p>
                      ) : userAchievements && userAchievements.length > 0 ? (
                        <div className="space-y-3">
                          {userAchievements.slice(0, 3).map((achievement) => (
                            <div key={achievement.id} className="flex items-center p-2 bg-gray-50 rounded-md">
                              <div className="p-1.5 bg-yellow-100 rounded-full mr-3">
                                <Award className="h-4 w-4 text-yellow-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{achievement.name}</p>
                                <p className="text-xs text-gray-500">{achievement.description}</p>
                              </div>
                            </div>
                          ))}
                          <Button variant="ghost" className="w-full text-sm" onClick={() => setActiveTab('achievements')}>
                            View All
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-gray-50 rounded-md">
                          <p className="text-gray-500">Complete activities to earn achievements</p>
                          <Button variant="link" onClick={() => setActiveTab('activities')}>
                            Start now
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Rewards Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5" />
                        Available Rewards
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {rewardsLoading ? (
                        <p>Loading rewards...</p>
                      ) : rewards && rewards.length > 0 ? (
                        <div className="space-y-3">
                          {rewards.slice(0, 3).map((reward) => (
                            <div key={reward.id} className="flex items-center p-2 bg-gray-50 rounded-md">
                              <div className="p-1.5 bg-primary/10 rounded-full mr-3">
                                <Gift className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{reward.name}</p>
                                <p className="text-xs text-primary font-medium">{reward.pointsCost} points</p>
                              </div>
                            </div>
                          ))}
                          <Button variant="ghost" className="w-full text-sm" onClick={() => setActiveTab('rewards')}>
                            View All Rewards
                          </Button>
                        </div>
                      ) : (
                        <p>No rewards available at this time</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Health Activities</CardTitle>
                <CardDescription>
                  Complete these activities to earn points and improve your health
                </CardDescription>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge 
                    variant={filterCategory === null ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => handleFilterActivities(null)}
                  >
                    All
                  </Badge>
                  <Badge 
                    variant={filterCategory === 'physical' ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => handleFilterActivities('physical')}
                  >
                    <Activity className="h-3 w-3 mr-1" /> 
                    Physical
                  </Badge>
                  <Badge 
                    variant={filterCategory === 'mental' ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => handleFilterActivities('mental')}
                  >
                    <Heart className="h-3 w-3 mr-1" /> 
                    Mental
                  </Badge>
                  <Badge 
                    variant={filterCategory === 'medication' ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => handleFilterActivities('medication')}
                  >
                    <Pill className="h-3 w-3 mr-1" /> 
                    Medication
                  </Badge>
                  <Badge 
                    variant={filterCategory === 'appointment' ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => handleFilterActivities('appointment')}
                  >
                    <Calendar className="h-3 w-3 mr-1" /> 
                    Appointments
                  </Badge>
                  <Badge 
                    variant={filterCategory === 'education' ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => handleFilterActivities('education')}
                  >
                    <BookOpen className="h-3 w-3 mr-1" /> 
                    Education
                  </Badge>
                  <Badge 
                    variant={filterCategory === 'social' ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => handleFilterActivities('social')}
                  >
                    <User className="h-3 w-3 mr-1" /> 
                    Social
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="spinner"></div>
                  </div>
                ) : availableActivities && availableActivities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableActivities.map((activity) => (
                      <Card key={activity.id} className="overflow-hidden border">
                        <div className={`
                          p-3 text-white
                          ${activity.category === 'physical' ? 'bg-blue-600' : ''}
                          ${activity.category === 'mental' ? 'bg-purple-600' : ''}
                          ${activity.category === 'medication' ? 'bg-emerald-600' : ''}
                          ${activity.category === 'appointment' ? 'bg-orange-600' : ''}
                          ${activity.category === 'education' ? 'bg-cyan-600' : ''}
                          ${activity.category === 'social' ? 'bg-pink-600' : ''}
                        `}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {categoryIcons[activity.category]}
                              <span className="capitalize">{activity.category}</span>
                            </div>
                            <Badge variant="outline" className="bg-white/20 border-white/10 text-white">
                              {activity.frequency}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-lg mb-1">{activity.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{activity.description}</p>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="bg-primary/5">
                              +{activity.pointsValue} points
                            </Badge>
                            <Button 
                              size="sm" 
                              onClick={() => handleRecordActivity(activity)}
                            >
                              Record Activity
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No activities found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Record Activity Tab */}
          <TabsContent value="record">
            <Card>
              <CardHeader>
                <CardTitle>Record Activity</CardTitle>
                <CardDescription>
                  {selectedActivity 
                    ? `Record your completion of "${selectedActivity.name}"`
                    : "Select an activity from the Activities tab to record it"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedActivity ? (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Activity Selected</h3>
                    <p className="text-gray-500 mb-4">
                      Please select an activity from the Activities tab to record your progress
                    </p>
                    <Button onClick={() => setActiveTab('activities')}>
                      Browse Activities
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitActivity} className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        {categoryIcons[selectedActivity.category]}
                        <h3 className="font-medium">{selectedActivity.name}</h3>
                        <Badge className="ml-auto">{selectedActivity.pointsValue} pts</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{selectedActivity.description}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea 
                          id="notes"
                          placeholder="Add any details about this activity..."
                          value={activityNotes}
                          onChange={(e) => setActivityNotes(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      {/* Can add file upload for proof here if needed */}
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setSelectedActivity(null);
                          setActivityNotes('');
                          setActiveTab('activities');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={recordActivity.isPending}
                      >
                        {recordActivity.isPending ? "Submitting..." : "Record Completion"}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Achievements
                    </CardTitle>
                    <CardDescription>
                      Complete health activities to unlock these achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {achievementsLoading || userAchievementsLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="spinner"></div>
                      </div>
                    ) : achievements && userAchievements ? (
                      <div className="space-y-6">
                        {['physical', 'mental', 'medication', 'appointment', 'education', 'social', 'streak', 'general'].map((category) => {
                          const categoryAchievements = achievements.filter(a => a.category === category);
                          const earnedAchievements = userAchievements.filter(a => a.category === category);
                          
                          if (categoryAchievements.length === 0) return null;
                          
                          return (
                            <div key={category} className="space-y-3">
                              <div className="flex items-center gap-2">
                                {categoryIcons[category]}
                                <h3 className="font-medium capitalize">{category} Achievements</h3>
                                <Badge variant="outline" className="ml-2">
                                  {earnedAchievements.length}/{categoryAchievements.length}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {categoryAchievements.map((achievement) => {
                                  const isEarned = userAchievements.some(ua => ua.id === achievement.id);
                                  
                                  return (
                                    <div 
                                      key={achievement.id} 
                                      className={`p-4 rounded-lg border ${isEarned 
                                        ? 'bg-yellow-50 border-yellow-200' 
                                        : 'bg-gray-50 border-gray-200'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-full ${isEarned 
                                          ? 'bg-yellow-100' 
                                          : 'bg-gray-200'
                                        }`}>
                                          <Award className={`h-5 w-5 ${isEarned 
                                            ? 'text-yellow-600' 
                                            : 'text-gray-500'
                                          }`} />
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-sm">{achievement.name}</h4>
                                          <p className="text-xs text-gray-600">{achievement.description}</p>
                                          
                                          <div className="mt-2 flex justify-between items-center">
                                            <Badge 
                                              variant="outline" 
                                              className={isEarned ? 'bg-yellow-100 border-yellow-200' : ''}
                                            >
                                              {achievement.pointsRequired} pts
                                            </Badge>
                                            
                                            {isEarned ? (
                                              <Badge className="bg-yellow-500">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Earned
                                              </Badge>
                                            ) : (
                                              <Badge variant="outline">Locked</Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p>No achievements available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LayoutList className="h-5 w-5" />
                      Achievement Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userAchievementsLoading ? (
                      <p>Loading progress...</p>
                    ) : userAchievements ? (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Total Achievements</h3>
                            <Badge variant="outline" className="bg-yellow-100 border-yellow-200">
                              {userAchievements.length} earned
                            </Badge>
                          </div>
                          
                          <Progress 
                            value={achievements ? (userAchievements.length / achievements.length) * 100 : 0} 
                            className="h-2 mb-1"
                          />
                          
                          <p className="text-xs text-gray-600">
                            {achievements ? `${userAchievements.length} of ${achievements.length} achievements earned` : ''}
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-3">
                          <h3 className="font-medium">Progress by Category</h3>
                          
                          {['physical', 'mental', 'medication', 'appointment', 'education', 'social'].map((category) => {
                            if (!achievements) return null;
                            
                            const categoryAchievements = achievements.filter(a => a.category === category);
                            const earnedCategoryAchievements = userAchievements.filter(a => a.category === category);
                            
                            if (categoryAchievements.length === 0) return null;
                            
                            const progressPercent = (earnedCategoryAchievements.length / categoryAchievements.length) * 100;
                            
                            return (
                              <div key={category} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm flex items-center gap-1 capitalize">
                                    {categoryIcons[category]}
                                    {category}
                                  </span>
                                  <span className="text-xs">
                                    {earnedCategoryAchievements.length}/{categoryAchievements.length}
                                  </span>
                                </div>
                                <Progress value={progressPercent} className="h-1.5" />
                              </div>
                            );
                          })}
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="font-medium mb-3">Next Achievements</h3>
                          
                          {['physical', 'mental', 'medication'].map((category) => {
                            const nextAchievement = getNextAchievement(category);
                            if (!nextAchievement) return null;
                            
                            return (
                              <div key={category} className="mb-3 bg-gray-50 p-3 rounded-md">
                                <div className="flex items-center gap-2">
                                  {categoryIcons[category]}
                                  <div>
                                    <p className="text-sm font-medium">{nextAchievement.name}</p>
                                    <div className="flex justify-between">
                                      <p className="text-xs text-gray-500">{nextAchievement.pointsRequired} points required</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p>No achievement data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Rewards Tab */}
          <TabsContent value="rewards">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      Available Rewards
                    </CardTitle>
                    <CardDescription>
                      Redeem your points for these exclusive rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {rewardsLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="spinner"></div>
                      </div>
                    ) : rewards && rewards.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rewards.map((reward) => (
                          <Card key={reward.id} className="overflow-hidden border">
                            <div className={`
                              p-3 text-white
                              ${reward.category === 'discount' ? 'bg-green-600' : ''}
                              ${reward.category === 'gift_card' ? 'bg-purple-600' : ''}
                              ${reward.category === 'merchandise' ? 'bg-blue-600' : ''}
                              ${reward.category === 'badge' ? 'bg-yellow-600' : ''}
                              ${reward.category === 'feature_unlock' ? 'bg-indigo-600' : ''}
                            `}>
                              <div className="flex justify-between items-center">
                                <span className="capitalize">{reward.category.replace('_', ' ')}</span>
                                <Badge variant="outline" className="bg-white/20 border-white/10 text-white">
                                  {reward.pointsCost} points
                                </Badge>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-medium text-lg mb-1">{reward.name}</h3>
                              <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                              <div className="flex justify-end">
                                <Button 
                                  size="sm" 
                                  disabled={!userPoints || userPoints.availablePoints < reward.pointsCost}
                                  onClick={() => handleRedeemReward(reward)}
                                >
                                  Redeem Reward
                                </Button>
                              </div>
                              {(!userPoints || userPoints.availablePoints < reward.pointsCost) && (
                                <p className="text-xs text-gray-500 mt-2 text-right">
                                  You need {reward.pointsCost - (userPoints?.availablePoints || 0)} more points
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No rewards available at this time</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Your Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pointsLoading ? (
                      <p>Loading points...</p>
                    ) : userPoints ? (
                      <div className="space-y-4">
                        <div className="bg-primary/10 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-600">Available Points</h3>
                          <p className="text-3xl font-bold text-primary">{userPoints.availablePoints}</p>
                          
                          <div className="mt-2 text-sm">
                            <p className="text-gray-600">
                              Lifetime: <span className="font-medium">{userPoints.lifetimePoints}</span> points
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium mb-2">What can I get?</h3>
                          
                          {rewards && (
                            <div className="space-y-2">
                              {rewards
                                .filter(r => r.pointsCost <= (userPoints?.availablePoints || 0))
                                .slice(0, 3)
                                .map(reward => (
                                  <div key={reward.id} className="flex justify-between items-center">
                                    <span className="text-sm">{reward.name}</span>
                                    <Badge variant="outline">{reward.pointsCost} pts</Badge>
                                  </div>
                                ))
                              }
                              
                              {rewards.filter(r => r.pointsCost <= (userPoints?.availablePoints || 0)).length === 0 && (
                                <p className="text-sm text-gray-500">
                                  Complete more activities to earn rewards
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p>No points data available</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Your Redeemed Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userRewardsLoading ? (
                      <p>Loading rewards...</p>
                    ) : userRewards && userRewards.length > 0 ? (
                      <div className="space-y-3">
                        {userRewards.map((userReward) => (
                          <div key={userReward.id} className={`p-3 rounded-md border ${
                            userReward.status === 'active' ? 'border-green-200 bg-green-50' :
                            userReward.status === 'redeemed' ? 'border-gray-200 bg-gray-50' :
                            'border-red-200 bg-red-50'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm">{userReward.reward.name}</h4>
                                <p className="text-xs text-gray-600">
                                  Earned on {formatDate(userReward.earnedAt)}
                                </p>
                              </div>
                              <Badge 
                                variant={userReward.status === 'active' ? 'default' : 'outline'}
                                className={
                                  userReward.status === 'redeemed' ? 'bg-gray-100' :
                                  userReward.status === 'expired' ? 'bg-red-100 text-red-800' : ''
                                }
                              >
                                {userReward.status}
                              </Badge>
                            </div>
                            
                            {userReward.status === 'active' && userReward.code && (
                              <div className="mt-2 p-2 bg-white rounded border border-green-200">
                                <p className="text-xs text-gray-600">Redemption Code:</p>
                                <p className="font-mono font-medium text-sm">{userReward.code}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-md">
                        <p className="text-gray-500">No rewards redeemed yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Points History</CardTitle>
                <CardDescription>
                  View your points earning and spending history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="spinner"></div>
                  </div>
                ) : pointsHistory && pointsHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pointsHistory.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {formatDateTime(transaction.createdAt)}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={
                                transaction.type === 'earned' ? 'bg-green-50 text-green-700' :
                                transaction.type === 'spent' ? 'bg-red-50 text-red-700' :
                                transaction.type === 'bonus' ? 'bg-blue-50 text-blue-700' :
                                transaction.type === 'expired' ? 'bg-gray-50 text-gray-700' :
                                'bg-gray-50'
                              }
                            >
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No points history available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Rewards;