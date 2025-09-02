import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addDays, addMonths, subMonths, 
  startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { CalendarViewType } from '@/lib/types';

// Calendar localization setup
// Using dynamic import since require is not available in client code
import { enUS } from 'date-fns/locale';
const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Define calendar event interfaces
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resourceId?: number;
  allDay?: boolean;
  type: 'appointment' | 'event';
  status?: string;
  virtualAppointment?: boolean;
  location?: string;
}

interface CalendarViewProps {
  view?: 'month' | 'week' | 'day';
  initialDate?: Date;
  onViewChange?: (view: CalendarViewType) => void;
}

export function CalendarView({ view = 'month', initialDate, onViewChange }: CalendarViewProps) {
  const { user, isAuthenticated, role } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>(view);
  const [currentDate, setCurrentDate] = useState<Date>(initialDate || new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // Calculate date ranges based on current view and date
  const getDateRange = () => {
    if (calendarView === 'day') {
      return {
        startDate: startOfDay(currentDate),
        endDate: endOfDay(currentDate)
      };
    } else if (calendarView === 'week') {
      const weekStart = startOfWeek(currentDate);
      return {
        startDate: weekStart,
        endDate: endOfDay(addDays(weekStart, 6))
      };
    } else {
      return {
        startDate: startOfMonth(currentDate),
        endDate: endOfMonth(currentDate)
      };
    }
  };
  
  const { startDate, endDate } = getDateRange();
  
  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments', startDate.toISOString(), endDate.toISOString(), role],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      // Format dates for API
      const from = startDate.toISOString();
      const to = endDate.toISOString();
      const params = new URLSearchParams({
        startDate: from,
        endDate: to
      });
      try {
        const response = await fetch(`/api/appointments?${params.toString()}`, {
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }
    },
    enabled: isAuthenticated
  });
  
  // Fetch events
  const { data: communityEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      // Format dates for API
      const from = startDate.toISOString();
      const to = endDate.toISOString();
      const params = new URLSearchParams({
        startDate: from,
        endDate: to
      });
      try {
        const response = await fetch(`/api/events?${params.toString()}`, {
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching community events:', error);
        return [];
      }
    }
  });
  
  // Transform appointments and events into calendar events
  useEffect(() => {
    const calendarEvents: CalendarEvent[] = [];
    
    // Add appointments to calendar
    if (appointments && Array.isArray(appointments)) {
      appointments.forEach((appointment: any) => {
        const startTime = new Date(appointment.startTime);
        let endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + (appointment.duration || 30));
        
        calendarEvents.push({
          id: appointment.id,
          title: appointment.type || 'Appointment',
          start: startTime,
          end: endTime,
          resourceId: appointment.providerId,
          type: 'appointment',
          status: appointment.status,
          virtualAppointment: appointment.virtualAppointment,
          location: appointment.location
        });
      });
    }
    
    // Add community events to calendar
    if (communityEvents && Array.isArray(communityEvents)) {
      communityEvents.forEach((event: any) => {
        calendarEvents.push({
          id: event.id,
          title: event.title,
          start: new Date(event.startTime),
          end: new Date(event.endTime),
          allDay: false,
          type: 'event',
          location: event.location
        });
      });
    }
    
    setEvents(calendarEvents);
  }, [appointments, communityEvents]);
  
  // Navigate to different dates
  const navigateToToday = () => {
    setCurrentDate(new Date());
    if (onViewChange) {
      onViewChange({
        type: calendarView,
        date: new Date()
      });
    }
  };
  
  const navigateToPrevious = () => {
    if (calendarView === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (calendarView === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
    
    if (onViewChange) {
      onViewChange({
        type: calendarView,
        date: currentDate
      });
    }
  };
  
  const navigateToNext = () => {
    if (calendarView === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (calendarView === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
    
    if (onViewChange) {
      onViewChange({
        type: calendarView,
        date: currentDate
      });
    }
  };
  
  // Handle event selection
  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.type === 'appointment') {
      setLocation(`/appointments/${event.id}`);
    } else {
      setLocation(`/events/${event.id}`);
    }
  };
  
  // Handle slot selection (creating new appointment)
  const handleSelectSlot = ({ start }: { start: Date }) => {
    if (isAuthenticated) {
      // Store the selected date/time in the URL for the new appointment form
      const dateStr = start.toISOString();
      setLocation(`/appointments/new?date=${dateStr}`);
    } else {
      toast({
        title: "Login Required",
        description: "Please sign in to schedule an appointment",
        variant: "default",
      });
    }
  };
  
  // Change view (day, week, month)
  const changeView = (newView: 'month' | 'week' | 'day') => {
    setCalendarView(newView);
    if (onViewChange) {
      onViewChange({
        type: newView,
        date: currentDate
      });
    }
  };
  
  // Custom event styling based on type and status
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#285238'; // Default Health Insight Ventures green
    let borderColor = '#1e3d2b';
    
    if (event.type === 'appointment') {
      if (event.status === 'cancelled') {
        backgroundColor = '#d32f2f'; // Red for cancelled
        borderColor = '#b71c1c';
      } else if (event.status === 'pending') {
        backgroundColor = '#f57c00'; // Orange for pending
        borderColor = '#ef6c00';
      } else if (event.virtualAppointment) {
        backgroundColor = '#1565c0'; // Blue for virtual
        borderColor = '#0d47a1';
      }
    } else {
      // Style for community events
      backgroundColor = '#7b5c36'; // Brown/umber for events
      borderColor = '#5d4427';
    }
    
    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        borderRadius: '4px',
        opacity: 0.9,
        display: 'block',
        fontWeight: 500,
      }
    };
  };
  
  // Loading state
  if (appointmentsLoading || eventsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <Card className="shadow-md w-full">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl font-bold text-primary">Calendar</CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={navigateToPrevious}>
              Previous
            </Button>
            <Button size="sm" variant="outline" onClick={navigateToToday}>
              Today
            </Button>
            <Button size="sm" variant="outline" onClick={navigateToNext}>
              Next
            </Button>
          </div>
        </div>
        <div className="flex space-x-2 mb-4">
          <Button 
            size="sm" 
            variant={calendarView === 'month' ? 'default' : 'outline'}
            onClick={() => changeView('month')}
          >
            Month
          </Button>
          <Button 
            size="sm" 
            variant={calendarView === 'week' ? 'default' : 'outline'}
            onClick={() => changeView('week')}
          >
            Week
          </Button>
          <Button 
            size="sm" 
            variant={calendarView === 'day' ? 'default' : 'outline'}
            onClick={() => changeView('day')}
          >
            Day
          </Button>
        </div>
        
        <CardDescription>
          {calendarView === 'day' 
            ? format(currentDate, 'MMMM d, yyyy') 
            : calendarView === 'week'
              ? `Week of ${format(startOfWeek(currentDate), 'MMMM d, yyyy')}`
              : format(currentDate, 'MMMM yyyy')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day']}
            view={calendarView}
            date={currentDate}
            onNavigate={setCurrentDate}
            onView={(newView: string) => changeView(newView as 'month' | 'week' | 'day')}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable={isAuthenticated}
          />
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#285238' }}></div>
            <span className="text-sm">Confirmed Appointment</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#f57c00' }}></div>
            <span className="text-sm">Pending Appointment</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#1565c0' }}></div>
            <span className="text-sm">Virtual Appointment</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#d32f2f' }}></div>
            <span className="text-sm">Cancelled Appointment</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#7b5c36' }}></div>
            <span className="text-sm">Community Event</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}