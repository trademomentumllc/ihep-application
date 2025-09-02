import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Award, Brain, Heart, Utensils, Zap } from "lucide-react";

type Tip = {
  id: number;
  category: 'nutrition' | 'activity' | 'mental' | 'sleep' | 'general';
  icon: React.ReactNode;
  title: string;
  content: string;
  source?: string;
};

// Mock data - in a real app this would come from an API
const healthTips: Tip[] = [
  {
    id: 1,
    category: 'nutrition',
    icon: <Utensils className="h-5 w-5 text-green-500" />,
    title: "Eat Colorful Foods",
    content: "Try to include a variety of colorful vegetables and fruits in your meals. Different colors often indicate different nutrients and antioxidants.",
    source: "American Heart Association"
  },
  {
    id: 2,
    category: 'activity',
    icon: <Zap className="h-5 w-5 text-yellow-500" />,
    title: "Take Movement Breaks",
    content: "If you sit for long periods, set a timer to remind you to stand up and move for 5 minutes every hour.",
    source: "CDC"
  },
  {
    id: 3,
    category: 'mental',
    icon: <Brain className="h-5 w-5 text-purple-500" />,
    title: "Practice Mindfulness",
    content: "Spend just 5 minutes a day practicing mindful breathing to reduce stress and improve focus.",
    source: "Mayo Clinic"
  },
  {
    id: 4,
    category: 'sleep',
    icon: <Heart className="h-5 w-5 text-red-500" />,
    title: "Consistent Sleep Schedule",
    content: "Going to bed and waking up at the same time every day, even on weekends, helps regulate your body's internal clock.",
    source: "Sleep Foundation"
  },
  {
    id: 5,
    category: 'general',
    icon: <Award className="h-5 w-5 text-blue-500" />,
    title: "Stay Hydrated",
    content: "Drink water throughout the day. Mild dehydration can affect your energy levels, cognition, and overall health.",
    source: "Harvard Health"
  },
  {
    id: 6,
    category: 'mental',
    icon: <Brain className="h-5 w-5 text-purple-500" />,
    title: "Gratitude Practice",
    content: "Each day, write down three things you're grateful for. This simple practice can boost your mood and mental outlook.",
    source: "Positive Psychology"
  },
  {
    id: 7,
    category: 'nutrition',
    icon: <Utensils className="h-5 w-5 text-green-500" />,
    title: "Protein with Each Meal",
    content: "Including protein with each meal helps stabilize blood sugar, reduce cravings, and maintain muscle mass.",
    source: "Cleveland Clinic"
  },
  {
    id: 8,
    category: 'activity',
    icon: <Zap className="h-5 w-5 text-yellow-500" />,
    title: "Strength Training",
    content: "Include strength training in your routine at least twice a week to maintain muscle mass and bone density as you age.",
    source: "National Institute on Aging"
  },
  {
    id: 9,
    category: 'mental',
    icon: <Brain className="h-5 w-5 text-purple-500" />,
    title: "Digital Detox",
    content: "Set aside time each day to disconnect from digital devices to reduce stress and improve mental clarity.",
    source: "Mental Health Foundation"
  },
  {
    id: 10,
    category: 'general',
    icon: <Award className="h-5 w-5 text-blue-500" />,
    title: "Social Connections",
    content: "Maintaining social connections is vital for mental health. Schedule regular time with friends and family.",
    source: "WHO"
  }
];

interface QuickHealthTipsProps {
  category?: 'nutrition' | 'activity' | 'mental' | 'sleep' | 'general';
  refreshInterval?: number;
}

const QuickHealthTips = ({ 
  category, 
  refreshInterval = 0 
}: QuickHealthTipsProps) => {
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(false);

  const getFilteredTips = () => {
    if (category) {
      return healthTips.filter(tip => tip.category === category);
    }
    return healthTips;
  };

  const getRandomTip = () => {
    const filteredTips = getFilteredTips();
    const randomIndex = Math.floor(Math.random() * filteredTips.length);
    return filteredTips[randomIndex];
  };

  const refreshTip = () => {
    setLoading(true);
    // Simulate API call with short delay
    setTimeout(() => {
      setCurrentTip(getRandomTip());
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    refreshTip();
    
    // Set up auto-refresh if interval is provided
    if (refreshInterval > 0) {
      const intervalId = setInterval(refreshTip, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [category, refreshInterval]);

  if (!currentTip) return null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Quick Health Tip</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={refreshTip}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh tip</span>
          </Button>
        </div>
        <CardDescription>
          Daily inspiration for your health journey
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-start">
          <div className="mr-3 mt-0.5">
            {currentTip.icon}
          </div>
          <div>
            <h3 className="font-medium text-lg mb-1">{currentTip.title}</h3>
            <p className="text-gray-600 text-sm">{currentTip.content}</p>
          </div>
        </div>
      </CardContent>
      {currentTip.source && (
        <CardFooter className="pt-0">
          <p className="text-xs text-gray-500">Source: {currentTip.source}</p>
        </CardFooter>
      )}
    </Card>
  );
};

export default QuickHealthTips;