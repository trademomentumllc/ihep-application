import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, Users, Brain, Clock, Award } from "lucide-react";

const APP_NAME = "Health Insight Ventures";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us | {APP_NAME}</title>
        <meta name="description" content="Learn about Health Insight Ventures - a comprehensive digital health platform specifically designed to support HIV patients through personalized care, community resources, and holistic wellness tools." />
      </Helmet>

      <section className="container mx-auto px-4 py-6 mt-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-montserrat font-bold text-primary mb-4">
            About Health Insight Ventures
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A comprehensive digital health platform specifically designed to support HIV patients through 
            personalized care, community resources, and holistic wellness tools.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-8 border-primary/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Heart className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-primary">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-center text-gray-700 leading-relaxed">
              To empower HIV patients with comprehensive digital health tools that promote engagement, 
              wellness, and quality of life through personalized care coordination, community support, 
              and evidence-based health management resources.
            </p>
          </CardContent>
        </Card>

        {/* Core Values */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-primary/10 hover:border-primary/30 transition-colors">
            <CardHeader className="text-center">
              <Shield className="h-10 w-10 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">HIPAA Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Built with comprehensive HIPAA compliance, audit logging, and regulatory frameworks 
                to protect patient data and ensure healthcare privacy.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 hover:border-primary/30 transition-colors">
            <CardHeader className="text-center">
              <Users className="h-10 w-10 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Patient-Centric Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Every feature is designed with adaptive support mechanisms and personalized care 
                coordination to meet individual patient needs.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 hover:border-primary/30 transition-colors">
            <CardHeader className="text-center">
              <Brain className="h-10 w-10 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">AI-Powered Care</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Advanced AI-powered health assistance provides personalized wellness tips, 
                healthcare guidance, and intelligent content moderation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary text-center mb-4">
              Comprehensive Healthcare Platform
            </CardTitle>
            <CardDescription className="text-center text-lg">
              Built with modern web technologies and focused on patient engagement and regulatory compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Appointment Scheduling</h3>
                <p className="text-sm text-gray-600">
                  Streamlined booking and management of healthcare appointments with automated reminders
                </p>
              </div>
              
              <div className="text-center p-4">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Community Support</h3>
                <p className="text-sm text-gray-600">
                  Forum system with AI moderation connecting patients with support groups and discussions
                </p>
              </div>
              
              <div className="text-center p-4">
                <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Telehealth Services</h3>
                <p className="text-sm text-gray-600">
                  Twilio Video integration for virtual appointments and remote healthcare consultations
                </p>
              </div>
              
              <div className="text-center p-4">
                <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Gamification</h3>
                <p className="text-sm text-gray-600">
                  Health activity tracking with points, achievements, and rewards to promote engagement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary text-center">
              Enterprise-Grade Technology
            </CardTitle>
            <CardDescription className="text-center">
              Built on modern, scalable infrastructure with comprehensive security and monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4 text-primary">Current Platform (Replit)</h3>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">React with TypeScript</Badge>
                    <Badge variant="secondary">Express.js Server</Badge>
                    <Badge variant="secondary">PostgreSQL Database</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Drizzle ORM</Badge>
                    <Badge variant="outline">Passport.js Auth</Badge>
                    <Badge variant="outline">Tailwind CSS</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-4 text-primary">Production Architecture (GCP)</h3>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Multi-zone Load Balancing</Badge>
                    <Badge variant="secondary">Auto-scaling Infrastructure</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">6-layer Load Balancers</Badge>
                    <Badge variant="outline">Regional DB Cluster</Badge>
                    <Badge variant="outline">Terraform Managed</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Healthcare Focus */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-primary text-center">
              Specialized HIV Patient Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="font-semibold mb-3 text-primary">Resource Management</h3>
                <p className="text-gray-600">
                  Geographically-targeted healthcare resource recommendations with real HIV specialists, 
                  testing centers, mental health counselors, and support groups.
                </p>
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold mb-3 text-primary">Medication Adherence</h3>
                <p className="text-gray-600">
                  Comprehensive medication tracking with automated reminders, refill management, 
                  and adherence monitoring to support treatment success.
                </p>
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold mb-3 text-primary">Holistic Wellness</h3>
                <p className="text-gray-600">
                  AI-powered wellness tips, educational content management, and personalized 
                  health guidance tailored to HIV patient needs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="text-center mt-12 py-8 border-t">
          <h2 className="text-xl font-semibold text-primary mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-4">
            Have questions about our platform or need support? We're here to help.
          </p>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Email:</strong>{" "}
              <a 
                href="mailto:healthinsightventures@gmail.com" 
                className="text-primary hover:underline"
              >
                healthinsightventures@gmail.com
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Production Domain:</strong>{" "}
              <a 
                href="https://ihep.app" 
                className="text-primary hover:underline"
                target="_blank" 
                rel="noopener noreferrer"
              >
                ihep.app
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}