import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Notification } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell } from "lucide-react";
import { Link } from "wouter";

const NotificationsCard = () => {
  const { user, isAuthenticated } = useAuth();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: isAuthenticated,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PATCH', `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const formatTime = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Filter unread notifications first, then take the latest 3
  const latestNotifications = notifications
    ?.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-info">
      <div className="flex justify-between items-start">
        <h3 className="font-montserrat font-semibold text-lg">Notifications</h3>
        {notifications && notifications.filter(n => !n.isRead).length > 0 && (
          <span className="bg-info text-white text-xs px-2 py-1 rounded-full">
            {notifications.filter(n => !n.isRead).length} new
          </span>
        )}
      </div>
      <div className="mt-4 space-y-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="border-b border-gray-200 pb-3">
              <Skeleton className="h-5 w-full mb-1" />
              <Skeleton className="h-4 w-24 mt-1" />
            </div>
          ))
        ) : latestNotifications && latestNotifications.length > 0 ? (
          latestNotifications.map((notification, index) => (
            <div 
              key={notification.id} 
              className={`${index < latestNotifications.length - 1 ? 'border-b border-gray-200' : ''} pb-3`}
              onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
            >
              <p className={`text-sm ${notification.isRead ? 'font-normal' : 'font-medium'}`}>
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">{notification.createdAt ? formatTime(notification.createdAt as Date) : 'Recently'}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        )}
      </div>
      {notifications && notifications.length > 0 && (
        <Link href="/notifications">
          <div className="text-info text-sm font-medium mt-4 inline-block hover:underline cursor-pointer">
            View all notifications
          </div>
        </Link>
      )}
    </div>
  );
};

export default NotificationsCard;
