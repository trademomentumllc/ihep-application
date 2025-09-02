import { useState } from "react";
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { 
  Appointment, 
  Message, 
  Notification,
  Event,
  CommunityGroup
} from "@shared/schema";
import { 
  User,
  Bell,
  Calendar,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";

const Profile = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("appointments");

  // Redirect if not authenticated
  if (!loading && !isAuthenticated) {
    navigate("/login?redirect=/profile");
    return null;
  }

  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments', { patientId: user?.id, status: 'scheduled' }],
    enabled: isAuthenticated && !!user,
  });

  // Fetch messages
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages', { recipient: 'me' }],
    enabled: isAuthenticated && !!user,
  });

  // Fetch notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: isAuthenticated && !!user,
  });

  // Fetch upcoming events
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', { startDate: new Date().toISOString() }],
    enabled: isAuthenticated && !!user,
  });

  // Fetch community groups
  const { data: groups, isLoading: groupsLoading } = useQuery<CommunityGroup[]>({
    queryKey: ['/api/community-groups'],
    enabled: isAuthenticated && !!user,
  });

  const userGroups = groups?.filter(group => 
    group.members?.includes(user?.id)
  );

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <Helmet>
        <title>My Profile | {APP_NAME}</title>
        <meta name="description" content="Manage your healthcare profile, appointments, messages, and notifications." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6 mt-4">
        {loading ? (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div>
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
              </div>
            </div>
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        ) : (
          <>
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20 border-2 border-primary">
                    <AvatarImage src={user?.profilePicture} alt={user?.firstName} />
                    <AvatarFallback className="text-lg">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{user?.firstName} {user?.lastName}</h2>
                    <p className="text-gray-500">{user?.role === 'patient' ? 'Patient' : 'Healthcare Provider'}</p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-2">
                  <Button variant="outline" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button variant="outline" className="flex items-center text-red-500" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5 mb-8">
                  <TabsTrigger value="appointments" className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Appointments</span>
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Messages</span>
                    {messages && messages.filter(m => !m.isRead).length > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {messages.filter(m => !m.isRead).length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center">
                    <Bell className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Notifications</span>
                    {notifications && notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications.filter(n => !n.isRead).length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Events</span>
                  </TabsTrigger>
                  <TabsTrigger value="groups" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Groups</span>
                  </TabsTrigger>
                </TabsList>
                
                {/* Appointments tab */}
                <TabsContent value="appointments">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Appointments</CardTitle>
                      <CardDescription>
                        View and manage your upcoming appointments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {appointmentsLoading ? (
                        <div className="space-y-4">
                          {Array(3).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                          ))}
                        </div>
                      ) : appointments && appointments.length > 0 ? (
                        <div className="space-y-4">
                          {appointments.map((appointment) => (
                            <div key={appointment.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                              <div>
                                <h4 className="font-medium">{appointment.type}</h4>
                                <p className="text-sm text-gray-500">
                                  {format(new Date(appointment.startTime), "MMMM d, yyyy 'at' h:mm a")}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {appointment.location} • {appointment.isVirtual ? 'Virtual' : 'In-Person'}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">Reschedule</Button>
                                <Button variant="outline" size="sm" className="text-red-500">Cancel</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 mb-4">You have no upcoming appointments</p>
                          <Button>Schedule Appointment</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Messages tab */}
                <TabsContent value="messages">
                  <Card>
                    <CardHeader>
                      <CardTitle>Messages</CardTitle>
                      <CardDescription>
                        Communicate securely with your healthcare providers
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {messagesLoading ? (
                        <div className="space-y-4">
                          {Array(3).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                          ))}
                        </div>
                      ) : messages && messages.length > 0 ? (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div 
                              key={message.id} 
                              className={`p-4 rounded-lg ${message.isRead ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'}`}
                            >
                              <div className="flex justify-between">
                                <h4 className="font-medium">{message.subject}</h4>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(message.createdAt), "MMM d, h:mm a")}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{message.content}</p>
                              <div className="flex justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  From: User #{message.senderId}
                                </span>
                                <Button variant="link" size="sm" className="p-0 h-auto text-primary">
                                  Reply
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 mb-4">You have no messages</p>
                          <Button>Compose Message</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Notifications tab */}
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>
                        Stay updated with important information about your care
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {notificationsLoading ? (
                        <div className="space-y-4">
                          {Array(3).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                          ))}
                        </div>
                      ) : notifications && notifications.length > 0 ? (
                        <div className="space-y-2">
                          {notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`p-4 rounded-lg ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}
                            >
                              <div className="flex justify-between">
                                <h4 className="font-medium">{notification.title}</h4>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">You have no notifications</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Events tab */}
                <TabsContent value="events">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Events</CardTitle>
                      <CardDescription>
                        Events you've registered for or are hosting
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {eventsLoading ? (
                        <div className="space-y-4">
                          {Array(3).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                          ))}
                        </div>
                      ) : events && events.length > 0 ? (
                        <div className="space-y-4">
                          {events.filter(event => 
                            event.registeredUsers?.includes(user?.id) || event.hostId === user?.id
                          ).map((event) => (
                            <div key={event.id} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{event.title}</h4>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  {event.hostId === user?.id ? 'Hosting' : 'Registered'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {format(new Date(event.startTime), "MMMM d, yyyy 'at' h:mm a")}
                              </p>
                              <p className="text-sm text-gray-500">
                                {event.location} • {event.isVirtual ? 'Virtual' : 'In-Person'}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 mb-4">You haven't registered for any events</p>
                          <Link href="/events">
                            <Button>Browse Events</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Groups tab */}
                <TabsContent value="groups">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Community Groups</CardTitle>
                      <CardDescription>
                        Support groups and communities you're a part of
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {groupsLoading ? (
                        <div className="space-y-4">
                          {Array(3).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                          ))}
                        </div>
                      ) : userGroups && userGroups.length > 0 ? (
                        <div className="space-y-4">
                          {userGroups.map((group) => (
                            <div key={group.id} className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium">{group.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                              <div className="flex justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  {group.memberCount} members
                                </span>
                                <Button variant="link" size="sm" className="p-0 h-auto text-primary">
                                  View Discussions
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 mb-4">You haven't joined any community groups</p>
                          <Link href="/community">
                            <Button>Browse Groups</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Profile;
