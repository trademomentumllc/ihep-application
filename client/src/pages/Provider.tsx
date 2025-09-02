import { useState } from "react";
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { CalendarView } from "@/components/calendar/CalendarView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Appointment } from "@shared/schema";
import { format } from "date-fns";

const Provider = () => {
  const { user } = useAuth();
  const [calendarView, setCalendarView] = useState({
    type: 'week' as 'month' | 'week' | 'day',
    date: new Date()
  });

  // Fetch provider's upcoming appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments', { providerId: user?.id }],
  });

  // Format the appointment date/time
  const formatAppointmentTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy 'at' h:mm a");
  };

  // Group appointments by date for easier display
  const groupAppointmentsByDate = (appts: Appointment[] | undefined) => {
    if (!appts || appts.length === 0) return {};
    
    const grouped: Record<string, Appointment[]> = {};
    
    appts.forEach(appointment => {
      const dateKey = format(new Date(appointment.startTime), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appointment);
    });
    
    return grouped;
  };

  // Get today's appointments
  const today = format(new Date(), 'yyyy-MM-dd');
  const groupedAppointments = groupAppointmentsByDate(appointments);
  const todaysAppointments = groupedAppointments[today] || [];

  return (
    <>
      <Helmet>
        <title>Provider Dashboard | {APP_NAME}</title>
        <meta name="description" content="Manage your patient appointments, schedule, and healthcare resources." />
      </Helmet>
      
      <section className="container mx-auto px-4 py-6 mt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-montserrat font-bold text-primary">Provider Dashboard</h2>
            <p className="text-gray-600 mt-1">Manage your appointments and patient care</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Today's Schedule Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                {format(new Date(), 'MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : todaysAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todaysAppointments.map((appointment) => (
                    <div 
                      key={appointment.id} 
                      className={`p-3 rounded-lg border-l-4 ${
                        appointment.status === 'confirmed' 
                          ? 'border-green-500 bg-green-50' 
                          : appointment.status === 'cancelled' 
                            ? 'border-red-500 bg-red-50'
                            : 'border-yellow-500 bg-yellow-50'
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">{format(new Date(appointment.startTime), 'h:mm a')}</h4>
                          <p className="text-sm text-gray-600">{appointment.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium capitalize">{appointment.status}</p>
                          <p className="text-xs text-gray-500">
                            Patient #{appointment.patientId}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No appointments scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {appointmentsLoading ? (
                    <Skeleton className="h-10 w-16" />
                  ) : (
                    appointments?.filter(a => 
                      new Date(a.startTime) > new Date() && 
                      a.status !== 'cancelled'
                    ).length || 0
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Scheduled appointments</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Virtual Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {appointmentsLoading ? (
                    <Skeleton className="h-10 w-16" />
                  ) : (
                    appointments?.filter(a => 
                      a.isVirtual && 
                      new Date(a.startTime) > new Date() &&
                      a.status !== 'cancelled'
                    ).length || 0
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Upcoming telemedicine visits</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="calendar" className="mb-8">
          <TabsList>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="mt-6">
            <CalendarView 
              view={calendarView.type}
              initialDate={calendarView.date}
              onViewChange={setCalendarView}
            />
          </TabsContent>
          
          <TabsContent value="list" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Upcoming Appointments</CardTitle>
                <CardDescription>View and manage your scheduled appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : appointments && appointments.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(groupedAppointments)
                      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                      .map(([date, appts]) => (
                        <div key={date} className="mb-6">
                          <h3 className="text-md font-semibold mb-2 bg-gray-100 p-2 rounded">
                            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                          </h3>
                          
                          <div className="space-y-3">
                            {appts
                              .sort((a, b) => 
                                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                              )
                              .map(appointment => (
                                <div 
                                  key={appointment.id} 
                                  className={`p-4 rounded-lg border ${
                                    appointment.status === 'confirmed' 
                                      ? 'border-green-200' 
                                      : appointment.status === 'cancelled' 
                                        ? 'border-red-200'
                                        : 'border-yellow-200'
                                  }`}
                                >
                                  <div className="flex flex-col md:flex-row justify-between">
                                    <div>
                                      <div className="flex items-center">
                                        <span className="font-medium">
                                          {format(new Date(appointment.startTime), 'h:mm a')}
                                        </span>
                                        <span className="mx-2 text-gray-400">|</span>
                                        <span className={`text-sm px-2 py-1 rounded-full ${
                                          appointment.status === 'confirmed' 
                                            ? 'bg-green-100 text-green-800' 
                                            : appointment.status === 'cancelled' 
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {appointment.status}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {appointment.type} 
                                        {appointment.isVirtual && <span className="ml-2 text-blue-600">(Virtual)</span>}
                                      </p>
                                      {appointment.location && (
                                        <p className="text-sm text-gray-500 mt-1">
                                          Location: {appointment.location}
                                        </p>
                                      )}
                                    </div>
                                    <div className="mt-3 md:mt-0">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="mr-2"
                                      >
                                        View Details
                                      </Button>
                                      {appointment.status !== 'cancelled' && (
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                          Cancel
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No upcoming appointments found</p>
                    <Button variant="outline" className="mt-4">
                      Create New Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
};

export default Provider;