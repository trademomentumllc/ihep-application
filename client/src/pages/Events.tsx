import { useState } from "react";
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CalendarViewType } from "@/lib/types";
import EventItem from "@/components/events/EventItem";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Link } from "wouter";

const Events = () => {
  // Calendar view state
  const [calendarView, setCalendarView] = useState({
    type: 'month' as 'month' | 'week' | 'day',
    date: new Date()
  });
  
  const [showAllEvents, setShowAllEvents] = useState(false);

  // Fetch upcoming events
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', { startDate: new Date().toISOString() }],
  });

  // Sort events by start time
  const upcomingEvents = events
    ?.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, showAllEvents ? events.length : 5);

  const handleSeeMoreEvents = () => {
    setShowAllEvents(true);
  };

  return (
    <>
      <Helmet>
        <title>Events Calendar | {APP_NAME}</title>
        <meta name="description" content="View and register for upcoming HIV support groups, educational events and medical appointments." />
      </Helmet>
      
      <section className="container mx-auto px-4 py-6 mt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-montserrat font-bold text-primary">Event Calendar</h2>
            <p className="text-gray-600 mt-1">Discover and register for upcoming events and support groups</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/events/new">
              <Button className="bg-primary text-white hover:bg-primary/90 flex items-center">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add to My Calendar
              </Button>
            </Link>
          </div>
        </div>

        <CalendarView 
          view={calendarView.type}
          initialDate={calendarView.date}
          onViewChange={setCalendarView}
        />

        <h3 className="text-xl font-montserrat font-semibold text-primary mb-4">Upcoming Events</h3>
        
        <div className="space-y-4">
          {isLoading ? (
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-200">
                <div className="flex">
                  <div className="bg-gray-200 rounded p-2 mr-3 w-12 h-16"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-24 mt-2"></div>
                  </div>
                </div>
              </div>
            ))
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <EventItem key={event.id} event={event} />
            ))
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No upcoming events found</p>
              <Link href="/events/new">
                <Button variant="outline" className="mt-4">
                  Create New Event
                </Button>
              </Link>
            </div>
          )}
          
          {upcomingEvents && upcomingEvents.length > 0 && !showAllEvents && upcomingEvents.length < (events?.length || 0) && (
            <div className="text-center mt-6">
              <Button variant="outline" className="text-gray-600 px-6" onClick={handleSeeMoreEvents}>
                See More Events
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Events;
