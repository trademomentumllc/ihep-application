import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  MessageCircle,
  Phone,
  AlertTriangle,
  Heart,
  MapPin,
  Clock,
  Users,
  BookOpen,
  Calendar,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Send,
  Loader2,
  Shield,
  Info
} from 'lucide-react';

interface HealthcareRecommendation {
  type: 'resource' | 'group' | 'event' | 'education' | 'professional';
  id: number;
  title: string;
  description: string;
  category: string;
  relevanceScore: number;
  contactInfo?: string;
  location?: string;
  nextSteps: string[];
}

interface AIResponse {
  message: string;
  recommendations: HealthcareRecommendation[];
  disclaimers: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  followUpQuestions: string[];
  specialization: string;
  isEmergency?: boolean;
  emergencyType?: string;
  immediateActions?: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  aiResponse?: AIResponse;
}

const HealthAIAssistant = () => {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login?redirect=/health-ai');
    return null;
  }

  // Get healthcare specializations
  const { data: specializations } = useQuery({
    queryKey: ['/api/healthcare-ai/specializations'],
    enabled: isAuthenticated
  });

  // Healthcare guidance mutation
  const guidanceMutation = useMutation({
    mutationFn: async (query: string): Promise<AIResponse> => {
      const conversationHistory = messages
        .slice(-5) // Last 5 messages for context
        .map(msg => `${msg.role}: ${msg.content}`);
      
      const response = await fetch('/api/healthcare-ai/guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query, 
          conversationHistory 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get healthcare guidance');
      }

      return response.json();
    },
    onSuccess: (response: AIResponse) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '_assistant',
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        aiResponse: response
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Error getting healthcare guidance:', error);
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to get healthcare guidance. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async ({ messageId, wasHelpful, feedback }: { messageId: string; wasHelpful: boolean; feedback?: string }) => {
      const response = await fetch('/api/healthcare-ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          interactionId: messageId,
          wasHelpful,
          feedback
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank you",
        description: "Your feedback helps us improve our guidance system.",
      });
    }
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || guidanceMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    await guidanceMutation.mutateAsync(inputMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = (messageId: string, wasHelpful: boolean) => {
    feedbackMutation.mutate({ messageId, wasHelpful });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'resource': return <MapPin className="h-4 w-4" />;
      case 'group': return <Users className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'education': return <BookOpen className="h-4 w-4" />;
      default: return <Heart className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${user?.firstName}! I'm your healthcare guidance assistant. I'm here to help you find relevant programs, support groups, healthcare providers, and educational resources for your health concerns. 

I can guide you toward appropriate care without providing medical advice. Please feel free to ask about any health topics you'd like guidance on.`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length]);

  return (
    <>
      <Helmet>
        <title>Healthcare AI Assistant | {APP_NAME}</title>
        <meta name="description" content="Get intelligent healthcare guidance and resource recommendations" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Healthcare AI Assistant</h1>
              <p className="text-gray-600">Intelligent guidance to healthcare resources and support</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Specializations Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Guidance Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {specializations && Object.entries(specializations as Record<string, any>).map(([key, spec]) => (
                  <div key={key} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                       onClick={() => setInputMessage(`I need guidance about ${spec.name.toLowerCase()}`)}>
                    <h4 className="font-medium text-sm">{spec.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{spec.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Safety First
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    This AI provides guidance only and doesn't replace professional medical advice. For emergencies, call 911 immediately.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[70vh] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Health Guidance Chat
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'} rounded-lg p-4`}>
                          <div className="text-sm mb-2">
                            {message.content}
                          </div>
                          
                          {/* AI Response Details */}
                          {message.aiResponse && (
                            <div className="mt-4 space-y-4">
                              {/* Emergency Alert */}
                              {message.aiResponse.isEmergency && (
                                <Alert className="border-red-500 bg-red-50">
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                  <AlertDescription className="text-red-800">
                                    <strong>EMERGENCY DETECTED</strong>
                                    <ul className="mt-2 list-disc list-inside">
                                      {message.aiResponse.immediateActions?.map((action, idx) => (
                                        <li key={idx}>{action}</li>
                                      ))}
                                    </ul>
                                  </AlertDescription>
                                </Alert>
                              )}

                              {/* Urgency Level */}
                              {!message.aiResponse.isEmergency && (
                                <div className="flex items-center gap-2">
                                  <Badge className={getUrgencyColor(message.aiResponse.urgencyLevel)}>
                                    {message.aiResponse.urgencyLevel.toUpperCase()} PRIORITY
                                  </Badge>
                                  <Badge variant="outline">
                                    {message.aiResponse.specialization.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                </div>
                              )}

                              {/* Recommendations */}
                              {message.aiResponse.recommendations.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="font-medium text-gray-800">Recommended Resources:</h4>
                                  {message.aiResponse.recommendations.slice(0, 4).map((rec, idx) => (
                                    <div key={idx} className="bg-white border rounded-lg p-3">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          {getTypeIcon(rec.type)}
                                          <h5 className="font-medium text-sm">{rec.title}</h5>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                          {rec.category}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                                      {rec.location && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {rec.location}
                                        </p>
                                      )}
                                      {rec.contactInfo && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          {rec.contactInfo}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Follow-up Questions */}
                              {message.aiResponse.followUpQuestions.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="font-medium text-gray-800 text-sm">Questions to ask your healthcare provider:</h4>
                                  <ul className="text-xs text-gray-600 space-y-1">
                                    {message.aiResponse.followUpQuestions.slice(0, 3).map((question, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <span className="text-blue-600">•</span>
                                        {question}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Disclaimers */}
                              {message.aiResponse.disclaimers.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                  <h4 className="font-medium text-yellow-800 text-xs mb-2">Important Disclaimers:</h4>
                                  <ul className="text-xs text-yellow-700 space-y-1">
                                    {message.aiResponse.disclaimers.map((disclaimer, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <span>•</span>
                                        {disclaimer}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Feedback Buttons */}
                              <div className="flex items-center gap-2 pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleFeedback(message.id, true)}
                                  className="text-xs"
                                >
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  Helpful
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleFeedback(message.id, false)}
                                  className="text-xs"
                                >
                                  <ThumbsDown className="h-3 w-3 mr-1" />
                                  Not Helpful
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          <div className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-gray-600">Getting guidance...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                <Separator />

                {/* Input Area */}
                <div className="p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Describe your health concern or ask for guidance about healthcare resources..."
                      className="resize-none"
                      rows={2}
                      disabled={guidanceMutation.isPending}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || guidanceMutation.isPending}
                      size="lg"
                    >
                      {guidanceMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This AI provides guidance only and doesn't replace professional medical advice.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default HealthAIAssistant;