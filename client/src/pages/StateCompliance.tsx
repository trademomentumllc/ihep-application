import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { 
  AlertCircle, 
  CalendarIcon, 
  CheckCircle2, 
  ClipboardList, 
  FileText, 
  Shield, 
  SkipForward, 
  User
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface RecordRequestFormData {
  patientId: number;
  requestDate: Date;
  recordTypes: string[];
  format: 'electronic' | 'paper';
  state: string;
  contactEmail: string;
  urgent: boolean;
}

interface BreachReportFormData {
  date: Date;
  affectedRecords: number;
  description: string;
  patientDataCompromised: boolean;
  detectionMethod: string;
  initialResponseActions: string[];
}

const StateCompliance = () => {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form state for record requests
  const [recordRequest, setRecordRequest] = useState<RecordRequestFormData>({
    patientId: 0,
    requestDate: new Date(),
    recordTypes: [],
    format: 'electronic',
    state: '',
    contactEmail: '',
    urgent: false
  });
  
  // Form state for breach notifications
  const [breachReport, setBreachReport] = useState<BreachReportFormData>({
    date: new Date(),
    affectedRecords: 0,
    description: '',
    patientDataCompromised: false,
    detectionMethod: '',
    initialResponseActions: []
  });
  
  // State for breach notification status
  const [notificationStatus, setNotificationStatus] = useState({
    reportId: '',
    patientsNotified: false,
    regulatorsNotified: false,
    mediaNotified: false,
    additionalActions: ''
  });

  // Redirect if not authenticated or not admin
  if (!isAuthenticated) {
    navigate('/login?redirect=/admin/state-compliance');
    return null;
  }

  if (user?.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }
  
  // Fetch overdue record requests
  const { data: overdueRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/compliance/record-request/overdue'],
  });
  
  // Handle record request submission
  const handleRecordRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Format the record types as an array
      const formattedRecordTypes = recordRequest.recordTypes.length > 0 
        ? recordRequest.recordTypes 
        : ['Medical Records'];
      
      const response = await fetch('/api/compliance/record-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recordRequest,
          recordTypes: formattedRecordTypes,
          requestDate: recordRequest.requestDate.toISOString()
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Record Request Created",
          description: `Request ID: ${data.requestId} with due date: ${new Date(data.dueDate).toLocaleDateString()}`,
        });
        
        // Reset the form
        setRecordRequest({
          patientId: 0,
          requestDate: new Date(),
          recordTypes: [],
          format: 'electronic',
          state: '',
          contactEmail: '',
          urgent: false
        });
      } else {
        throw new Error(data.message || 'Failed to create record request');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Creating Record Request",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };
  
  // Handle breach report submission
  const handleBreachReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/compliance/breach-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...breachReport,
          date: breachReport.date.toISOString(),
          initialResponseActions: breachReport.initialResponseActions.length > 0 
            ? breachReport.initialResponseActions 
            : ['Initiated investigation']
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Breach Report Created",
          description: `Report ID: ${data.reportId} with Florida notification due by: ${new Date(data.dueDate).toLocaleDateString()}`,
        });
        
        // Set the reportId for status updates
        setNotificationStatus({
          ...notificationStatus,
          reportId: data.reportId
        });
        
        // Reset the form
        setBreachReport({
          date: new Date(),
          affectedRecords: 0,
          description: '',
          patientDataCompromised: false,
          detectionMethod: '',
          initialResponseActions: []
        });
        
        // Switch to the status tab
        setActiveTab('breachStatus');
      } else {
        throw new Error(data.message || 'Failed to create breach report');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Creating Breach Report",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };
  
  // Handle breach notification status update
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notificationStatus.reportId) {
      toast({
        variant: "destructive",
        title: "Missing Report ID",
        description: "Please enter a breach report ID to update",
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/compliance/breach-notification/${notificationStatus.reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientsNotified: notificationStatus.patientsNotified,
          regulatorsNotified: notificationStatus.regulatorsNotified,
          mediaNotified: notificationStatus.mediaNotified,
          additionalActions: notificationStatus.additionalActions 
            ? notificationStatus.additionalActions.split('\n') 
            : undefined
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Notification Status Updated",
          description: "Breach notification status has been successfully updated",
        });
      } else {
        throw new Error(data.message || 'Failed to update notification status');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Updating Status",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };
  
  // Helper function to handle record types selection
  const handleRecordTypeChange = (type: string) => {
    if (recordRequest.recordTypes.includes(type)) {
      setRecordRequest({
        ...recordRequest,
        recordTypes: recordRequest.recordTypes.filter(t => t !== type)
      });
    } else {
      setRecordRequest({
        ...recordRequest,
        recordTypes: [...recordRequest.recordTypes, type]
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>State Compliance | {APP_NAME}</title>
        <meta name="description" content="State-specific healthcare compliance for Florida and New York regulations" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary mb-6">
          State Healthcare Compliance
        </h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recordRequests">NY Record Requests</TabsTrigger>
            <TabsTrigger value="overdueRequests">Overdue Requests</TabsTrigger>
            <TabsTrigger value="breachReporting">FL Breach Reporting</TabsTrigger>
            <TabsTrigger value="breachStatus">Notification Status</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    New York Record Access (14 Days)
                  </CardTitle>
                  <CardDescription>
                    New York healthcare regulations require patient records to be provided within 14 days of request
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    NY Public Health Law §18 requires healthcare providers to make records available for inspection within 10 days
                    and to provide copies within 14 days of request. This is more stringent than HIPAA's 30-day timeline.
                  </p>
                  
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Compliance Requirement</AlertTitle>
                    <AlertDescription>
                      Any patient in New York State must receive requested records within 14 days to maintain compliance.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="font-medium text-blue-700 mb-2">Key Compliance Points</h4>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Expedited processing for NY patients</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Track all requests with due dates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Maintain compliance documentation</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setActiveTab('recordRequests')} className="w-full">
                    Process NY Record Requests
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    Florida Breach Notification (30 Days)
                  </CardTitle>
                  <CardDescription>
                    Florida law requires notification of security breaches within 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    The Florida Information Protection Act (FIPA) requires notification to affected individuals within 30 days
                    following a breach of security. This is more stringent than HIPAA's 60-day requirement.
                  </p>
                  
                  <Alert className="mb-4" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Time-Sensitive Compliance</AlertTitle>
                    <AlertDescription>
                      Florida law requires notification to affected individuals no later than 30 days after breach discovery.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-red-50 p-4 rounded-md">
                    <h4 className="font-medium text-red-700 mb-2">Required Notifications</h4>
                    <ul className="text-sm text-red-800 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Affected individuals (patients)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Florida Department of Legal Affairs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Credit reporting agencies for large breaches</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setActiveTab('breachReporting')} className="w-full" variant="destructive">
                    Create Breach Notification
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* NY Record Requests Tab */}
          <TabsContent value="recordRequests">
            <Card>
              <CardHeader>
                <CardTitle>New York Patient Record Request</CardTitle>
                <CardDescription>
                  Process patient record requests with New York's 14-day compliance timeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRecordRequestSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="patientId">Patient ID</Label>
                        <Input 
                          id="patientId"
                          type="number" 
                          placeholder="Enter patient ID"
                          value={recordRequest.patientId || ''}
                          onChange={(e) => setRecordRequest({
                            ...recordRequest, 
                            patientId: parseInt(e.target.value) || 0
                          })}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Select 
                          value={recordRequest.state} 
                          onValueChange={(value) => setRecordRequest({...recordRequest, state: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="PA">Pennsylvania</SelectItem>
                            <SelectItem value="NJ">New Jersey</SelectItem>
                            <SelectItem value="Other">Other State</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="format">Record Format</Label>
                        <Select 
                          value={recordRequest.format} 
                          onValueChange={(value: 'electronic' | 'paper') => 
                            setRecordRequest({...recordRequest, format: value})
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="electronic">Electronic (Secure Email)</SelectItem>
                            <SelectItem value="paper">Paper (Mail)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input 
                          id="contactEmail"
                          type="email"
                          placeholder="patient@example.com"
                          value={recordRequest.contactEmail}
                          onChange={(e) => setRecordRequest({
                            ...recordRequest, 
                            contactEmail: e.target.value
                          })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Request Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {recordRequest.requestDate ? format(recordRequest.requestDate, 'PPP') : 'Select date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={recordRequest.requestDate}
                              onSelect={(date) => date && setRecordRequest({...recordRequest, requestDate: date})}
                              initialFocus
                              disabled={(date) => date > new Date() || date < new Date('2023-01-01')}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <Label>Record Types Requested</Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id="type-medical"
                              checked={recordRequest.recordTypes.includes('Medical Records')}
                              onCheckedChange={() => handleRecordTypeChange('Medical Records')}
                            />
                            <Label htmlFor="type-medical" className="font-normal">Medical Records</Label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id="type-lab"
                              checked={recordRequest.recordTypes.includes('Lab Results')}
                              onCheckedChange={() => handleRecordTypeChange('Lab Results')}
                            />
                            <Label htmlFor="type-lab" className="font-normal">Lab Results</Label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id="type-images"
                              checked={recordRequest.recordTypes.includes('Imaging Records')}
                              onCheckedChange={() => handleRecordTypeChange('Imaging Records')}
                            />
                            <Label htmlFor="type-images" className="font-normal">Imaging Records</Label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id="type-billing"
                              checked={recordRequest.recordTypes.includes('Billing Records')}
                              onCheckedChange={() => handleRecordTypeChange('Billing Records')}
                            />
                            <Label htmlFor="type-billing" className="font-normal">Billing Records</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <Checkbox 
                          id="urgent"
                          checked={recordRequest.urgent}
                          onCheckedChange={(checked) => setRecordRequest({
                            ...recordRequest, 
                            urgent: checked as boolean
                          })}
                        />
                        <Label htmlFor="urgent" className="font-normal">
                          This is an urgent request (requires expedited processing)
                        </Label>
                      </div>
                      
                      {recordRequest.state === 'NY' && (
                        <div className="bg-blue-50 p-4 rounded-md mt-4">
                          <div className="flex items-start gap-2">
                            <SkipForward className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-blue-800 font-medium">New York Expedited Timeline</p>
                              <p className="text-xs text-blue-700">
                                This request will be processed under New York's 14-day requirement, 
                                which is faster than the HIPAA standard 30-day timeline.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Submit Record Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Overdue Requests Tab */}
          <TabsContent value="overdueRequests">
            <Card>
              <CardHeader>
                <CardTitle>Overdue Record Requests</CardTitle>
                <CardDescription>
                  Monitor record access requests at risk of missing compliance deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-3"></div>
                      <p>Loading overdue requests...</p>
                    </div>
                  </div>
                ) : !overdueRequests?.requests?.length ? (
                  <div className="bg-green-50 p-6 rounded-md text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-green-800 mb-1">No Overdue Requests</h3>
                    <p className="text-green-700">
                      All record requests are currently within compliance timelines.
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>State</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Days Overdue</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {overdueRequests.requests.map((request: any) => (
                          <TableRow key={request.requestId}>
                            <TableCell className="font-medium">{request.requestId}</TableCell>
                            <TableCell>Patient #{request.patientId}</TableCell>
                            <TableCell>{request.state}</TableCell>
                            <TableCell>{new Date(request.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-red-600 font-semibold">
                              {request.daysOverdue} {request.daysOverdue === 1 ? 'day' : 'days'}
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                {request.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                Update Status
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Compliance Risk Overview</h3>
                  <div className="bg-amber-50 p-4 rounded-md">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-6 w-6 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800 mb-1">State-Specific Timelines</h4>
                        <p className="text-sm text-amber-700 mb-2">
                          New York requires record access within 14 days, while HIPAA allows 30 days.
                          Overdue NY requests risk state regulatory penalties.
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="bg-white rounded p-3 border border-amber-200">
                            <p className="text-sm font-medium text-amber-800">New York</p>
                            <p className="text-xs text-amber-600">14-day maximum response time</p>
                          </div>
                          <div className="bg-white rounded p-3 border border-amber-200">
                            <p className="text-sm font-medium text-amber-800">HIPAA Standard</p>
                            <p className="text-xs text-amber-600">30-day maximum response time</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* FL Breach Reporting Tab */}
          <TabsContent value="breachReporting">
            <Card>
              <CardHeader>
                <CardTitle>Florida Breach Notification</CardTitle>
                <CardDescription>
                  Create a breach report with Florida's 30-day notification timeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Florida Information Protection Act (FIPA)</AlertTitle>
                  <AlertDescription>
                    Requires notification to affected individuals within 30 days of breach discovery,
                    which is more strict than HIPAA's 60-day requirement.
                  </AlertDescription>
                </Alert>
                
                <form onSubmit={handleBreachReportSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Breach Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {breachReport.date ? format(breachReport.date, 'PPP') : 'Select date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={breachReport.date}
                              onSelect={(date) => date && setBreachReport({...breachReport, date})}
                              initialFocus
                              disabled={(date) => date > new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <Label htmlFor="affectedRecords">Number of Affected Records</Label>
                        <Input 
                          id="affectedRecords"
                          type="number" 
                          min="1"
                          placeholder="Enter number of affected records"
                          value={breachReport.affectedRecords || ''}
                          onChange={(e) => setBreachReport({
                            ...breachReport, 
                            affectedRecords: parseInt(e.target.value) || 0
                          })}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="detectionMethod">How Was the Breach Detected?</Label>
                        <Input 
                          id="detectionMethod"
                          placeholder="e.g., System alert, staff report, audit log"
                          value={breachReport.detectionMethod}
                          onChange={(e) => setBreachReport({
                            ...breachReport, 
                            detectionMethod: e.target.value
                          })}
                          required
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <Checkbox 
                          id="patientDataCompromised"
                          checked={breachReport.patientDataCompromised}
                          onCheckedChange={(checked) => setBreachReport({
                            ...breachReport, 
                            patientDataCompromised: checked as boolean
                          })}
                        />
                        <Label htmlFor="patientDataCompromised" className="font-normal">
                          Protected Health Information (PHI) was compromised
                        </Label>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="description">Breach Description</Label>
                        <Textarea 
                          id="description"
                          placeholder="Describe what happened, what data was affected, and current status"
                          value={breachReport.description}
                          onChange={(e) => setBreachReport({
                            ...breachReport, 
                            description: e.target.value
                          })}
                          className="min-h-[120px]"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="initialResponseActions">Initial Response Actions</Label>
                        <Textarea 
                          id="initialResponseActions"
                          placeholder="List actions taken so far (one per line)"
                          value={breachReport.initialResponseActions.join('\n')}
                          onChange={(e) => setBreachReport({
                            ...breachReport, 
                            initialResponseActions: e.target.value.split('\n').filter(line => line.trim())
                          })}
                          className="min-h-[120px]"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter each action on a new line
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-md">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-1">Florida 30-Day Notification Requirement</h4>
                        <p className="text-sm text-red-700">
                          Creating this report will initiate the Florida compliance timeline.
                          You must notify affected individuals within 30 days of breach discovery.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" variant="destructive">
                    Create Breach Report
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Breach Status Tab */}
          <TabsContent value="breachStatus">
            <Card>
              <CardHeader>
                <CardTitle>Update Breach Notification Status</CardTitle>
                <CardDescription>
                  Track notification status for Florida's 30-day compliance requirement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStatusUpdate} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reportId">Breach Report ID</Label>
                      <Input 
                        id="reportId"
                        placeholder="Enter breach report ID"
                        value={notificationStatus.reportId}
                        onChange={(e) => setNotificationStatus({
                          ...notificationStatus, 
                          reportId: e.target.value
                        })}
                        required
                      />
                    </div>
                    
                    <div className="border p-4 rounded-md bg-gray-50">
                      <h3 className="text-md font-medium mb-3">Required Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            id="patientsNotified"
                            checked={notificationStatus.patientsNotified}
                            onCheckedChange={(checked) => setNotificationStatus({
                              ...notificationStatus, 
                              patientsNotified: checked as boolean
                            })}
                          />
                          <div>
                            <Label htmlFor="patientsNotified" className="font-medium">
                              Affected Individuals Notified
                            </Label>
                            <p className="text-xs text-gray-500">
                              All affected individuals have been notified of the breach
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            id="regulatorsNotified"
                            checked={notificationStatus.regulatorsNotified}
                            onCheckedChange={(checked) => setNotificationStatus({
                              ...notificationStatus, 
                              regulatorsNotified: checked as boolean
                            })}
                          />
                          <div>
                            <Label htmlFor="regulatorsNotified" className="font-medium">
                              Florida Department of Legal Affairs Notified
                            </Label>
                            <p className="text-xs text-gray-500">
                              Florida regulators have been notified as required by FIPA
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            id="mediaNotified"
                            checked={notificationStatus.mediaNotified}
                            onCheckedChange={(checked) => setNotificationStatus({
                              ...notificationStatus, 
                              mediaNotified: checked as boolean
                            })}
                          />
                          <div>
                            <Label htmlFor="mediaNotified" className="font-medium">
                              Media/Credit Agencies Notified (if applicable)
                            </Label>
                            <p className="text-xs text-gray-500">
                              For breaches affecting 500+ individuals, media and credit agencies notified
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="additionalActions">Additional Actions Taken</Label>
                      <Textarea 
                        id="additionalActions"
                        placeholder="Describe additional actions taken since initial report"
                        value={notificationStatus.additionalActions}
                        onChange={(e) => setNotificationStatus({
                          ...notificationStatus, 
                          additionalActions: e.target.value
                        })}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-md">
                    <div className="flex items-start gap-3">
                      <ClipboardList className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800 mb-1">Compliance Documentation</h4>
                        <p className="text-sm text-amber-700">
                          Update each notification as it's completed. All notifications should be 
                          completed within 30 days of breach discovery to comply with Florida law.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Update Notification Status
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default StateCompliance;