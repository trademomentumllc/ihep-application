import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ForumPost, ForumComment } from "@shared/schema";
import { APP_NAME } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { 
  MessageSquare, 
  ChevronLeft,
  User,
  Eye,
  ThumbsUp,
  Clock,
  Share2,
  AlertTriangle,
  Loader2,
  Send
} from "lucide-react";

const ForumPostPage = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  // Fetch post
  const {
    data: post,
    isLoading: postLoading,
    error: postError
  } = useQuery({
    queryKey: ["/api/forum/posts", id],
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Fetch category for breadcrumbs
  const {
    data: category,
    isLoading: categoryLoading
  } = useQuery({
    queryKey: ["/api/forum/categories", post?.categoryId],
    enabled: !!post?.categoryId,
    staleTime: 1000 * 60 * 30 // 30 minutes
  });

  // Fetch comments
  const {
    data: commentsData,
    isLoading: commentsLoading,
    error: commentsError
  } = useQuery({
    queryKey: ["/api/forum/posts", id, "comments", { page: currentPage }],
    staleTime: 1000 * 60 * 2 // 2 minutes
  });

  // Fetch AI response suggestion
  const getAiSuggestion = async () => {
    if (!post) return;
    
    setIsSubmitting(true);
    try {
      const response = await apiRequest(`/api/forum/suggestion`, {
        method: "POST",
        body: JSON.stringify({ postContent: post.content }),
      });
      
      if (response.suggestion) {
        setAiSuggestion(response.suggestion);
        setShowAiSuggestion(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new comment
  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      return apiRequest(`/api/forum/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts", id, "comments"] });
      setNewComment("");
      toast({
        title: "Comment Added",
        description: "Your comment has been successfully added.",
      });
    },
    onError: (error: any) => {
      let message = "Failed to add comment. Please try again.";
      
      if (error.data?.moderation?.isAllowed === false) {
        message = "Your comment has been flagged for moderation: " + 
          (error.data?.moderation?.notes || "It may contain inappropriate content.");
      }
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    addCommentMutation.mutate({
      postId: id,
      content: newComment
    });
  };

  const handleUseAiSuggestion = () => {
    setNewComment(aiSuggestion);
    setShowAiSuggestion(false);
  };

  // Display formatted date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Initialize author name display
  const getAuthorDisplay = (authorId?: number, authorName?: string) => {
    return authorName || `User #${authorId}`;
  };

  // Get avatar fallback initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  if (postLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Post</h2>
        <p className="mb-6">Unable to load the requested forum post. It may not exist or there was a server error.</p>
        <Button onClick={() => setLocation("/forum")}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Forums
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | Forum | {APP_NAME}</title>
        <meta name="description" content={`${post.content.substring(0, 155)}...`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink href="/forum">Forums</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {category && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/forum/category/${category.slug || category.id}`}>
                  {category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbLink>Post</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-primary mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center">
              <User className="h-4 w-4 mr-1" /> 
              {getAuthorDisplay(post.authorId, post.authorName)}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" /> 
              {formatDate(post.createdAt)}
            </span>
            {post.isPinned && (
              <Badge variant="outline" className="bg-yellow-50">Pinned</Badge>
            )}
            {post.isFeatured && (
              <Badge variant="outline" className="bg-blue-50">Featured</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            {/* Main post content */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.authorAvatar} alt={getAuthorDisplay(post.authorId, post.authorName)} />
                    <AvatarFallback>{getInitials(getAuthorDisplay(post.authorId, post.authorName))}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-4 w-full">
                    <div className="prose max-w-none">
                      <p>{post.content}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" /> 
                        {post.viewCount || 0} views
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" /> 
                        {post.commentCount || 0} responses
                      </span>
                      <div className="flex-grow"></div>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Share2 className="h-4 w-4 mr-1" /> Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments section */}
            <h2 className="text-xl font-semibold mt-8 mb-4">Responses</h2>
            
            {commentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : commentsError ? (
              <div className="text-center py-6 text-red-500">
                <p>Error loading comments. Please try again later.</p>
              </div>
            ) : commentsData?.comments?.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>No responses yet. Be the first to respond!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {commentsData?.comments?.map((comment: ForumComment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {getInitials(getAuthorDisplay(comment.authorId, comment.authorName))}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 w-full">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">
                              {getAuthorDisplay(comment.authorId, comment.authorName)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-700">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                {commentsData?.pagination && commentsData.pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    
                    <div className="mx-2 text-sm text-gray-600">
                      Page {currentPage} of {commentsData.pagination.totalPages}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage >= commentsData.pagination.totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Add comment form */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Add Your Response</h3>
              
              {showAiSuggestion && aiSuggestion && (
                <Alert className="mb-4 bg-blue-50 border-blue-100">
                  <AlertTitle className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> AI Response Suggestion
                  </AlertTitle>
                  <AlertDescription>
                    <p className="mt-2 text-sm text-gray-700">{aiSuggestion}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={handleUseAiSuggestion}
                    >
                      Use This Response
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <Textarea 
                  placeholder="Share your thoughts or ask a question..."
                  rows={5}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={addCommentMutation.isPending}
                />
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    disabled={isSubmitting || post.content.length < 10}
                    onClick={getAiSuggestion}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                        Getting AI suggestion...
                      </>
                    ) : (
                      <>Get AI Response Suggestion</>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    {addCommentMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" /> 
                        Submit Response
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  <p className="flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500" />
                    All responses are moderated to ensure a supportive and helpful community.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About the author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.authorAvatar} alt={getAuthorDisplay(post.authorId, post.authorName)} />
                    <AvatarFallback>{getInitials(getAuthorDisplay(post.authorId, post.authorName))}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{getAuthorDisplay(post.authorId, post.authorName)}</div>
                    <div className="text-xs text-gray-500">Member since {new Date(post.authorJoinDate || post.createdAt).getFullYear()}</div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setLocation(`/forum/user/${post.authorId}`)}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Similar discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <p className="text-gray-500 text-center py-2">
                    Related discussions will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForumPostPage;