import { useQuery, useMutation } from "@tanstack/react-query";
import { CommunityGroup } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

const CommunityGroups = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: groups, isLoading } = useQuery<CommunityGroup[]>({
    queryKey: ['/api/community-groups'],
  });

  const joinGroupMutation = useMutation({
    mutationFn: (groupId: number) => {
      return apiRequest('POST', `/api/community-groups/${groupId}/join`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community-groups'] });
      toast({
        title: "Success!",
        description: "You have joined the group.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join group.",
        variant: "destructive",
      });
    },
  });

  const handleJoinGroup = (groupId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to join community groups",
        variant: "destructive",
      });
      return;
    }
    
    joinGroupMutation.mutate(groupId);
  };

  const isUserInGroup = (group: CommunityGroup) => {
    return group.members?.includes(user?.id);
  };

  const formatLastActive = (date: Date) => {
    const lastActive = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActive.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return "Active now";
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="col-span-1 md:col-span-1 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <h3 className="font-montserrat font-semibold mb-4">Community Groups</h3>
      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="border-b border-gray-200 pb-3">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-8 w-24 mt-1" />
            </div>
          ))
        ) : groups && groups.length > 0 ? (
          groups.slice(0, 3).map((group, index) => (
            <div 
              key={group.id} 
              className={`${index < 2 ? 'border-b border-gray-200' : ''} pb-3`}
            >
              <h4 className="font-medium">{group.name}</h4>
              <p className="text-sm text-gray-500 mt-1">{group.description}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">{group.memberCount} members</span>
                <span className="mx-1 text-gray-500">•</span>
                <span className={`text-xs ${new Date(group.lastActive).getTime() > new Date().getTime() - (60 * 60 * 1000) ? 'text-green-600' : 'text-gray-500'}`}>
                  {formatLastActive(group.lastActive)}
                </span>
              </div>
              <Button
                variant="link"
                size="sm"
                className="text-xs text-primary font-medium mt-2 p-0 h-auto"
                onClick={() => handleJoinGroup(group.id)}
                disabled={joinGroupMutation.isPending || isUserInGroup(group)}
              >
                {isUserInGroup(group) ? 'Already Joined' : 'Join Group'}
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No community groups found</p>
          </div>
        )}
        
        {groups && groups.length > 0 && (
          <Button variant="link" className="text-primary text-sm font-medium p-0">
            View all groups
          </Button>
        )}
      </div>
    </div>
  );
};

export default CommunityGroups;
