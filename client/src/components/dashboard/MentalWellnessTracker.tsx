import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Heart, 
  Activity, 
  BarChart, 
  CheckCircle2, 
  Calendar, 
  Lightbulb, 
  Target,
  LucideIcon
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Define activity types
type MentalActivity = {
  id: number;
  title: string;
  description: string;
  category: 'mindfulness' | 'cognitive' | 'emotional' | 'social';
  icon: React.ElementType;
  duration: number; // in minutes
  completed?: boolean;
  streak?: number;
};

type ProgressData = {
  cognition: number;
  emotional: number;
  social: number;
  mindfulness: number;
};

// Mock data - in real app would come from backend
const mentalActivities: MentalActivity[] = [
  {
    id: 1,
    title: "Mindful Breathing",
    description: "Take 5 minutes to focus on your breath. Notice when your mind wanders and gently bring it back.",
    category: "mindfulness",
    icon: Heart,
    duration: 5,
    streak: 3
  },
  {
    id: 2,
    title: "Gratitude Practice",
    description: "Write down three things you're grateful for today, and why they matter to you.",
    category: "emotional",
    icon: CheckCircle2,
    duration: 5,
    streak: 5
  },
  {
    id: 3,
    title: "Word Puzzles",
    description: "Solve a crossword puzzle or word game to strengthen verbal reasoning.",
    category: "cognitive",
    icon: Brain,
    duration: 15
  },
  {
    id: 4,
    title: "Social Connection",
    description: "Reach out to a friend or family member you haven't spoken to in a while.",
    category: "social",
    icon: Activity,
    duration: 15
  },
  {
    id: 5,
    title: "Memory Challenge",
    description: "Memorize a short poem or quote and recite it later in the day.",
    category: "cognitive",
    icon: Brain,
    duration: 10
  },
  {
    id: 6,
    title: "Positive Affirmations",
    description: "Practice saying three positive affirmations about yourself.",
    category: "emotional",
    icon: Heart,
    duration: 5,
    streak: 2
  },
  {
    id: 7,
    title: "Body Scan Meditation",
    description: "Perform a progressive body scan meditation to enhance mind-body awareness.",
    category: "mindfulness",
    icon: Activity,
    duration: 10
  }
];

// Weekly goals
const weeklyGoals = [
  {
    id: 1,
    title: "Complete 3 cognitive exercises",
    progress: 1,
    target: 3,
    icon: Brain
  },
  {
    id: 2,
    title: "Practice mindfulness for 30 minutes",
    progress: 15,
    target: 30,
    icon: Heart
  },
  {
    id: 3,
    title: "Make 2 social connections",
    progress: 1,
    target: 2,
    icon: Activity
  }
];

// Insights and tips
const insights = [
  "Your cognitive performance is typically higher in the morning",
  "Regular mindfulness practice is helping improve your emotional regulation",
  "Consider adding more social activities to maintain balance",
  "Your streak for gratitude practice is your longest - keep it up!"
];

interface MentalWellnessTrackerProps {
  userId?: number;
}

const MentalWellnessTracker = ({ userId }: MentalWellnessTrackerProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // State for activities
  const [activities, setActivities] = useState<MentalActivity[]>(mentalActivities);
  
  // Mock data for wellness progress
  const [progressData, setProgressData] = useState<ProgressData>({
    cognition: 68,
    emotional: 75,
    social: 45,
    mindfulness: 82
  });

  // Handle completing an activity
  const completeActivity = (activityId: number) => {
    setActivities(activities.map(activity => 
      activity.id === activityId 
        ? { ...activity, completed: true, streak: (activity.streak || 0) + 1 } 
        : activity
    ));

    // Update progress data (in a real app, this would be more sophisticated)
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      const categoryMap = {
        'cognitive': 'cognition',
        'emotional': 'emotional',
        'social': 'social',
        'mindfulness': 'mindfulness'
      } as const;
      
      const category = categoryMap[activity.category] || 'cognition';
      
      setProgressData({
        ...progressData,
        [category]: Math.min(100, progressData[category] + 5)
      });
    }
  };

  // Handle viewing monthly goals
  const handleViewMonthlyGoals = () => {
    navigate('/wellness/goals');
  };

  // Handle viewing detailed analysis
  const handleViewDetailedAnalysis = () => {
    navigate('/wellness/analysis');
  };

  // Handle viewing history
  const handleViewHistory = () => {
    navigate('/wellness/history');
  };

  // Function to render activities by category
  const renderActivitiesByCategory = (category: 'mindfulness' | 'cognitive' | 'emotional' | 'social') => {
    const filteredActivities = activities.filter(a => a.category === category);
    
    if (filteredActivities.length === 0) {
      return (
        <p className="text-gray-500 text-center py-4">No activities found in this category</p>
      );
    }
    
    return (
      <div className="space-y-3">
        {filteredActivities.map(activity => (
          <div key={activity.id} className="flex justify-between items-start border-b pb-3 last:border-0">
            <div className="flex items-start">
              <activity.icon className="h-5 w-5 text-primary mr-3 mt-0.5" />
              <div>
                <div className="flex items-center">
                  <h4 className="font-medium">{activity.title}</h4>
                  {activity.streak && activity.streak > 0 && (
                    <span className="ml-2 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                      {activity.streak} day streak
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.duration} min</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant={activity.completed ? "outline" : "default"}
              disabled={activity.completed}
              onClick={() => completeActivity(activity.id)}
              className="shrink-0"
            >
              {activity.completed ? "Completed" : "Complete"}
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-medium">
          <Brain className="h-5 w-5 mr-2 text-purple-500" />
          Mental Wellness Tracker
        </CardTitle>
        <CardDescription>
          Track and improve your cognitive and emotional well-being
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid grid-cols-4 mb-2 mx-4">
          <TabsTrigger value="progress" className="text-xs">
            <BarChart className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="text-xs">
            <Activity className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Activities</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="text-xs">
            <Target className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-xs">
            <Lightbulb className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
        </TabsList>
        
        <CardContent className="pt-2 pb-4">
          <TabsContent value="progress" className="m-0">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Cognitive Health</span>
                  <span className="text-sm text-gray-500">{progressData.cognition}%</span>
                </div>
                <Progress value={progressData.cognition} className="h-2 bg-gray-100" style={{ color: '#8b5cf6' }} />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Emotional Well-being</span>
                  <span className="text-sm text-gray-500">{progressData.emotional}%</span>
                </div>
                <Progress value={progressData.emotional} className="h-2 bg-gray-100" style={{ color: '#ec4899' }} />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Social Connection</span>
                  <span className="text-sm text-gray-500">{progressData.social}%</span>
                </div>
                <Progress value={progressData.social} className="h-2 bg-gray-100" style={{ color: '#3b82f6' }} />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Mindfulness Practice</span>
                  <span className="text-sm text-gray-500">{progressData.mindfulness}%</span>
                </div>
                <Progress value={progressData.mindfulness} className="h-2 bg-gray-100" style={{ color: '#10b981' }} />
              </div>
              
              <div className="pt-3 text-center">
                <p className="text-sm text-gray-700">
                  You're making excellent progress with mindfulness practices!
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Try focusing on social activities to improve overall balance.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="activities" className="m-0">
            <Tabs defaultValue="mindfulness" className="w-full">
              <TabsList className="grid grid-cols-4 mb-3">
                <TabsTrigger value="mindfulness" className="text-xs px-1">Mindfulness</TabsTrigger>
                <TabsTrigger value="cognitive" className="text-xs px-1">Cognitive</TabsTrigger>
                <TabsTrigger value="emotional" className="text-xs px-1">Emotional</TabsTrigger>
                <TabsTrigger value="social" className="text-xs px-1">Social</TabsTrigger>
              </TabsList>
              
              <TabsContent value="mindfulness" className="m-0">
                {renderActivitiesByCategory('mindfulness')}
              </TabsContent>
              
              <TabsContent value="cognitive" className="m-0">
                {renderActivitiesByCategory('cognitive')}
              </TabsContent>
              
              <TabsContent value="emotional" className="m-0">
                {renderActivitiesByCategory('emotional')}
              </TabsContent>
              
              <TabsContent value="social" className="m-0">
                {renderActivitiesByCategory('social')}
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="goals" className="m-0">
            <div className="space-y-4">
              {weeklyGoals.map(goal => (
                <div key={goal.id} className="space-y-2 border-b pb-4 last:border-0">
                  <div className="flex items-start">
                    <goal.icon className="h-5 w-5 text-primary mr-2" />
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      <div className="flex items-center mt-1">
                        <Progress 
                          value={(goal.progress / goal.target) * 100} 
                          className="h-2 w-40 bg-gray-100" 
                        />
                        <span className="text-xs text-gray-500 ml-2">
                          {goal.progress}/{goal.target}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center pt-1">
                <p className="text-sm text-gray-700">Weekly progress: 42%</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={handleViewMonthlyGoals}>
                  <Calendar className="h-4 w-4 mr-1" />
                  View Monthly Goals
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="m-0">
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-700 mb-1">Weekly Insights</h4>
                <ul className="space-y-2">
                  {insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start">
                      <Lightbulb className="h-4 w-4 text-blue-500 mr-2 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-700">{insight}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-700">
                  Your cognitive performance is 12% better than last week!
                </p>
                <Button variant="outline" size="sm" className="mt-2" onClick={handleViewDetailedAnalysis}>
                  View Detailed Analysis
                </Button>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">Last updated: Today</div>
        <Button variant="outline" size="sm" onClick={handleViewHistory}>
          <Calendar className="h-4 w-4 mr-1" />
          View History
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MentalWellnessTracker;