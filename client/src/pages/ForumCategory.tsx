import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ForumCategory, ForumPost } from "@shared/schema";
import { APP_NAME } from "@/lib/constants";
import { 
  MessageSquare, 
  Plus, 
  Search,
  Loader2,
  ChevronLeft,
  User,
  Eye,
  ThumbsUp,
  Clock
} from "lucide-react";

type SortOption = "newest" | "oldest" | "most_comments" | "most_views";

const ForumCategoryPage = () => {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Fetch category
  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError
  } = useQuery({
    queryKey: ["/api/forum/categories", slug],
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Fetch posts in this category
  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsError
  } = useQuery({
    queryKey: ["/api/forum/categories", slug, "posts", { page: currentPage }],
    staleTime: 1000 * 60 * 2 // 2 minutes
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/forum/search?category=${slug}&q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption);
    // In a real implementation, this would re-fetch with the new sort parameter
  };

  const handleCreatePost = () => {
    setLocation(`/forum/new?category=${slug}`);
  };

  // Display formatted date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Calculate time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval === 1 ? '1 year ago' : `${interval} years ago`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval === 1 ? '1 month ago' : `${interval} months ago`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval === 1 ? '1 day ago' : `${interval} days ago`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
    }
    
    return seconds < 10 ? 'just now' : `${Math.floor(seconds)} seconds ago`;
  };

  if (categoryLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Category</h2>
        <p className="mb-6">Unable to load the requested forum category. It may not exist or there was a server error.</p>
        <Button onClick={() => setLocation("/forum")}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Forums
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category.name} Forum | {APP_NAME}</title>
        <meta name="description" content={`Discussions about ${category.name}. ${category.description}`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink href="/forum">Forums</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{category.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-primary">{category.name}</h1>
            <p className="text-gray-600 mt-1">{category.description}</p>
          </div>
          
          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Input
                placeholder="Search this category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[250px] pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Button type="submit" className="sr-only">Search</Button>
            </form>
            
            <Button 
              onClick={handleCreatePost}
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" /> New Post
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            {postsData?.pagination?.total || 0} discussions in this category
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Sort by:</span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="most_comments">Most Comments</SelectItem>
                <SelectItem value="most_views">Most Views</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-lg border">
          {postsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : postsError ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Error loading posts. Please try again later.</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : postsData?.posts?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6">No discussions found in this category.</p>
              <Button onClick={handleCreatePost}>
                <Plus className="h-4 w-4 mr-2" /> Start a New Discussion
              </Button>
            </div>
          ) : (
            <>
              {postsData?.posts.map((post: ForumPost, index: number) => (
                <div key={post.id}>
                  <div className="p-5 hover:bg-gray-50">
                    <Link href={`/forum/post/${post.id}`}>
                      <a className="block">
                        <h3 className="font-semibold text-lg text-primary mb-2">{post.title}</h3>
                        <p className="text-gray-600 line-clamp-2 text-sm">{post.content}</p>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-xs text-gray-500">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" /> 
                            {post.authorName || `User #${post.authorId}`}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> 
                            {timeAgo(post.createdAt)}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" /> 
                            {post.commentCount || 0} comments
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" /> 
                            {post.viewCount || 0} views
                          </span>
                          {post.likes > 0 && (
                            <span className="flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-1" /> 
                              {post.likes} likes
                            </span>
                          )}
                        </div>
                      </a>
                    </Link>
                  </div>
                  {index < postsData?.posts.length - 1 && <Separator />}
                </div>
              ))}

              {/* Pagination */}
              {postsData?.pagination && postsData.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 p-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  
                  <div className="mx-2 text-sm text-gray-600">
                    Page {currentPage} of {postsData.pagination.totalPages}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage >= postsData.pagination.totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ForumCategoryPage;