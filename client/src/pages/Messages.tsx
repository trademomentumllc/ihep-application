import { useState } from "react";
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Send, User, Phone, Video, MoreHorizontal, CheckCheck, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Mock data for message threads
const messageThreads = [
  {
    id: 1,
    provider: {
      id: 101,
      name: "Dr. Sarah Johnson",
      specialty: "Primary Care",
      avatar: null
    },
    lastMessage: {
      content: "Your lab results have been uploaded to your portal. Everything looks good!",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      fromProvider: true
    }
  },
  {
    id: 2,
    provider: {
      id: 102,
      name: "Dr. Michael Chen",
      specialty: "Cardiology",
      avatar: null
    },
    lastMessage: {
      content: "Do you have any questions about the new medication?",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isRead: false,
      fromProvider: true
    }
  },
  {
    id: 3,
    provider: {
      id: 103,
      name: "Dr. Lisa Rodriguez",
      specialty: "Nutrition",
      avatar: null
    },
    lastMessage: {
      content: "I'll send you those meal plan recommendations tomorrow.",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isRead: true,
      fromProvider: false
    }
  }
];

// Mock conversation
const mockConversation = [
  {
    id: 1,
    content: "Hello Dr. Johnson, I've been experiencing some headaches lately.",
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    fromProvider: false,
    isRead: true
  },
  {
    id: 2,
    content: "I'm sorry to hear that. Have you noticed any triggers or patterns?",
    timestamp: new Date(Date.now() - 20 * 60 * 1000),
    fromProvider: true,
    isRead: true
  },
  {
    id: 3,
    content: "They seem to happen more often in the afternoon, especially after working on the computer for a long time.",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    fromProvider: false,
    isRead: true
  },
  {
    id: 4,
    content: "That could be eye strain. Try taking breaks using the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. Also, make sure your screen is at eye level and properly lit.",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    fromProvider: true,
    isRead: true
  },
  {
    id: 5,
    content: "Thanks, I'll try that. Is there anything else I can do to prevent them?",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    fromProvider: false,
    isRead: true
  },
  {
    id: 6,
    content: "Stay hydrated and consider over-the-counter pain relievers if needed. If headaches persist or worsen, we should schedule an appointment to discuss further.",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    fromProvider: true,
    isRead: true
  }
];

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

const formatDate = (date: Date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (dateOnly.getTime() === today.getTime()) {
    return 'Today';
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
};

const Messages = () => {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedThread, setSelectedThread] = useState(messageThreads[0]);
  const [newMessage, setNewMessage] = useState("");
  
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    // In a real app, this would send the message to the backend
    console.log("Sending message:", newMessage);
    setNewMessage("");
    
    toast({
      title: "Message sent",
      description: "Your message has been sent to the provider.",
    });
  };

  const handlePhoneCall = () => {
    toast({
      title: "Phone call initiated",
      description: `Calling ${selectedThread.provider.name}...`,
    });
  };

  const handleVideoCall = () => {
    navigate('/telehealth');
  };

  const handleMoreOptions = () => {
    toast({
      title: "More options",
      description: "Additional message options will be available soon.",
    });
  };

  const handleAttachment = () => {
    toast({
      title: "Attachment",
      description: "File attachment feature will be available soon.",
    });
  };
  
  return (
    <>
      <Helmet>
        <title>Messages | {APP_NAME}</title>
        <meta name="description" content="Securely message your healthcare providers and care team." />
      </Helmet>
      
      <section className="container mx-auto px-4 py-6 mt-4">
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-primary mb-6">Messages</h1>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex h-[600px] md:h-[700px] flex-col md:flex-row">
            {/* Conversation List */}
            <div className="w-full md:w-1/3 border-r border-gray-200">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Your Conversations</h2>
              </div>
              
              <div className="overflow-y-auto h-[calc(100%-4rem)]">
                <Tabs defaultValue="providers">
                  <div className="px-4 pt-3">
                    <TabsList className="w-full">
                      <TabsTrigger value="providers" className="flex-1">Providers</TabsTrigger>
                      <TabsTrigger value="team" className="flex-1">Care Team</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="providers" className="m-0">
                    {messageThreads.map(thread => (
                      <div 
                        key={thread.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedThread.id === thread.id ? 'bg-gray-50' : ''
                        }`}
                        onClick={() => setSelectedThread(thread)}
                      >
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={thread.provider.avatar || undefined} />
                            <AvatarFallback className="bg-primary text-white">
                              {thread.provider.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="font-medium truncate">{thread.provider.name}</p>
                              <span className="text-xs text-gray-500">
                                {formatDate(thread.lastMessage.timestamp)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className={`text-sm truncate ${!thread.lastMessage.isRead && !thread.lastMessage.fromProvider ? 'font-medium text-primary' : 'text-gray-600'}`}>
                                {thread.lastMessage.content}
                              </p>
                              {!thread.lastMessage.isRead && thread.lastMessage.fromProvider && (
                                <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="team" className="m-0 p-6">
                    <p className="text-center text-gray-500">No care team messages</p>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Conversation */}
            <div className="flex-1 flex flex-col">
              {/* Conversation Header */}
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedThread.provider.avatar || undefined} />
                    <AvatarFallback className="bg-primary text-white">
                      {selectedThread.provider.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <h3 className="font-semibold">{selectedThread.provider.name}</h3>
                    <p className="text-xs text-gray-600">{selectedThread.provider.specialty}</p>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={handlePhoneCall}>
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={handleVideoCall}>
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={handleMoreOptions}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mockConversation.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.fromProvider ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] ${message.fromProvider ? 'bg-gray-100 rounded-lg rounded-tl-none' : 'bg-primary/10 rounded-lg rounded-tr-none'} px-4 py-2`}>
                      <p className="text-sm">{message.content}</p>
                      <div className="mt-1 flex justify-end items-center">
                        <span className="text-xs text-gray-500 mr-1">
                          {formatTime(message.timestamp)}
                        </span>
                        {!message.fromProvider && (
                          <CheckCheck className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={handleAttachment}>
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    variant="default" 
                    size="icon" 
                    className="rounded-full"
                    onClick={handleSendMessage}
                    disabled={newMessage.trim() === ""}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Messages are securely encrypted and comply with HIPAA regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Messages;