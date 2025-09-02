import { useState } from "react";
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link, useLocation } from "wouter";
import { Calendar, Clock, MapPin, Video, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Appointment } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CalendarViewType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { queryClient } from "@/lib/queryClient";

const AppointmentsPage = () => {
  const [activeTab, setActiveTab] = useState("calendar");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [calendarView, setCalendarView] = useState<CalendarViewType>({
    type: 'month',
    date: new Date()
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  
  // Fetch appointments
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });

  // Filter appointments based on tab
  const getFilteredAppointments = () => {
    if (!appointments) return [];
    
    const now = new Date();
    if (activeTab === "upcoming") {
      return appointments.filter(apt => new Date(apt.startTime) > now);
    } else {
      return appointments.filter(apt => new Date(apt.startTime) <= now);
    }
  };

  const filteredAppointments = getFilteredAppointments();

  // Cancel appointment mutation
  const cancelAppointment = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to cancel appointment');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully.",
      });
      setIsCancelDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
      });
    }
  });

  // Handle reschedule
  const handleReschedule = (appointment: Appointment) => {
    setLocation(`/appointments/reschedule/${appointment.id}`);
  };

  // Handle cancel
  const handleCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsCancelDialogOpen(true);
  };

  // Handle join virtual visit
  const handleJoinVirtual = (appointment: Appointment) => {
    if (appointment.isVirtual) {
      setLocation(`/telehealth/join/${appointment.id}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Appointments | {APP_NAME}</title>
        <meta name="description" content="View and manage your healthcare appointments." />
      </Helmet>
      
      <section className="container mx-auto px-4 py-6 mt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-montserrat font-bold text-primary">My Appointments</h2>
            <p className="text-gray-600 mt-1">Schedule, view, and manage your healthcare appointments</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setLocation("/appointments/new")}
            >
              Schedule New Appointment
            </Button>
          </div>
        </div>

        <Tabs defaultValue="calendar" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="calendar">
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past">
              <Clock className="h-4 w-4 mr-2" />
              Past Appointments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[600px] w-full rounded-lg" />
              </div>
            ) : (
              <CalendarView 
                view={calendarView.type}
                initialDate={calendarView.date}
                onViewChange={(newView) => setCalendarView(newView)}
              />
            )}
          </TabsContent>
          
          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <Skeleton key={i} className="h-36 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                    onJoinVirtual={handleJoinVirtual}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">No upcoming appointments</h3>
                <p className="text-gray-500 mb-4">Schedule an appointment with your healthcare provider</p>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => setLocation("/appointments/new")}>
                  Schedule Appointment
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <Skeleton key={i} className="h-36 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                    onJoinVirtual={handleJoinVirtual}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">No past appointments</h3>
                <p className="text-gray-500">Your appointment history will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Cancel Confirmation Dialog */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="py-4">
                <p><strong>Appointment:</strong> {selectedAppointment.type}</p>
                <p><strong>Date:</strong> {format(new Date(selectedAppointment.startTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}</p>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCancelDialogOpen(false)}
              >
                Keep Appointment
              </Button>
              <Button 
                variant="destructive"
                onClick={() => selectedAppointment && cancelAppointment.mutate(selectedAppointment.id)}
                disabled={cancelAppointment.isPending}
              >
                {cancelAppointment.isPending ? "Cancelling..." : "Cancel Appointment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </>
  );
};

interface AppointmentCardProps {
  appointment: Appointment;
  onReschedule: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onJoinVirtual: (appointment: Appointment) => void;
}

const AppointmentCard = ({ appointment, onReschedule, onCancel, onJoinVirtual }: AppointmentCardProps) => {
  const startDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime);
  
  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Badge className={statusColors[appointment.status as keyof typeof statusColors] || "bg-gray-100"}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
              
              {appointment.isVirtual && (
                <Badge variant="outline" className="ml-2 flex items-center">
                  <Video className="h-3 w-3 mr-1" />
                  Virtual
                </Badge>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900">{appointment.type} Appointment</h3>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                {format(startDate, "EEEE, MMMM d, yyyy")}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
              </div>
              
              {appointment.location && !appointment.isVirtual && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  {appointment.location}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-start md:items-end space-y-2">
            {appointment.status === "scheduled" && (
              <>
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => onReschedule(appointment)}
                >
                  Reschedule
                </Button>
                <Button 
                  variant="outline" 
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => onCancel(appointment)}
                >
                  Cancel
                </Button>
              </>
            )}
            
            {appointment.isVirtual && appointment.status === "confirmed" && (
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => onJoinVirtual(appointment)}
              >
                Join Virtual Visit
              </Button>
            )}
            
            {appointment.status === "completed" && (
              <Link href={`/appointment-summary/${appointment.id}`}>
                <Button variant="outline">View Summary</Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentsPage;