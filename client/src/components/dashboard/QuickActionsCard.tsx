import { Link } from "wouter";
import { MessageSquare, Pill, HelpCircle, Calendar, Activity } from "lucide-react";

const QuickActionsCard = () => {
  const actions = [
    {
      name: "Message Provider",
      icon: <MessageSquare className="text-primary mb-1 h-5 w-5" />,
      href: "/messages",
    },
    {
      name: "Request Refill",
      icon: <Pill className="text-primary mb-1 h-5 w-5" />,
      href: "/medication-refill",
    },
    {
      name: "Health Risks",
      icon: <Activity className="text-primary mb-1 h-5 w-5" />,
      href: "/risk-assessment",
    },
    {
      name: "Find Resources",
      icon: <HelpCircle className="text-primary mb-1 h-5 w-5" />,
      href: "/resources",
    },
    {
      name: "My Appointments",
      icon: <Calendar className="text-primary mb-1 h-5 w-5" />,
      href: "/appointments",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-sidebar-accent">
      <h3 className="font-montserrat font-semibold text-lg">Quick Actions</h3>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <div key={index}>
            <Link href={action.href}>
              <div className="bg-gray-50 hover:bg-gray-200 transition-colors p-3 rounded-lg flex flex-col items-center justify-center text-center h-20 cursor-pointer">
                {action.icon}
                <span className="text-sm font-medium">{action.name}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsCard;
