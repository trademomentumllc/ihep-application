import { useQuery, useMutation } from "@tanstack/react-query";
import { Discussion, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { 
  Search, 
  ThumbsUp, 
  MessageSquare,
  Users
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const DiscussionsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Get discussions
  const { data: discussions, isLoading } = useQuery<Discussion[]>({
    queryKey: ['/api/discussions', { search: searchTerm }],
  });

  // Get users for author info
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Format posted time
  const formatPostedTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Get author name
  const getAuthorName = (authorId: number) => {
    const author = users?.find(user => user.id === authorId);
    return author ? `${author.firstName} ${author.lastName}` : `User ${authorId}`;
  };

  // Get group name
  const getGroupName = (groupId: number) => {
    // This would normally fetch from community groups, but for simplicity:
    const groupNames = {
      1: "Newly Diagnosed Support",
      2: "Long-term Survivors",
      3: "Treatment Advances Discussion"
    };
    return groupNames[groupId as keyof typeof groupNames] || `Group ${groupId}`;
  };

  // Like discussion mutation
  const likeMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('POST', `/api/discussions/${id}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discussions'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like discussion",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <h3 className="font-montserrat font-semibold mb-4">Recent Discussions</h3>
      
      <div className="mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search discussions..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        </div>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-6 w-64 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-full mt-1" />
              <div className="flex mt-3 space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))
        ) : discussions && discussions.length > 0 ? (
          discussions.slice(0, 3).map((discussion, index) => (
            <div 
              key={discussion.id}
              className={`${index < discussions.slice(0, 3).length - 1 ? 'border-b border-gray-200' : ''} pb-4`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{discussion.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Started by <span className="text-primary">{getAuthorName(discussion.authorId)}</span> in{" "}
                    <span className="text-primary">{getGroupName(discussion.groupId)}</span>
                  </p>
                </div>
                <div className="bg-gray-50 px-2 py-1 rounded-full text-xs text-gray-500">
                  {discussion.replyCount} replies
                </div>
              </div>
              <p className="text-sm mt-2">
                {discussion.content.length > 150
                  ? `${discussion.content.substring(0, 150)}...`
                  : discussion.content}
              </p>
              <div className="flex items-center mt-3">
                <span className="text-xs text-gray-500">{formatPostedTime(discussion.createdAt)}</span>
                <span className="mx-2 text-gray-500">•</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs text-primary hover:text-primary/80 p-0 h-auto flex items-center"
                  onClick={() => isAuthenticated && likeMutation.mutate(discussion.id)}
                >
                  <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                  {discussion.likes}
                </Button>
                <span className="mx-2"></span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs text-primary hover:text-primary/80 p-0 h-auto flex items-center"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  Reply
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No discussions found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? `No results for "${searchTerm}"` : "Be the first to start a discussion!"}
            </p>
          </div>
        )}
      </div>
      
      {discussions && discussions.length > 0 && (
        <div className="text-center mt-6">
          <Button variant="outline" className="text-gray-600 font-medium px-6">
            View All Discussions
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiscussionsList;
