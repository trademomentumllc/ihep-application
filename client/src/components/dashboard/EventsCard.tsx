import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Link } from "wouter";

const EventsCard = () => {
  const { user, isAuthenticated } = useAuth();

  // Fetch upcoming events for the user
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', { startDate: new Date().toISOString() }],
    enabled: isAuthenticated,
  });

  // Sort and get the next 2 events
  const upcomingEvents = events
    ?.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 2);

  const formatEventMonth = (date: Date) => {
    return format(new Date(date), "MMM").toUpperCase();
  };

  const formatEventDay = (date: Date) => {
    return format(new Date(date), "d");
  };

  const formatEventTime = (start: Date, end: Date) => {
    return `${format(new Date(start), "h:mm a")} - ${format(new Date(end), "h:mm a")}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-accent">
      <h3 className="font-montserrat font-semibold text-lg">Upcoming Events</h3>
      <div className="mt-4 space-y-3">
        {isLoading ? (
          Array(2).fill(0).map((_, i) => (
            <div key={i} className="flex items-start">
              <Skeleton className="h-12 w-12 rounded mr-3" />
              <div>
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))
        ) : upcomingEvents && upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <div key={event.id} className="flex items-start">
              <div className="bg-gray-50 rounded p-2 mr-3 text-center min-w-[48px]">
                <p className="text-xs font-medium text-gray-500">{formatEventMonth(event.startTime)}</p>
                <p className="text-lg font-bold text-primary">{formatEventDay(event.startTime)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatEventTime(event.startTime, event.endTime)} • {event.location || 'Virtual'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No upcoming events</p>
          </div>
        )}
      </div>
      <div>
        <Link href="/events">
          <div className="text-primary text-sm font-medium mt-4 inline-block hover:underline cursor-pointer">
            View full calendar
          </div>
        </Link>
      </div>
    </div>
  );
};

export default EventsCard;
