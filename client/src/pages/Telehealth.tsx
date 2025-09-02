import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { 
  Video, 
  Phone, 
  Mic, 
  MicOff, 
  VideoOff, 
  ScreenShare, 
  User, 
  MessageSquare, 
  Calendar,
  Loader2,
  Check,
  X,
  HelpCircle,
  ClipboardList
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TelehealthSession {
  sessionId: string;
  roomName: string;
  patientId: number;
  providerId: number;
  scheduledStartTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

interface AppointmentDetails {
  id: number;
  patientId: number;
  providerId: number;
  patientName: string;
  providerName: string;
  dateTime: string;
  type: string;
  status: string;
  notes?: string;
}

const Telehealth = () => {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [currentSession, setCurrentSession] = useState<TelehealthSession | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetails | null>(null);
  const [chatMessages, setChatMessages] = useState<{sender: string; message: string; time: Date}[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isJoiningCall, setIsJoiningCall] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login?redirect=/telehealth');
    return null;
  }
  
  // Fetch upcoming telehealth appointments
  const { 
    data: upcomingAppointments,
    isLoading: appointmentsLoading 
  } = useQuery({
    queryKey: ['/api/appointments', { type: 'telehealth', status: 'scheduled' }],
    enabled: isAuthenticated,
  });
  
  // Fetch past telehealth appointments
  const { 
    data: pastAppointments,
    isLoading: pastAppointmentsLoading 
  } = useQuery({
    queryKey: ['/api/appointments', { type: 'telehealth', status: 'completed' }],
    enabled: isAuthenticated,
  });
  
  // Create telehealth session mutation
  const createSession = useMutation({
    mutationFn: async (data: {
      patientId: number;
      providerId: number;
      appointmentId: number;
      scheduledStartTime?: string;
      enableRecording?: boolean;
    }) => {
      const response = await apiRequest(
        'POST',
        '/api/twilio-healthcare/telehealth/create-session',
        data
      );
      return response as any; // Type casting to handle response properties
    },
    onSuccess: (data) => {
      if (!data || data.success === false) {
        toast({
          variant: "destructive",
          title: "Session Creation Failed",
          description: data?.error || data?.message || "Unable to create telehealth session.",
        });
        return;
      }
      
      toast({
        title: "Telehealth Session Created",
        description: "Your telehealth session is ready.",
      });
      
      if (data.sessionId && data.roomName) {
        setCurrentSession({
          sessionId: data.sessionId,
          roomName: data.roomName,
          patientId: selectedAppointment?.patientId || 0,
          providerId: selectedAppointment?.providerId || 0,
          scheduledStartTime: selectedAppointment?.dateTime || new Date().toISOString(),
          status: 'scheduled'
        });
        
        // Switch to the video call tab
        setActiveTab('video');
      } else {
        toast({
          variant: "destructive",
          title: "Incomplete Session Data",
          description: "The session was created but some data is missing. Please try again.",
        });
      }
    },
    onError: (error: any) => {
      console.error("Telehealth session creation error:", error);
      toast({
        variant: "destructive",
        title: "Error Creating Session",
        description: error.message || "Failed to create telehealth session. Please check your connection and try again.",
      });
    }
  });
  
  // Get telehealth token mutation
  const getToken = useMutation({
    mutationFn: async (data: {
      sessionId: string;
      userType: 'patient' | 'provider';
      userName: string;
    }) => {
      const response = await apiRequest(
        'POST',
        '/api/twilio-healthcare/telehealth/token',
        data
      );
      return response as any; // Type casting to handle response properties
    },
    onSuccess: (data) => {
      if (!data || data.success === false) {
        toast({
          variant: "destructive",
          title: "Token Generation Failed",
          description: data?.error || data?.message || "Unable to get connection token.",
        });
        return;
      }
      
      if (data.token) {
        // In a real implementation, we would use this token to connect to the Twilio Video room
        toast({
          title: "Connected to Session",
          description: "You've joined the telehealth session.",
        });
        
        // Update current session status
        if (currentSession) {
          setCurrentSession({
            ...currentSession,
            status: 'in-progress'
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Session Connection Issue",
          description: "Failed to get a valid connection token. Please try reconnecting.",
        });
      }
    },
    onError: (error: any) => {
      console.error("Telehealth token generation error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error.message || "Failed to connect to telehealth session. Please check your connection and try again.",
      });
      
      // Clean up video streams on error
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    }
  });
  
  // End telehealth session mutation
  const endSession = useMutation({
    mutationFn: async (data: {
      sessionId: string;
      endedBy: 'patient' | 'provider' | 'system';
      endReason?: string;
    }) => {
      const response = await apiRequest(
        'POST',
        '/api/twilio-healthcare/telehealth/end-session',
        data
      );
      return response as any; // Type casting to handle response properties
    },
    onSuccess: (data) => {
      if (!data || data.success === false) {
        toast({
          variant: "destructive",
          title: "Session End Warning",
          description: data?.error || data?.message || "There was an issue ending the session properly, but we've closed your local connection.",
        });
      } else {
        toast({
          title: "Session Ended",
          description: "Your telehealth session has ended successfully.",
        });
      }
      
      // Always clean up video streams regardless of response
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      // Always reset session state regardless of response
      setCurrentSession(null);
      setActiveTab('upcoming');
      setChatMessages([]);
    },
    onError: (error: any) => {
      console.error("Error ending telehealth session:", error);
      
      toast({
        variant: "destructive",
        title: "Error Ending Session",
        description: error.message || "Failed to end the telehealth session properly on the server, but we've closed your local connection.",
      });
      
      // Still clean up video streams on error
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      // Still reset session state on error
      setCurrentSession(null);
      setActiveTab('upcoming');
      setChatMessages([]);
    }
  });
  
  // Handle starting a telehealth session
  const handleStartSession = (appointment: AppointmentDetails) => {
    setSelectedAppointment(appointment);
    
    // Create a new telehealth session
    createSession.mutate({
      patientId: appointment.patientId,
      providerId: appointment.providerId,
      appointmentId: appointment.id,
      scheduledStartTime: appointment.dateTime,
      enableRecording: false
    });
  };
  
  // Handle joining an existing telehealth session
  const handleJoinSession = async () => {
    if (!currentSession) return;
    
    setIsJoiningCall(true);
    
    try {
      // Request user media (camera and microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Store the local stream
      setLocalStream(stream);
      
      // Display local video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Get token for the session
      getToken.mutate({
        sessionId: currentSession.sessionId,
        userType: user?.role === 'provider' ? 'provider' : 'patient',
        userName: user?.username || 'User'
      });
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        variant: "destructive",
        title: "Media Access Error",
        description: "Could not access your camera or microphone. Please check permissions.",
      });
    } finally {
      setIsJoiningCall(false);
    }
  };
  
  // Handle ending a telehealth session
  const handleEndSession = () => {
    if (!currentSession) return;
    
    endSession.mutate({
      sessionId: currentSession.sessionId,
      endedBy: user?.role === 'provider' ? 'provider' : 'patient',
      endReason: 'Session completed by user'
    });
  };
  
  // Toggle microphone
  const toggleMicrophone = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMicEnabled;
      });
      setIsMicEnabled(!isMicEnabled);
    }
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };
  
  // Send chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    // Add message to chat
    setChatMessages([
      ...chatMessages,
      {
        sender: user?.username || 'You',
        message: messageInput,
        time: new Date()
      }
    ]);
    
    // Clear input
    setMessageInput('');
  };
  
  // Handle screen sharing
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        setScreenStream(stream);
        setIsScreenSharing(true);
        
        toast({
          title: "Screen Sharing Started",
          description: "Your screen is now being shared.",
        });
        
        // Listen for when user stops sharing from browser controls
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          setIsScreenSharing(false);
          setScreenStream(null);
        });
        
      } catch (error) {
        console.error('Error starting screen share:', error);
        toast({
          variant: "destructive",
          title: "Screen Share Error",
          description: "Could not start screen sharing. Please check permissions.",
        });
      }
    } else {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      
      toast({
        title: "Screen Sharing Stopped",
        description: "Screen sharing has been disabled.",
      });
    }
  };

  // Clean up media streams when component unmounts
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream, screenStream]);

  return (
    <>
      <Helmet>
        <title>Telehealth | {APP_NAME}</title>
        <meta name="description" content="Secure virtual appointments with healthcare providers" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary mb-6">
          Telehealth Appointments
        </h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Appointments</TabsTrigger>
            {currentSession && (
              <TabsTrigger value="video">
                <Video className="h-4 w-4 mr-2" />
                Active Session
              </TabsTrigger>
            )}
          </TabsList>
          
          {/* Upcoming Appointments Tab */}
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Telehealth Appointments
                </CardTitle>
                <CardDescription>
                  Join your scheduled virtual appointments with healthcare providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading appointments...</span>
                  </div>
                ) : upcomingAppointments && Array.isArray(upcomingAppointments) && upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment: AppointmentDetails) => (
                      <Card key={appointment.id} className="overflow-hidden">
                        <div className="bg-primary text-primary-foreground p-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Video className="h-5 w-5" />
                              <span>{appointment.type}</span>
                            </div>
                            <Badge variant="outline" className="bg-primary-foreground/20 text-primary-foreground">
                              {format(new Date(appointment.dateTime), 'MMM d, yyyy')}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div>
                              <h3 className="font-medium text-lg mb-1">
                                {user?.role === 'provider' ? `Patient: ${appointment.patientName}` : `Dr. ${appointment.providerName}`}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {format(new Date(appointment.dateTime), 'h:mm a')}
                              </p>
                              {appointment.notes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  {appointment.notes}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {/* Would handle rescheduling */}}
                              >
                                Reschedule
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleStartSession(appointment)}
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Start Session
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Upcoming Appointments</h3>
                    <p className="text-gray-500 mb-4">
                      You don't have any telehealth appointments scheduled yet.
                    </p>
                    <Button onClick={() => {/* Would navigate to appointment scheduling */}}>
                      Schedule an Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Past Appointments Tab */}
          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Past Telehealth Appointments
                </CardTitle>
                <CardDescription>
                  Review your previous virtual appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pastAppointmentsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading past appointments...</span>
                  </div>
                ) : pastAppointments && Array.isArray(pastAppointments) && pastAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {pastAppointments.map((appointment: AppointmentDetails) => (
                      <Card key={appointment.id} className="overflow-hidden">
                        <div className="bg-gray-100 p-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Video className="h-5 w-5 text-gray-600" />
                              <span className="text-gray-600">{appointment.type}</span>
                            </div>
                            <Badge variant="outline" className="text-gray-600">
                              {format(new Date(appointment.dateTime), 'MMM d, yyyy')}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div>
                              <h3 className="font-medium text-lg mb-1">
                                {user?.role === 'provider' ? `Patient: ${appointment.patientName}` : `Dr. ${appointment.providerName}`}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {format(new Date(appointment.dateTime), 'h:mm a')}
                              </p>
                              {appointment.notes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  {appointment.notes}
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {/* Would show appointment details/notes */}}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Past Appointments</h3>
                    <p className="text-gray-500 mb-4">
                      You haven't had any telehealth appointments yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Video Call Tab */}
          {currentSession && (
            <TabsContent value="video" className="h-[calc(100vh-250px)]">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
                <div className="md:col-span-3">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="flex-shrink-0">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="h-5 w-5 text-primary" />
                          <span>Telehealth Session</span>
                        </div>
                        <Badge variant={currentSession.status === 'in-progress' ? 'default' : 'outline'}>
                          {currentSession.status === 'in-progress' ? 'Live' : 'Ready to join'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col relative p-0">
                      {/* Video container */}
                      <div className="relative flex-1 bg-black rounded-md overflow-hidden">
                        {/* Remote video would be added here by the Twilio SDK */}
                        
                        {/* Local video preview */}
                        <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-md overflow-hidden border-2 border-white shadow-lg">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover"
                          />
                          
                          {!localStream && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70">
                              {isJoiningCall ? (
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                              ) : (
                                <Button onClick={handleJoinSession}>
                                  Join Call
                                </Button>
                              )}
                            </div>
                          )}
                          
                          {!isVideoEnabled && localStream && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70">
                              <VideoOff className="h-8 w-8 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Call controls */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-gray-900 bg-opacity-70 px-4 py-2 rounded-full">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`rounded-full ${isMicEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'}`}
                            onClick={toggleMicrophone}
                          >
                            {isMicEnabled ? <Mic className="h-5 w-5 text-white" /> : <MicOff className="h-5 w-5 text-white" />}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`rounded-full ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'}`}
                            onClick={toggleVideo}
                          >
                            {isVideoEnabled ? <Video className="h-5 w-5 text-white" /> : <VideoOff className="h-5 w-5 text-white" />}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`rounded-full ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                            onClick={toggleScreenShare}
                          >
                            <ScreenShare className="h-5 w-5 text-white" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full bg-red-600 hover:bg-red-500"
                            onClick={handleEndSession}
                          >
                            <Phone className="h-5 w-5 text-white" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Chat panel */}
                <div className="h-full">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="flex-shrink-0 pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Chat
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto px-3 py-2">
                      <div className="flex flex-col gap-3">
                        {chatMessages.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 italic">
                            <p>No messages yet</p>
                            <p className="text-xs mt-1">Chat messages are not saved after the session</p>
                          </div>
                        ) : (
                          chatMessages.map((msg, index) => (
                            <div key={index} className={`flex flex-col ${msg.sender === (user?.username || 'You') ? 'items-end' : 'items-start'}`}>
                              <div className={`px-3 py-2 rounded-lg max-w-[85%] ${
                                msg.sender === (user?.username || 'You') 
                                  ? 'bg-primary text-white' 
                                  : 'bg-gray-100'
                              }`}>
                                <p className="text-sm">{msg.message}</p>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-gray-500">
                                  {msg.sender}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {format(msg.time, 'h:mm a')}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex-shrink-0 p-3 border-t">
                      <form onSubmit={handleSendMessage} className="w-full flex gap-2">
                        <Input 
                          placeholder="Type a message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit" size="sm">
                          Send
                        </Button>
                      </form>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
        
        {/* First-time user help dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="fixed bottom-4 right-4">
              <HelpCircle className="h-5 w-5 mr-2" />
              Telehealth Help
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Using Telehealth</DialogTitle>
              <DialogDescription>
                Tips for a successful virtual appointment experience
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-full h-fit">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Before Your Appointment</h3>
                  <ul className="text-sm text-gray-600 list-disc pl-4 mt-1 space-y-1">
                    <li>Ensure your camera and microphone are working</li>
                    <li>Connect to a stable internet connection</li>
                    <li>Find a quiet, private space with good lighting</li>
                    <li>Join 5 minutes early to test your setup</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-full h-fit">
                  <Mic className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">During Your Appointment</h3>
                  <ul className="text-sm text-gray-600 list-disc pl-4 mt-1 space-y-1">
                    <li>Use headphones for better audio quality</li>
                    <li>Keep your device stable (not handheld)</li>
                    <li>Speak clearly and take turns talking</li>
                    <li>Have any relevant medical information ready</li>
                  </ul>
                </div>
              </div>
              
              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertTitle>Need Technical Help?</AlertTitle>
                <AlertDescription>
                  If you experience any issues during your appointment, call our support line at (555) 123-4567.
                </AlertDescription>
              </Alert>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline">
                <Check className="h-4 w-4 mr-2" />
                Got It
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Telehealth;