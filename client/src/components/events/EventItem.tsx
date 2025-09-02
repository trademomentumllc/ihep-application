import { Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  Edit, 
  Share, 
  Users, 
  Video 
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EventItemProps {
  event: Event;
}

const EventItem = ({ event }: EventItemProps) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM").toUpperCase();
  };
  
  const formatDay = (date: Date) => {
    return format(new Date(date), "d");
  };
  
  const formatTime = (start: Date, end: Date) => {
    return `${format(new Date(start), "h:mm a")} - ${format(new Date(end), "h:mm a")}`;
  };
  
  const formatLocation = (event: Event) => {
    return event.location || (event.isVirtual ? "Virtual Event" : "TBA");
  };
  
  const isRegistered = event.registeredUsers?.includes(user?.id);
  
  const registerMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', `/api/events/${event.id}/register`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Registration successful",
        description: "You have been registered for this event",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const unregisterMutation = useMutation({
    mutationFn: () => {
      return apiRequest('POST', `/api/events/${event.id}/unregister`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Unregistered",
        description: "You have been removed from this event",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to unregister",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleRegister = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to register for events",
        variant: "destructive",
      });
      return;
    }
    
    if (isRegistered) {
      unregisterMutation.mutate();
    } else {
      registerMutation.mutate();
    }
  };
  
  const isAppointment = event.category === "appointment";
  const borderColor = isAppointment ? "border-accent" : "border-primary";
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${borderColor} mb-4`}>
      <div className="flex flex-col md:flex-row justify-between">
        <div className="flex">
          <div className="bg-gray-50 rounded p-2 mr-4 text-center h-fit">
            <p className="text-xs font-medium text-gray-500">{formatDate(event.startTime)}</p>
            <p className="text-xl font-bold text-primary">{formatDay(event.startTime)}</p>
          </div>
          <div>
            <h4 className="font-montserrat font-semibold">{event.title}</h4>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(event.startTime, event.endTime)}
              <span className="mx-1">•</span>
              <MapPin className="h-3 w-3 mr-1" />
              {formatLocation(event)}
            </p>
            <div className="mt-2 space-x-2">
              {event.category && (
                <Badge variant="outline" className={`text-xs ${isAppointment ? 'bg-accent/10 text-accent-foreground' : 'bg-primary/10 text-primary'}`}>
                  {event.category}
                </Badge>
              )}
              <Badge variant="outline" className={`text-xs ${event.isVirtual ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {event.isVirtual ? (
                  <><Video className="h-3 w-3 mr-1" /> Virtual</>
                ) : (
                  <><MapPin className="h-3 w-3 mr-1" /> In-Person</>
                )}
              </Badge>
            </div>
            {event.description && (
              <p className="text-sm mt-2">{event.description}</p>
            )}
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          {isAppointment ? (
            <>
              <Button size="sm" variant="outline" className="text-xs flex items-center">
                <Edit className="h-3 w-3 mr-1" />
                Reschedule
              </Button>
              <Button size="sm" className="text-xs bg-primary text-white flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" />
                Add to Calendar
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="sm"
                className={`text-xs ${isRegistered ? 'bg-gray-200 text-gray-700' : 'bg-primary text-white'} flex items-center`}
                onClick={handleRegister}
                disabled={registerMutation.isPending || unregisterMutation.isPending}
              >
                <Users className="h-3 w-3 mr-1" />
                {isRegistered ? 'Unregister' : 'Register'}
              </Button>
              <Button size="sm" variant="outline" className="text-xs flex items-center">
                <Share className="h-3 w-3 mr-1" />
                Share
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventItem;
