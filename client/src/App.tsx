import { Switch, Route, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/Toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Resources from "@/pages/Resources";
import Events from "@/pages/Events";
import NewEvent from "@/pages/NewEvent";
import Community from "@/pages/Community";
import Education from "@/pages/Education";
import Profile from "@/pages/Profile";
import Appointments from "@/pages/Appointments";
import NewAppointment from "@/pages/NewAppointment";
import Provider from "@/pages/Provider";
import Help from "@/pages/Help";
import Contact from "@/pages/Contact";
import About from "@/pages/About";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import MedicationRefill from "@/pages/MedicationRefill";
import RiskAssessment from "@/pages/RiskAssessment";
import Messages from "@/pages/Messages";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import TwilioSettings from "@/pages/TwilioSettings";
import SimpleTwilioForm from "@/pages/SimpleTwilioForm";
import TwilioConfig from "@/pages/TwilioConfig";
import PhoneVerification from "@/pages/PhoneVerification";
import AuditLogs from "@/pages/AuditLogs";
import StateCompliance from "@/pages/StateCompliance";
import NeuralGovernance from "@/pages/NeuralGovernance";
import ComplianceDashboard from "@/pages/ComplianceDashboard";
import Rewards from "@/pages/Rewards";
import Telehealth from "@/pages/Telehealth";
import MedicationAdherence from "@/pages/MedicationAdherence";
import HealthAIAssistant from "@/pages/HealthAIAssistant";
// Forum pages
import Forum from "@/pages/Forum";
import ForumCategory from "@/pages/ForumCategory";
import ForumPost from "@/pages/ForumPost";
import NewForumPost from "@/pages/NewForumPost";
import { AuthProvider } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/resources" component={Resources} />
      <Route path="/events" component={Events} />
      <Route path="/events/new" component={NewEvent} />
      <Route path="/community" component={Community} />
      <Route path="/education" component={Education} />
      <Route path="/profile" component={Profile} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/appointments/new" component={NewAppointment} />
      <Route path="/provider" component={Provider} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/help" component={Help} />
      <Route path="/contact" component={Contact} />
      <Route path="/about" component={About} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/medication-refill" component={MedicationRefill} />
      <Route path="/risk-assessment" component={RiskAssessment} />
      <Route path="/messages" component={Messages} />
      
      {/* Settings routes */}
      <Route path="/settings/twilio" component={TwilioSettings} />
      <Route path="/settings/sms" component={SimpleTwilioForm} />
      <Route path="/twilio" component={TwilioConfig} />
      <Route path="/verify-phone" component={PhoneVerification} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/telehealth" component={Telehealth} />
      <Route path="/medication-adherence" component={MedicationAdherence} />
      <Route path="/health-ai" component={HealthAIAssistant} />
      
      {/* Admin routes */}
      <Route path="/admin/audit-logs" component={AuditLogs} />
      <Route path="/admin/state-compliance" component={StateCompliance} />
      <Route path="/admin/neural-governance" component={NeuralGovernance} />
      <Route path="/admin/compliance-dashboard" component={ComplianceDashboard} />
      
      {/* Forum routes */}
      <Route path="/forum" component={Forum} />
      <Route path="/forum/category/:slug" component={ForumCategory} />
      <Route path="/forum/post/:id" component={ForumPost} />
      <Route path="/forum/new" component={NewForumPost} />
      <Route path="/forum/search" component={Forum} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <MainLayout>
            <AppRoutes />
          </MainLayout>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
