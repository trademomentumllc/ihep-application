import { useState } from "react";
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { EducationalContent } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, BookOpen, Calendar, Star } from "lucide-react";
import { format } from "date-fns";

const Education = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");

  // Fetch educational content
  const { data: content, isLoading } = useQuery<EducationalContent[]>({
    queryKey: ['/api/educational-content', { search: searchTerm, category: category !== 'all' ? category : undefined, featured: true }],
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Re-fetch with the new search term is handled automatically
  };

  return (
    <>
      <Helmet>
        <title>Educational Resources | {APP_NAME}</title>
        <meta name="description" content="Access trusted HIV educational materials, articles, and resources to stay informed about your health." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6 mt-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl md:text-3xl font-montserrat font-bold text-primary">Educational Resources</h2>
          <p className="text-gray-600 mt-2">
            Stay informed with the latest information about HIV treatment, wellness, and living a healthy life.
          </p>
          
          <form onSubmit={handleSearch} className="mt-6 relative">
            <Input
              type="text"
              placeholder="Search educational resources..."
              className="pl-10 py-6"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Button type="submit" className="absolute right-1 top-1/2 transform -translate-y-1/2">
              Search
            </Button>
          </form>
        </div>
        
        <Tabs defaultValue="all" onValueChange={setCategory} className="mt-8">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="all">All Topics</TabsTrigger>
              <TabsTrigger value="medication">Medication</TabsTrigger>
              <TabsTrigger value="wellness">Wellness</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="mental_health">Mental Health</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {/* Featured Content */}
            <div className="mb-8">
              <h3 className="text-xl font-montserrat font-semibold text-primary mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-accent" /> Featured Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-4 w-24" />
                      </CardFooter>
                    </Card>
                  ))
                ) : content?.filter(c => c.featured).length ? (
                  content?.filter(c => c.featured).map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription>
                          {format(new Date(item.publishedDate), "MMMM d, yyyy")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {item.content}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.tags?.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="link" className="text-primary p-0 h-auto text-sm">
                          Read more
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-10">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No featured resources found</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent Content */}
            <div>
              <h3 className="text-xl font-montserrat font-semibold text-primary mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" /> Recent Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <Skeleton className="h-5 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                      </CardHeader>
                      <CardContent className="pb-3">
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  ))
                ) : content?.filter(c => !c.featured).length ? (
                  content?.filter(c => !c.featured).map((item) => (
                    <Card key={item.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {format(new Date(item.publishedDate), "MMMM d, yyyy")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-xs text-gray-600 line-clamp-3">
                          {item.content}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button variant="link" className="text-primary p-0 h-auto text-xs">
                          Read more
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-8">
                    <p className="text-gray-500">No resources found</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* The other tabs would display filtered content */}
          {['medication', 'wellness', 'nutrition', 'mental_health'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))
                ) : content?.filter(c => c.category === tab).length ? (
                  content?.filter(c => c.category === tab).map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription>
                          {format(new Date(item.publishedDate), "MMMM d, yyyy")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {item.content}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="link" className="text-primary p-0 h-auto text-sm">
                          Read more
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-10">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No resources found for this category</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
};

export default Education;
