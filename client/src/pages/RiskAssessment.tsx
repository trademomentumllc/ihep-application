import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Activity, 
  Heart, 
  Clipboard, 
  BarChart3, 
  Calendar, 
  AlertTriangle, 
  Info, 
  Filter,
  ChevronDown,
  MoreHorizontal,
  Printer 
} from "lucide-react";

// Define risk color classes
const getRiskColorClass = (risk: number) => {
  if (risk < 30) return "bg-green-500";
  if (risk < 60) return "bg-yellow-500";
  if (risk < 80) return "bg-orange-500";
  return "bg-red-500";
};

const getRiskTextClass = (risk: number) => {
  if (risk < 30) return "text-green-700";
  if (risk < 60) return "text-yellow-700";
  if (risk < 80) return "text-orange-700";
  return "text-red-700";
};

const getRiskLabel = (risk: number) => {
  if (risk < 30) return "Low Risk";
  if (risk < 60) return "Moderate Risk";
  if (risk < 80) return "High Risk";
  return "Critical Risk";
};

// Mock health data - in a real app, this would come from the backend
const mockHealthData = {
  bloodPressure: {
    current: { systolic: 132, diastolic: 82 },
    previous: { systolic: 140, diastolic: 90 },
    risk: 45,
    trend: "improving"
  },
  bloodGlucose: {
    current: 110,
    previous: 130,
    risk: 30,
    trend: "improving"
  },
  cholesterol: {
    current: { total: 210, hdl: 45, ldl: 140 },
    previous: { total: 230, hdl: 40, ldl: 150 },
    risk: 65,
    trend: "improving"
  },
  heartRate: {
    current: 78,
    previous: 82,
    risk: 20,
    trend: "stable"
  },
  bmi: {
    current: 27.5,
    previous: 28.2,
    risk: 50,
    trend: "improving"
  },
  medications: [
    { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", adherence: 95 },
    { name: "Metformin", dosage: "500mg", frequency: "Twice daily", adherence: 88 },
    { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", adherence: 92 }
  ],
  upcomingAppointments: [
    { 
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      provider: "Dr. Sarah Johnson", 
      type: "Follow-up" 
    }
  ],
  recentTests: [
    { 
      name: "Comprehensive Metabolic Panel", 
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      abnormal: true
    },
    { 
      name: "Lipid Panel", 
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      abnormal: true
    },
    { 
      name: "HbA1c", 
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      abnormal: false
    }
  ]
};

// Calculate overall risk score based on individual metrics
const calculateOverallRisk = (healthData: any) => {
  const metrics = [
    healthData.bloodPressure.risk,
    healthData.bloodGlucose.risk,
    healthData.cholesterol.risk,
    healthData.heartRate.risk,
    healthData.bmi.risk
  ];
  
  return Math.round(metrics.reduce((acc, val) => acc + val, 0) / metrics.length);
};

const RiskAssessment = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [healthData, setHealthData] = useState(mockHealthData);
  const [timeframe, setTimeframe] = useState("6m"); // 1m, 3m, 6m, 1y

  // Calculate the overall risk score
  const overallRisk = calculateOverallRisk(healthData);

  const handleUpdateData = () => {
    // In a real app, this would fetch the latest data from the server
    toast({
      title: "Assessment Updated",
      description: "Your health risk assessment has been updated with the latest data.",
    });
  };

  const handlePrintReport = () => {
    toast({
      title: "Preparing Report",
      description: "Your health assessment report is being prepared for printing.",
    });
    // In a real app, this would generate a PDF or print view
    window.print();
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <>
      <Helmet>
        <title>Health Risk Assessment | {APP_NAME}</title>
        <meta name="description" content="Monitor your health risks with a personalized, color-coded dashboard showing vital metrics and trends." />
      </Helmet>

      <section className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-primary">Health Risk Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor your health metrics and risk factors</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Filter className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">
                    {timeframe === "1m" ? "1 Month" : 
                     timeframe === "3m" ? "3 Months" : 
                     timeframe === "6m" ? "6 Months" : "1 Year"}
                  </span>
                  <span className="sm:hidden">
                    {timeframe === "1m" ? "1M" : 
                     timeframe === "3m" ? "3M" : 
                     timeframe === "6m" ? "6M" : "1Y"}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTimeframe("1m")}>1 Month</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeframe("3m")}>3 Months</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeframe("6m")}>6 Months</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeframe("1y")}>1 Year</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={handleUpdateData}>
              <span className="sm:hidden">Update</span>
              <span className="hidden sm:inline">Update Data</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrintReport}>
              <Printer className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </div>
        </div>

        {/* Main Risk Score Card - Full Width */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Overall Health Risk</CardTitle>
            <CardDescription>
              Comprehensive assessment based on your vital metrics and health factors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-col sm:flex-row items-center mb-6 md:mb-0 w-full md:w-auto">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl ${getRiskColorClass(overallRisk)}`}>
                  {overallRisk}%
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
                  <h3 className={`font-bold text-xl ${getRiskTextClass(overallRisk)}`}>
                    {getRiskLabel(overallRisk)}
                  </h3>
                  <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="w-full md:w-3/5 bg-gray-100 p-4 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Blood Pressure</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${getRiskTextClass(healthData.bloodPressure.risk)}`}>
                        {healthData.bloodPressure.current.systolic}/{healthData.bloodPressure.current.diastolic}
                      </span>
                      <span className="text-xs font-semibold text-gray-600">
                        {healthData.bloodPressure.risk}%
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div 
                        style={{ width: `${healthData.bloodPressure.risk}%` }} 
                        className={`h-full rounded ${getRiskColorClass(healthData.bloodPressure.risk)}`}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Blood Glucose</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${getRiskTextClass(healthData.bloodGlucose.risk)}`}>
                        {healthData.bloodGlucose.current} mg/dL
                      </span>
                      <span className="text-xs font-semibold text-gray-600">
                        {healthData.bloodGlucose.risk}%
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div 
                        style={{ width: `${healthData.bloodGlucose.risk}%` }} 
                        className={`h-full rounded ${getRiskColorClass(healthData.bloodGlucose.risk)}`}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Cholesterol</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${getRiskTextClass(healthData.cholesterol.risk)}`}>
                        {healthData.cholesterol.current.total} mg/dL
                      </span>
                      <span className="text-xs font-semibold text-gray-600">
                        {healthData.cholesterol.risk}%
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div 
                        style={{ width: `${healthData.cholesterol.risk}%` }} 
                        className={`h-full rounded ${getRiskColorClass(healthData.cholesterol.risk)}`}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">BMI</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${getRiskTextClass(healthData.bmi.risk)}`}>
                        {healthData.bmi.current}
                      </span>
                      <span className="text-xs font-semibold text-gray-600">
                        {healthData.bmi.risk}%
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div 
                        style={{ width: `${healthData.bmi.risk}%` }} 
                        className={`h-full rounded ${getRiskColorClass(healthData.bmi.risk)}`}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600 flex items-center">
                  <Info className="h-4 w-4 mr-1 text-blue-500" />
                  Your overall risk is based on your medical history, current metrics, and risk factors.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Blood Pressure Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Blood Pressure
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View History</DropdownMenuItem>
                    <DropdownMenuItem>Set Goals</DropdownMenuItem>
                    <DropdownMenuItem>See Recommendations</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>
                Current: {healthData.bloodPressure.current.systolic}/{healthData.bloodPressure.current.diastolic} mmHg
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Risk Level:</span>
                  <span className={`font-medium ${getRiskTextClass(healthData.bloodPressure.risk)}`}>
                    {getRiskLabel(healthData.bloodPressure.risk)}
                  </span>
                </div>
                <Progress
                  value={healthData.bloodPressure.risk}
                  className={`h-2 ${getRiskColorClass(healthData.bloodPressure.risk)}`}
                />
                
                <div className="flex justify-between text-sm mt-4">
                  <span className="text-gray-600">Previous Reading:</span>
                  <span className="font-medium">{healthData.bloodPressure.previous.systolic}/{healthData.bloodPressure.previous.diastolic} mmHg</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trend:</span>
                  <span className="font-medium text-green-600 capitalize">
                    {healthData.bloodPressure.trend}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" className="text-primary p-0 h-auto text-sm">
                View Details
              </Button>
            </CardFooter>
          </Card>

          {/* Blood Glucose Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  Blood Glucose
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View History</DropdownMenuItem>
                    <DropdownMenuItem>Set Goals</DropdownMenuItem>
                    <DropdownMenuItem>See Recommendations</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>
                Current: {healthData.bloodGlucose.current} mg/dL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Risk Level:</span>
                  <span className={`font-medium ${getRiskTextClass(healthData.bloodGlucose.risk)}`}>
                    {getRiskLabel(healthData.bloodGlucose.risk)}
                  </span>
                </div>
                <Progress
                  value={healthData.bloodGlucose.risk}
                  className={`h-2 ${getRiskColorClass(healthData.bloodGlucose.risk)}`}
                />
                
                <div className="flex justify-between text-sm mt-4">
                  <span className="text-gray-600">Previous Reading:</span>
                  <span className="font-medium">{healthData.bloodGlucose.previous} mg/dL</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trend:</span>
                  <span className="font-medium text-green-600 capitalize">
                    {healthData.bloodGlucose.trend}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" className="text-primary p-0 h-auto text-sm">
                View Details
              </Button>
            </CardFooter>
          </Card>

          {/* Cholesterol Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                  Cholesterol
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View History</DropdownMenuItem>
                    <DropdownMenuItem>Set Goals</DropdownMenuItem>
                    <DropdownMenuItem>See Recommendations</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>
                Total: {healthData.cholesterol.current.total} mg/dL (HDL: {healthData.cholesterol.current.hdl}, LDL: {healthData.cholesterol.current.ldl})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Risk Level:</span>
                  <span className={`font-medium ${getRiskTextClass(healthData.cholesterol.risk)}`}>
                    {getRiskLabel(healthData.cholesterol.risk)}
                  </span>
                </div>
                <Progress
                  value={healthData.cholesterol.risk}
                  className={`h-2 ${getRiskColorClass(healthData.cholesterol.risk)}`}
                />
                
                <div className="flex justify-between text-sm mt-4">
                  <span className="text-gray-600">Previous Reading:</span>
                  <span className="font-medium">
                    Total: {healthData.cholesterol.previous.total} mg/dL
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trend:</span>
                  <span className="font-medium text-green-600 capitalize">
                    {healthData.cholesterol.trend}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" className="text-primary p-0 h-auto text-sm">
                View Details
              </Button>
            </CardFooter>
          </Card>

          {/* BMI Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-orange-500" />
                  Body Mass Index (BMI)
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View History</DropdownMenuItem>
                    <DropdownMenuItem>Set Goals</DropdownMenuItem>
                    <DropdownMenuItem>See Recommendations</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>
                Current: {healthData.bmi.current}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Risk Level:</span>
                  <span className={`font-medium ${getRiskTextClass(healthData.bmi.risk)}`}>
                    {getRiskLabel(healthData.bmi.risk)}
                  </span>
                </div>
                <Progress
                  value={healthData.bmi.risk}
                  className={`h-2 ${getRiskColorClass(healthData.bmi.risk)}`}
                />
                
                <div className="flex justify-between text-sm mt-4">
                  <span className="text-gray-600">Previous Reading:</span>
                  <span className="font-medium">{healthData.bmi.previous}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trend:</span>
                  <span className="font-medium text-green-600 capitalize">
                    {healthData.bmi.trend}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" className="text-primary p-0 h-auto text-sm">
                View Details
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Additional Health Information */}
        <Tabs defaultValue="medications" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="medications" className="text-sm">
              <Clipboard className="h-4 w-4 mr-1" />
              Medications
            </TabsTrigger>
            <TabsTrigger value="appointments" className="text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="tests" className="text-sm">
              <Clipboard className="h-4 w-4 mr-1" />
              Recent Tests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medication Adherence</CardTitle>
                <CardDescription>
                  Track your medication schedule and adherence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthData.medications.map((med, index) => (
                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Adherence</p>
                          <p className={`text-sm ${med.adherence > 90 ? 'text-green-600' : med.adherence > 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {med.adherence}%
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            med.adherence > 90 ? 'bg-green-500' : 
                            med.adherence > 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${med.adherence}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  Medication History
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                <CardDescription>
                  Your scheduled appointments with healthcare providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {healthData.upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {healthData.upcomingAppointments.map((appt, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{appt.provider}</p>
                          <p className="text-sm text-gray-600">{appt.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatDate(appt.date)}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(appt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No upcoming appointments</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  Schedule Appointment
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Tests & Results</CardTitle>
                <CardDescription>
                  Your laboratory and diagnostic test results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthData.recentTests.map((test, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{test.name}</p>
                          {test.abnormal && (
                            <AlertTriangle className="h-4 w-4 ml-2 text-amber-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(test.date)}</p>
                      </div>
                      <Button variant="link" size="sm" className="text-primary">
                        View Results
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  All Test Results
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Risk Assessment Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recommended Actions</CardTitle>
            <CardDescription>
              Based on your current health assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className={`p-1 rounded-full ${getRiskColorClass(healthData.cholesterol.risk)} text-white mr-3`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Lower your cholesterol levels</p>
                  <p className="text-sm text-gray-600">
                    Your LDL cholesterol is above the recommended range. Consider discussing medication adjustments with your doctor.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`p-1 rounded-full ${getRiskColorClass(healthData.bloodPressure.risk)} text-white mr-3`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Continue monitoring blood pressure</p>
                  <p className="text-sm text-gray-600">
                    Your blood pressure is improving but still in the moderate risk range. Continue taking your medications as prescribed.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`p-1 rounded-full ${getRiskColorClass(healthData.bmi.risk)} text-white mr-3`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Weight management</p>
                  <p className="text-sm text-gray-600">
                    Your BMI indicates you're overweight. Continue your current weight loss efforts as they're showing progress.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Get Personalized Health Plan</Button>
          </CardFooter>
        </Card>
      </section>
    </>
  );
};

export default RiskAssessment;