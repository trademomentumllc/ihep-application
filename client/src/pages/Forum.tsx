import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ForumCategory } from "@shared/schema";
import { APP_NAME } from "@/lib/constants";
import { 
  MessageSquare, 
  Users, 
  Plus, 
  Search,
  Loader2,
  MoveRight,
  Award
} from "lucide-react";

const Forum = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("categories");

  // Fetch forum categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ["/api/forum/categories"],
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Fetch featured posts
  const {
    data: featuredPosts,
    isLoading: featuredLoading,
    error: featuredError
  } = useQuery({
    queryKey: ["/api/forum/posts", { isFeatured: true }],
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/forum/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Community Forum | {APP_NAME}</title>
        <meta name="description" content="Join discussions with our community about health-related topics, share experiences, and find support." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-primary">Community Forum</h1>
            <p className="text-gray-600 mt-1">
              Connect with others, share experiences, and find support
            </p>
          </div>
          
          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[250px] pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Button type="submit" className="sr-only">Search</Button>
            </form>
            
            <Button 
              onClick={() => setLocation("/forum/new")}
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" /> New Post
            </Button>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Categories</span>
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Featured</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Groups</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            {categoriesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : categoriesError ? (
              <div className="text-center py-8 text-red-500">
                <p>Error loading categories. Please try again later.</p>
              </div>
            ) : categories?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No forum categories found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories?.map((category: ForumCategory) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            {featuredLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : featuredError ? (
              <div className="text-center py-8 text-red-500">
                <p>Error loading featured posts. Please try again later.</p>
              </div>
            ) : featuredPosts?.posts?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No featured posts available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {featuredPosts?.posts?.map((post: any) => (
                  <div key={post.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    <Link href={`/forum/post/${post.id}`}>
                      <a className="flex flex-col">
                        <h3 className="font-semibold text-lg text-primary hover:text-primary/80">{post.title}</h3>
                        <p className="text-gray-600 line-clamp-2 text-sm mt-1">{post.content}</p>
                        <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" /> {post.commentCount} comments
                          </span>
                        </div>
                      </a>
                    </Link>
                  </div>
                ))}
                
                <div className="flex justify-center mt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setLocation("/forum/posts?isFeatured=true")}
                  >
                    View All Featured Posts <MoveRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Community groups feature coming soon!</p>
              <Button onClick={() => setActiveTab("categories")}>
                Explore Categories
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

// Category card component
const CategoryCard = ({ category }: { category: ForumCategory }) => {
  return (
    <Link href={`/forum/category/${category.slug || category.id}`}>
      <a className="block border rounded-lg p-5 bg-white hover:shadow-md transition-shadow h-full">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-primary">{category.name}</h3>
            <p className="text-gray-600 mt-2 text-sm line-clamp-2">{category.description}</p>
          </div>
          
          {category.icon && (
            <div className={`p-2 rounded-full ${category.color || 'bg-primary/10'}`}>
              <span className="text-xl">{category.icon}</span>
            </div>
          )}
        </div>
        
        <Separator className="my-3" />
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center">
            <MessageSquare className="h-3 w-3 mr-1" /> {category.postCount || 0} posts
          </span>
          <div className="flex items-center">
            <MoveRight className="h-3 w-3" />
          </div>
        </div>
      </a>
    </Link>
  );
};

export default Forum;