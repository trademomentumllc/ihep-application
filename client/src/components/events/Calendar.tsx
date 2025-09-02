import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { CalendarViewType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { cn } from "@/lib/utils";

interface CalendarProps {
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
}

const Calendar = ({ view, onViewChange }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(view.date);

  useEffect(() => {
    setCurrentDate(view.date);
  }, [view.date]);

  // Get events for the current month view
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  
  const { data: events } = useQuery<Event[]>({
    queryKey: ['/api/events', { 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString() 
    }],
  });

  // Get days for the current month view with padding for previous/next months
  const getDaysForMonthView = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = start.getDay();
    // If Sunday, we need to show 6 days from previous month
    // Otherwise, show days from previous month to match the grid
    const daysFromPreviousMonth = [];
    for (let i = firstDayOfWeek; i > 0; i--) {
      const date = new Date(start);
      date.setDate(date.getDate() - i);
      daysFromPreviousMonth.push(date);
    }

    // Calculate days needed from next month
    let lastDayOfWeek = end.getDay();
    const daysFromNextMonth = [];
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      const date = new Date(end);
      date.setDate(date.getDate() + i);
      daysFromNextMonth.push(date);
    }

    return [...daysFromPreviousMonth, ...days, ...daysFromNextMonth];
  };

  const days = getDaysForMonthView();

  // Handle navigation
  const goToPrevious = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
    onViewChange({ ...view, date: newDate });
  };

  const goToNext = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    onViewChange({ ...view, date: newDate });
  };

  // Change view type (month, week, day)
  const changeViewType = (type: 'month' | 'week' | 'day') => {
    onViewChange({ type, date: currentDate });
  };

  // Check if a day has events
  const getEventsForDay = (day: Date) => {
    return events?.filter(event => 
      isSameDay(new Date(event.startTime), day)
    ) || [];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="flex items-center">
          <Button size="icon" variant="ghost" onClick={goToPrevious}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h3 className="font-montserrat font-semibold text-lg mx-2">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <Button size="icon" variant="ghost" onClick={goToNext}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex mt-2 md:mt-0">
          <Button 
            size="sm"
            className={view.type === 'month' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600'}
            onClick={() => changeViewType('month')}
          >
            Month
          </Button>
          <Button 
            size="sm"
            className={view.type === 'week' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600'}
            onClick={() => changeViewType('week')}
          >
            Week
          </Button>
          <Button 
            size="sm"
            className={view.type === 'day' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600'}
            onClick={() => changeViewType('day')}
          >
            Day
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 font-medium text-gray-600">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          
          let dayStyles = cn(
            "p-2 text-sm relative min-h-[40px]",
            {
              "text-gray-400": !isCurrentMonth,
              "text-gray-900": isCurrentMonth && !isToday,
              "font-medium": isToday,
            }
          );
          
          if (isToday) {
            dayStyles = cn(dayStyles, "rounded bg-accent bg-opacity-20 border border-accent");
          } else if (dayEvents.length > 0) {
            dayStyles = cn(dayStyles, "rounded bg-primary bg-opacity-10 border border-primary");
          }
          
          return (
            <div key={i} className={dayStyles}>
              {format(day, 'd')}
              {dayEvents.length > 0 && isCurrentMonth && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-0.5">
                    {dayEvents.length > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
