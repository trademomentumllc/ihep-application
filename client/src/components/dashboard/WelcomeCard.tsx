import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Appointment } from "@shared/schema";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const WelcomeCard = () => {
  const { user, isAuthenticated } = useAuth();
  
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments', { patientId: user?.id, status: 'scheduled' }],
    enabled: isAuthenticated && user?.role === 'patient',
  });

  // Find the next upcoming appointment
  const nextAppointment = appointments?.sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )?.[0];

  const formatAppointmentTime = (startTime: string | Date) => {
    return format(new Date(startTime), "MMMM d, yyyy 'at' h:mm a");
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          {isAuthenticated ? (
            <>
              <h2 className="text-2xl font-montserrat font-bold text-primary">
                Welcome back, {user?.firstName || 'User'}
              </h2>
              {isLoading ? (
                <Skeleton className="h-5 w-80 mt-2" />
              ) : nextAppointment ? (
                <p className="text-gray-600 mt-1">
                  Your next appointment is on{" "}
                  <span className="font-medium">
                    {formatAppointmentTime(nextAppointment.startTime)}
                  </span>{" "}
                  with Dr. {nextAppointment.providerId}
                </p>
              ) : (
                <p className="text-gray-600 mt-1">
                  You have no upcoming appointments.
                </p>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-montserrat font-bold text-primary">
                Welcome to Health Insight Ventures
              </h2>
              <p className="text-gray-600 mt-1">
                Sign in to schedule appointments and access all features.
              </p>
            </>
          )}
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/appointments/new">
            <Button className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Appointment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
