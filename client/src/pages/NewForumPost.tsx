import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Helmet } from "react-helmet";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertForumPostSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { APP_NAME } from "@/lib/constants";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  Loader2, 
  Send, 
  InfoIcon, 
  AlertTriangle
} from "lucide-react";

// Extend the insert schema with additional validation
const postFormSchema = insertForumPostSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must not exceed 100 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  categoryId: z.coerce.number().positive("Please select a category"),
});

type PostFormValues = z.infer<typeof postFormSchema>;

const NewForumPost = () => {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const categoryFromUrl = params.get("category");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories for the dropdown
  const { 
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useQuery({
    queryKey: ["/api/forum/categories"],
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Create form
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: categoryFromUrl ? parseInt(categoryFromUrl) : undefined,
      tags: [],
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormValues) => {
      setIsSubmitting(true);
      try {
        return await apiRequest("/api/forum/posts", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: (response) => {
      // Check if post was approved or flagged for moderation
      const isModerated = response.moderation && !response.moderation.isAllowed;
      
      if (isModerated) {
        toast({
          title: "Post Created - Under Review",
          description: "Your post has been flagged for moderation and will be visible after review.",
          duration: 5000,
        });
      } else {
        toast({
          title: "Post Created",
          description: "Your post has been published successfully.",
          duration: 3000,
        });
      }
      
      // Navigate to the new post or back to the forum if post is under moderation
      if (!isModerated && response.post?.id) {
        setLocation(`/forum/post/${response.post.id}`);
      } else {
        setLocation("/forum");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create post. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  const onSubmit = (values: PostFormValues) => {
    createPostMutation.mutate(values);
  };

  return (
    <>
      <Helmet>
        <title>Create New Discussion | Forum | {APP_NAME}</title>
        <meta name="description" content="Start a new discussion in our community forum about health topics, questions, or experiences." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink href="/forum">Forums</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>New Discussion</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-montserrat font-bold text-primary">Create New Discussion</h1>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>New Discussion</CardTitle>
                <CardDescription>
                  Share your thoughts, questions, or experiences with the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Community Guidelines</AlertTitle>
                  <AlertDescription>
                    <p className="mt-2 text-sm">
                      Please be respectful and supportive. All posts are subject to AI-powered moderation 
                      to ensure a positive environment. Posts containing inappropriate content will be 
                      held for review.
                    </p>
                  </AlertDescription>
                </Alert>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter a clear, specific title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              defaultValue={field.value?.toString()}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categoriesLoading ? (
                                  <div className="flex items-center justify-center p-2">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Loading...
                                  </div>
                                ) : categoriesError ? (
                                  <div className="text-center p-2 text-red-500">
                                    Error loading categories
                                  </div>
                                ) : categories?.length === 0 ? (
                                  <div className="text-center p-2 text-gray-500">
                                    No categories available
                                  </div>
                                ) : (
                                  categories?.map((category: any) => (
                                    <SelectItem 
                                      key={category.id} 
                                      value={category.id.toString()}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Share your thoughts, questions, or experiences..." 
                              rows={10}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary text-white hover:bg-primary/90"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Publish Discussion
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Writing Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Be Clear and Specific</h3>
                  <p className="text-sm text-gray-600">
                    Use a clear title that summarizes your main point or question.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-1">Provide Context</h3>
                  <p className="text-sm text-gray-600">
                    Include relevant details to help others understand your situation.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-1">Ask Specific Questions</h3>
                  <p className="text-sm text-gray-600">
                    If you're seeking advice, be clear about what kind of help you need.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-1">Be Respectful</h3>
                  <p className="text-sm text-gray-600">
                    Remember that this is a supportive community. Be kind and considerate.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-medium mb-1">Protect Privacy</h3>
                  <p className="text-sm text-gray-600">
                    Don't share personal identifying information about yourself or others.
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

export default NewForumPost;