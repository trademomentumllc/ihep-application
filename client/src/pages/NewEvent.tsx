import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Users, Clock, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

// Form validation schema
const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must not exceed 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
  maxParticipants: z.coerce.number().min(1, "Must allow at least 1 participant").optional(),
  isVirtual: z.boolean().default(false),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const eventCategories = [
  { value: "support_group", label: "Support Group" },
  { value: "educational", label: "Educational Workshop" },
  { value: "social", label: "Social Event" },
  { value: "fitness", label: "Fitness & Wellness" },
  { value: "mental_health", label: "Mental Health" },
  { value: "medical", label: "Medical Information" },
  { value: "community", label: "Community Outreach" },
];

const NewEvent = () => {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/events/new");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      location: "",
      category: "",
      maxParticipants: 20,
      isVirtual: false,
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      const response = await apiRequest("POST", "/api/events", {
        ...data,
        organizerId: user?.id,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
      });
      return await response.json();
    },
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: (data) => {
      toast({
        title: "Event Created Successfully",
        description: "Your event has been created and is now visible to the community.",
      });
      navigate(`/events`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Creating Event",
        description: error.message || "Failed to create event. Please try again.",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: EventFormValues) => {
    // Validate that end time is after start time
    if (new Date(data.endTime) <= new Date(data.startTime)) {
      toast({
        variant: "destructive",
        title: "Invalid Time Range",
        description: "End time must be after start time.",
      });
      return;
    }

    createEventMutation.mutate(data);
  };

  const handleGoBack = () => {
    navigate("/events");
  };

  return (
    <>
      <Helmet>
        <title>Create New Event | {APP_NAME}</title>
        <meta name="description" content="Create a new community event or support group meeting." />
      </Helmet>

      <div className="container mx-auto px-4 py-6 mt-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={handleGoBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
            <div>
              <h1 className="text-2xl font-montserrat font-bold text-primary">Create New Event</h1>
              <p className="text-gray-600 mt-1">Share an event with the community</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Event Details
              </CardTitle>
              <CardDescription>
                Fill out the information below to create your community event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your event, what participants can expect, and any special requirements"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {eventCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date & Time</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date & Time</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <MapPin className="h-4 w-4 inline mr-1" />
                          Location
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter venue address or 'Virtual' for online events"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Users className="h-4 w-4 inline mr-1" />
                          Maximum Participants
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="500"
                            placeholder="20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoBack}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Creating Event...
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4 mr-2" />
                          Create Event
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default NewEvent;