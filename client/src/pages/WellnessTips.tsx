import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, ThumbsUp, ThumbsDown, Bookmark, RefreshCw, Brain, Activity } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface WellnessTip {
  id: number;
  content: string;
  motivationalQuote: string;
  actionSteps: string[];
  category: string;
  tags: string[];
  createdAt: string;
  wasHelpful?: boolean;
  savedByUser: boolean;
}

export default function WellnessTips() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing wellness tips
  const { data: tipsData, isLoading } = useQuery({
    queryKey: ['/api/wellness-tips'],
    queryFn: async () => {
      const response = await fetch('/api/wellness-tips');
      if (!response.ok) {
        throw new Error('Failed to fetch wellness tips');
      }
      return response.json();
    }
  });

  // Generate new wellness tip mutation
  const generateTipMutation = useMutation({
    mutationFn: async (category?: string) => {
      const response = await fetch('/api/wellness-tips/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate wellness tip');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wellness-tips'] });
      toast({
        title: "New Wellness Tip Generated!",
        description: "Your personalized tip is ready to inspire your health journey.",
      });
    },
    onError: (error) => {
      console.error('Error generating tip:', error);
      toast({
        title: "Generation Failed",
        description: "We couldn't generate a new tip right now. Please try again later.",
        variant: "destructive",
      });
    }
  });

  // Rate tip mutation
  const rateTipMutation = useMutation({
    mutationFn: async ({ tipId, helpful }: { tipId: number; helpful: boolean }) => {
      const response = await fetch(`/api/wellness-tips/${tipId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ helpful }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to rate tip');
      }
      
      return response.json();
    },
    onSuccess: (_, { helpful }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/wellness-tips'] });
      toast({
        title: "Thank you for your feedback!",
        description: `We've noted that this tip was ${helpful ? 'helpful' : 'not helpful'} for you.`,
      });
    }
  });

  // Save tip mutation
  const saveTipMutation = useMutation({
    mutationFn: async (tipId: number) => {
      const response = await fetch(`/api/wellness-tips/${tipId}/save`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to save tip');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wellness-tips'] });
      toast({
        title: "Tip Saved!",
        description: "This wellness tip has been saved to your collection.",
      });
    }
  });

  const tips: WellnessTip[] = tipsData?.tips || [];

  const handleGenerateTip = () => {
    generateTipMutation.mutate(selectedCategory || undefined);
  };

  const handleRateTip = (tipId: number, helpful: boolean) => {
    rateTipMutation.mutate({ tipId, helpful });
  };

  const handleSaveTip = (tipId: number) => {
    saveTipMutation.mutate(tipId);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mental': return <Brain className="h-4 w-4" />;
      case 'physical': return <Activity className="h-4 w-4" />;
      case 'nutrition': return <Heart className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mental': return 'bg-purple-100 text-purple-800';
      case 'physical': return 'bg-green-100 text-green-800';
      case 'nutrition': return 'bg-orange-100 text-orange-800';
      case 'medication': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Wellness Journey
        </h1>
        <p className="text-gray-600">
          Get personalized AI-powered wellness tips and motivational messages tailored to your health goals.
        </p>
      </div>

      {/* Generate New Tip Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Generate Your Next Wellness Tip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="mental">Mental Wellness</SelectItem>
                <SelectItem value="physical">Physical Health</SelectItem>
                <SelectItem value="nutrition">Nutrition</SelectItem>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="general">General Wellness</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleGenerateTip}
              disabled={generateTipMutation.isPending}
              className="flex items-center gap-2"
            >
              {generateTipMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate New Tip
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading your wellness tips...</p>
        </div>
      )}

      {/* Tips List */}
      {tips.length > 0 && (
        <div className="space-y-6">
          {tips.map((tip) => (
            <Card key={tip.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(tip.category)}>
                      {getCategoryIcon(tip.category)}
                      <span className="ml-1">{tip.category}</span>
                    </Badge>
                    {tip.savedByUser && (
                      <Badge variant="outline" className="text-yellow-600">
                        <Bookmark className="h-3 w-3 mr-1" />
                        Saved
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {tip.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Main Content */}
                <p className="text-lg leading-relaxed text-gray-800">
                  {tip.content}
                </p>

                {/* Motivational Quote */}
                {tip.motivationalQuote && (
                  <blockquote className="border-l-4 border-blue-200 pl-4 italic text-blue-800 bg-blue-50 p-4 rounded-r">
                    "{tip.motivationalQuote}"
                  </blockquote>
                )}

                {/* Action Steps */}
                {tip.actionSteps?.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Take Action Today:</h4>
                    <ul className="space-y-1">
                      {tip.actionSteps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2 text-green-700">
                          <span className="flex-shrink-0 w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRateTip(tip.id, true)}
                      disabled={rateTipMutation.isPending || tip.wasHelpful === true}
                      className="flex items-center gap-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Helpful
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRateTip(tip.id, false)}
                      disabled={rateTipMutation.isPending || tip.wasHelpful === false}
                      className="flex items-center gap-2"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Not Helpful
                    </Button>
                  </div>

                  {!tip.savedByUser && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSaveTip(tip.id)}
                      disabled={saveTipMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Bookmark className="h-4 w-4" />
                      Save for Later
                    </Button>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  Generated on {new Date(tip.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && tips.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start Your Wellness Journey
            </h3>
            <p className="text-gray-600 mb-6">
              Generate your first personalized wellness tip to begin receiving AI-powered guidance for your health goals.
            </p>
            <Button onClick={handleGenerateTip} disabled={generateTipMutation.isPending}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate My First Tip
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}