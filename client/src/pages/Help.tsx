import { useState } from "react";
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const Help = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState("");
  const [supportForm, setSupportForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const faqs = [
    {
      question: "How do I schedule an appointment?",
      answer: "You can schedule an appointment by navigating to the Appointments page and clicking on 'New Appointment'. Select your preferred healthcare provider, date, time, and visit type. You'll receive a confirmation once the appointment is scheduled."
    },
    {
      question: "How do I find resources near me?",
      answer: "Visit the Resources page and use the filters on the left to narrow down resources by category, distance, and availability. You can also use the search bar to find specific resources by name or service type."
    },
    {
      question: "How do I join a support group?",
      answer: "Support groups can be found in the Community section. Browse available groups, click on one to view details, and click the 'Join Group' button to become a member. You'll then have access to discussions and events within that group."
    },
    {
      question: "How do I update my profile information?",
      answer: "Go to your Profile page by clicking on your name or the profile icon in the top-right corner. Click on 'Edit Profile' to update your personal information, contact details, and preferences."
    },
    {
      question: "What should I do if I need to cancel an appointment?",
      answer: "Go to the Appointments page, find the appointment you need to cancel, and click on 'Cancel Appointment'. Please try to cancel at least 24 hours in advance to allow the time slot to be offered to other patients."
    },
    {
      question: "How can I access my medical records?",
      answer: "Your medical records can be accessed through your Profile page under the 'Medical Records' tab. You can view your history, download documents, and request additional records if needed."
    }
  ];

  const [filteredFaqs, setFilteredFaqs] = useState(faqs);

  // Submit support form mutation
  const submitSupport = useMutation({
    mutationFn: async (data: typeof supportForm) => {
      const response = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to submit support request');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Support Request Submitted",
        description: "We've received your request and will respond within 24 hours.",
      });
      setSupportForm({ name: "", email: "", subject: "", message: "" });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Submitting Request",
        description: error.message || "Failed to submit support request.",
      });
    }
  });

  // Handle search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredFaqs(faqs);
      return;
    }

    const filtered = faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFaqs(filtered);
    
    toast({
      title: "Search Results",
      description: `Found ${filtered.length} result(s) for "${searchQuery}"`,
    });
  };

  // Handle guide selection
  const handleGuideClick = (guideType: string) => {
    setSelectedGuide(guideType);
    setIsGuideDialogOpen(true);
  };

  // Handle support form submission
  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportForm.name || !supportForm.email || !supportForm.subject || !supportForm.message) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      });
      return;
    }
    submitSupport.mutate(supportForm);
  };

  // Get guide content
  const getGuideContent = (guideType: string) => {
    const guides = {
      "getting-started": {
        title: "Getting Started Guide",
        content: `
          Welcome to the IHEP platform! Here's how to get started:
          
          1. Complete Your Profile
          - Add your personal information and contact details
          - Set up your medical preferences and notifications
          - Upload your profile photo (optional)
          
          2. Schedule Your First Appointment
          - Navigate to the Appointments page
          - Click "Schedule New Appointment"
          - Select your preferred provider and time
          
          3. Explore Resources
          - Visit the Resources page to find local services
          - Use filters to find specific types of support
          - Save resources you want to remember
          
          4. Join the Community
          - Browse support groups in the Community section
          - Participate in discussions and events
          - Connect with others on similar journeys
        `
      },
      "scheduling": {
        title: "Scheduling Appointments",
        content: `
          Step-by-step guide to scheduling appointments:
          
          1. Access the Appointments Page
          - Click "Appointments" in the main navigation
          - Or use the Quick Actions card on your dashboard
          
          2. Start New Appointment
          - Click "Schedule New Appointment"
          - Choose appointment type (in-person or virtual)
          
          3. Select Provider and Time
          - Browse available healthcare providers
          - Choose your preferred date and time slot
          - Add any special notes or requests
          
          4. Confirm Details
          - Review all appointment information
          - Confirm your contact details
          - Submit the appointment request
          
          5. Receive Confirmation
          - You'll get an email confirmation
          - The appointment will appear in your calendar
          - SMS reminders will be sent (if enabled)
        `
      },
      "resources": {
        title: "Finding Resources",
        content: `
          How to find and use healthcare resources:
          
          1. Access the Resource Directory
          - Navigate to the "Resources" page
          - Use the search bar for specific services
          
          2. Use Filters Effectively
          - Select relevant categories (Medical, Support, etc.)
          - Set your distance preference
          - Filter by availability status
          
          3. View Resource Details
          - Click on any resource card for more information
          - Check contact details, hours, and services
          - Read reviews and ratings from other users
          
          4. Save and Share Resources
          - Bookmark helpful resources for later
          - Share resources with family or friends
          - Add notes about your experience
          
          5. Get Directions
          - Use the built-in map feature
          - Get turn-by-turn directions
          - Save frequently visited locations
        `
      },
      "virtual": {
        title: "Virtual Appointments",
        content: `
          Everything about virtual healthcare visits:
          
          1. Technical Requirements
          - Stable internet connection (minimum 1 Mbps)
          - Computer, tablet, or smartphone with camera
          - Updated web browser or mobile app
          
          2. Before Your Appointment
          - Test your camera and microphone
          - Find a quiet, private space
          - Have your insurance card and ID ready
          
          3. Joining Your Visit
          - Click "Join Virtual Visit" from your appointments
          - Allow camera and microphone permissions
          - Wait for your provider to join
          
          4. During the Visit
          - Speak clearly and look at the camera
          - Use the chat feature for questions
          - Take notes about next steps
          
          5. After the Visit
          - Download any provided documents
          - Schedule follow-up appointments
          - Complete any required surveys
        `
      },
      "medications": {
        title: "Managing Medications",
        content: `
          Complete guide to medication management:
          
          1. Adding Medications
          - Go to Medication Adherence page
          - Click "Add Medication"
          - Enter name, dosage, and schedule
          
          2. Setting Up Reminders
          - Enable SMS reminders in settings
          - Set custom notification times
          - Choose reminder frequency
          
          3. Tracking Adherence
          - Mark medications as taken daily
          - Skip or postpone doses when needed
          - Review your adherence statistics
          
          4. Managing Refills
          - Set up automatic refill reminders
          - Track remaining doses
          - Coordinate with your pharmacy
          
          5. Earning Rewards
          - Complete daily medication tracking
          - Maintain adherence streaks
          - Redeem points for health rewards
        `
      },
      "wellness": {
        title: "Using Wellness Tracking",
        content: `
          How to track and improve your wellness:
          
          1. Mental Health Tracking
          - Use daily mood check-ins
          - Track anxiety and stress levels
          - Monitor sleep patterns
          
          2. Physical Health Monitoring
          - Log vital signs when available
          - Track symptoms and side effects
          - Record exercise and activity
          
          3. Setting Goals
          - Create personalized health goals
          - Track progress over time
          - Celebrate achievements
          
          4. Using AI Insights
          - Get personalized health tips
          - Receive early warning alerts
          - Access educational content
          
          5. Sharing with Providers
          - Export health reports
          - Discuss trends during visits
          - Collaborate on care plans
        `
      }
    };
    
    return guides[guideType as keyof typeof guides] || { title: "Guide", content: "Guide content not available." };
  };

  return (
    <>
      <Helmet>
        <title>Help Center | {APP_NAME}</title>
        <meta name="description" content="Find answers to common questions, tutorials, and support resources for the IHEP platform." />
      </Helmet>

      <section className="container mx-auto px-4 py-6 mt-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-primary mb-2">Help Center</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Find answers to common questions and learn how to get the most out of the IHEP platform.</p>
        </div>

        <div className="relative mb-8">
          <form className="max-w-2xl mx-auto" onSubmit={handleSearch}>
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search for help topics..." 
                className="h-12 pl-12 pr-4 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
              <Button type="submit" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                Search
              </Button>
            </div>
          </form>
        </div>

        <Tabs defaultValue="faq" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
            <TabsTrigger value="tutorials">How-To Guides</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about using the IHEP platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {filteredFaqs.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No FAQs found matching your search.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setFilteredFaqs(faqs);
                      }}
                      className="mt-2"
                    >
                      Clear Search
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tutorials">
            <Card>
              <CardHeader>
                <CardTitle>How-To Guides</CardTitle>
                <CardDescription>
                  Step-by-step tutorials to help you navigate the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-center justify-center text-left border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleGuideClick("getting-started")}
                  >
                    <h3 className="font-semibold text-lg mb-3 w-full text-center">Getting Started Guide</h3>
                    <p className="text-gray-600 text-sm">Learn the basics of navigating the platform, setting up your profile, and accessing key features.</p>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-center justify-center text-left border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleGuideClick("scheduling")}
                  >
                    <h3 className="font-semibold text-lg mb-3 w-full text-center">Scheduling Appointments</h3>
                    <p className="text-gray-600 text-sm">A complete walkthrough of scheduling, managing, and attending your healthcare appointments.</p>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-center justify-center text-left border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleGuideClick("resources")}
                  >
                    <h3 className="font-semibold text-lg mb-3 w-full text-center">Finding Resources</h3>
                    <p className="text-gray-600 text-sm">How to find and filter healthcare resources, support groups, and community services.</p>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-center justify-center text-left border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleGuideClick("virtual")}
                  >
                    <h3 className="font-semibold text-lg mb-3 w-full text-center">Virtual Appointments</h3>
                    <p className="text-gray-600 text-sm">Everything you need to know about setting up and joining virtual healthcare visits.</p>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-center justify-center text-left border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleGuideClick("medications")}
                  >
                    <h3 className="font-semibold text-lg mb-3 w-full text-center">Managing Medications</h3>
                    <p className="text-gray-600 text-sm">How to track, refill, and manage your medications through the platform.</p>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-center justify-center text-left border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleGuideClick("wellness")}
                  >
                    <h3 className="font-semibold text-lg mb-3 w-full text-center">Health Tracking</h3>
                    <p className="text-gray-600 text-sm">Using the risk assessment tools and health monitoring features to manage your wellbeing.</p>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Reach out to our support team if you need further assistance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSupportSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Name</label>
                      <Input 
                        id="name" 
                        placeholder="Your name"
                        value={supportForm.name}
                        onChange={(e) => setSupportForm({...supportForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Your email address"
                        value={supportForm.email}
                        onChange={(e) => setSupportForm({...supportForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input 
                      id="subject" 
                      placeholder="What is your question about?"
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea 
                      id="message" 
                      className="min-h-[120px]"
                      placeholder="Please describe your issue or question in detail"
                      value={supportForm.message}
                      onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto"
                    disabled={submitSupport.isPending}
                  >
                    {submitSupport.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
                
                <div className="mt-8 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <h3 className="font-medium mb-2">Phone Support</h3>
                    <p className="text-gray-600 text-sm">(555) 123-4567</p>
                    <p className="text-gray-500 text-xs mt-1">Mon-Fri: 9AM-5PM EST</p>
                  </div>
                  
                  <div className="text-center p-4">
                    <h3 className="font-medium mb-2">Email Support</h3>
                    <p className="text-gray-600 text-sm">support@ihep.app</p>
                    <p className="text-gray-500 text-xs mt-1">24/7 response within 24 hours</p>
                  </div>
                  
                  <div className="text-center p-4">
                    <h3 className="font-medium mb-2">Live Chat</h3>
                    <p className="text-gray-600 text-sm">Available on desktop</p>
                    <p className="text-gray-500 text-xs mt-1">Mon-Fri: 9AM-8PM EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Guide Dialog */}
        <Dialog open={isGuideDialogOpen} onOpenChange={setIsGuideDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{getGuideContent(selectedGuide).title}</DialogTitle>
              <DialogDescription>
                Complete step-by-step guide
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {getGuideContent(selectedGuide).content}
              </pre>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsGuideDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </>
  );
};

export default Help;