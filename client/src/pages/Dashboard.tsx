import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import NotificationsCard from "@/components/dashboard/NotificationsCard";
import EventsCard from "@/components/dashboard/EventsCard";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import QuickHealthTips from "@/components/dashboard/QuickHealthTips";
import MentalWellnessTracker from "@/components/dashboard/MentalWellnessTracker";

const Dashboard = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard | {APP_NAME}</title>
        <meta name="description" content="Your personalized dashboard to access healthcare resources, appointments, and community support." />
      </Helmet>
      
      <section className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 mt-2 sm:mt-4">
        <WelcomeCard />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6">
          <NotificationsCard />
          <EventsCard />
          <QuickActionsCard />
        </div>
        
        {/* Health Tips and Mental Wellness Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6">
          <div className="h-full">
            <QuickHealthTips refreshInterval={0} />
          </div>
          <div className="h-full">
            <MentalWellnessTracker />
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
