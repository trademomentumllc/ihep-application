import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhoneCall, Mail, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us | {APP_NAME}</title>
        <meta name="description" content="Get in touch with the Health Insight Ventures team for support, feedback, or information about our services." />
      </Helmet>

      <section className="container mx-auto px-4 py-6 mt-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-primary mb-2">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">We're here to help. Reach out to our team with any questions, concerns, or feedback.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <PhoneCall className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Call Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">(917) 566-8112</p>
              <p className="text-sm text-gray-500">24/7 Support Available</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Email Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">support@healthinsightventures.com</p>
              <p className="text-gray-600 text-sm">app.support@ihep.app</p>
              <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">App Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">Digital Health Platform</p>
              <p className="text-sm text-gray-500">Available 24/7 through our mobile app</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div>
            <h2 className="text-2xl font-montserrat font-bold text-primary mb-4">Send a Message</h2>
            <p className="text-gray-600 mb-6">
              Fill out the form below, and a member of our team will get back to you as soon as possible.
            </p>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                  <Input id="name" placeholder="Enter your full name" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <Input id="subject" placeholder="What is your message about?" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <textarea 
                  id="message" 
                  className="min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="How can we help you?"
                />
              </div>
              
              <Button type="submit" className="w-full md:w-auto">Send Message</Button>
            </form>
          </div>
          
          <div>
            <h2 className="text-2xl font-montserrat font-bold text-primary mb-4">Office Hours</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Monday - Friday</h3>
                      <p className="text-gray-600">8:00 AM - 6:00 PM PT</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Saturday</h3>
                      <p className="text-gray-600">9:00 AM - 3:00 PM PT</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Sunday</h3>
                      <p className="text-gray-600">Closed</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 mt-6 pt-6">
                  <h3 className="font-medium mb-3">24/7 Support Hotline</h3>
                  <p className="text-gray-600 mb-1">(917) 566-8112</p>
                  <p className="text-sm text-gray-500">For urgent medical questions and support needs</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <h2 className="text-2xl font-montserrat font-bold text-primary mb-4">Digital Health Platform</h2>
              <Card className="bg-gray-50">
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4">
                    Health Insight Ventures is a 100% digital platform focused on providing personalized health 
                    resources and support for patients across the globe.
                  </p>
                  <p className="text-gray-600">
                    Our virtual services are available 24/7 through our mobile and web applications, 
                    giving you access to resources and support whenever you need them, wherever you are.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;