import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { format, formatDistanceToNow, addDays } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { 
  Pill,
  Clock,
  CalendarCheck,
  Check,
  Plus,
  Edit,
  Trash,
  Bell,
  X,
  BellRing,
  Award,
  AlertTriangle,
  BadgeCheck,
  Calendar,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient } from '@/lib/queryClient';

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  instructions: string;
  startDate: string;
  endDate?: string;
  refillReminder: boolean;
  refillDate?: string;
  refillsRemaining?: number;
  createdAt: string;
}

interface MedicationLog {
  id: number;
  medicationId: number;
  userId: number;
  takenAt: string;
  scheduled: string;
  status: 'taken' | 'missed' | 'skipped';
  notes?: string;
  pointsEarned?: number;
  createdAt: string;
}

interface AdherenceStats {
  totalMedications: number;
  adherenceRate: number;
  currentStreak: number;
  longestStreak: number;
  totalPointsEarned: number;
  missedDoses: number;
  upcomingRefills: number;
}

const MedicationAdherence = () => {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSMSReminderEnabled, setIsSMSReminderEnabled] = useState(true);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [isConfirmLogOpen, setIsConfirmLogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // New medication form state
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    timeOfDay: ['morning'],
    instructions: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    refillReminder: true,
    refillDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    refillsRemaining: 3
  });
  
  // Medication log form state
  const [medicationLog, setMedicationLog] = useState({
    medicationId: 0,
    takenAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    status: 'taken' as 'taken' | 'missed' | 'skipped',
    notes: ''
  });
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login?redirect=/medication-adherence');
    return null;
  }
  
  // Fetch user's medications
  const { 
    data: medications,
    isLoading: medicationsLoading 
  } = useQuery({
    queryKey: ['/api/medications'],
    enabled: isAuthenticated,
  });
  
  // Fetch medication logs
  const { 
    data: medicationLogs,
    isLoading: logsLoading 
  } = useQuery({
    queryKey: ['/api/medications/logs'],
    enabled: isAuthenticated,
  });
  
  // Fetch adherence stats
  const { 
    data: adherenceStats,
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['/api/medications/stats'],
    enabled: isAuthenticated,
  });
  
  // Fetch user profile to get phone number
  const { 
    data: userProfile,
    isLoading: profileLoading 
  } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: isAuthenticated,
    onSuccess: (data) => {
      if (data && data.phoneNumber) {
        setPhoneNumber(data.phoneNumber);
      }
    }
  });
  
  // Add medication mutation
  const addMedication = useMutation({
    mutationFn: (data: any) => {
      return apiRequest('/api/medications', {
        method: 'POST',
        data
      });
    },
    onSuccess: () => {
      toast({
        title: "Medication Added",
        description: "Your medication has been added successfully.",
      });
      setIsAddMedicationOpen(false);
      setNewMedication({
        name: '',
        dosage: '',
        frequency: 'daily',
        timeOfDay: ['morning'],
        instructions: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: '',
        refillReminder: true,
        refillDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        refillsRemaining: 3
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Adding Medication",
        description: error.message || "Failed to add medication.",
      });
    }
  });
  
  // Log medication mutation
  const logMedication = useMutation({
    mutationFn: (data: any) => {
      return apiRequest('/api/medications/log', {
        method: 'POST',
        data
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Medication Logged",
        description: data.pointsEarned 
          ? `You've earned ${data.pointsEarned} points for tracking your medication!` 
          : "Your medication has been logged successfully.",
      });
      setIsConfirmLogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/medications/logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/medications/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/user/points'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Logging Medication",
        description: error.message || "Failed to log medication.",
      });
    }
  });
  
  // Set up SMS reminder mutation
  const setupSMSReminder = useMutation({
    mutationFn: (data: { phoneNumber: string; enabled: boolean }) => {
      return apiRequest('/api/twilio-healthcare/engage/setup-reminders', {
        method: 'POST',
        data
      });
    },
    onSuccess: () => {
      toast({
        title: "Reminders Updated",
        description: isSMSReminderEnabled 
          ? "SMS medication reminders have been enabled." 
          : "SMS medication reminders have been disabled.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Updating Reminders",
        description: error.message || "Failed to update reminder settings.",
      });
      // Revert the UI switch if the API call fails
      setIsSMSReminderEnabled(!isSMSReminderEnabled);
    }
  });
  
  // Handle saving a new medication
  const handleSaveMedication = (e: React.FormEvent) => {
    e.preventDefault();
    addMedication.mutate(newMedication);
  };
  
  // Handle logging medication taken
  const handleLogMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setMedicationLog({
      medicationId: medication.id,
      takenAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      status: 'taken',
      notes: ''
    });
    setIsConfirmLogOpen(true);
  };
  
  // Handle submission of medication log
  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    logMedication.mutate(medicationLog);
  };
  
  // Handle toggling SMS reminders
  const handleToggleSMSReminders = () => {
    const newValue = !isSMSReminderEnabled;
    setIsSMSReminderEnabled(newValue);
    
    if (phoneNumber) {
      setupSMSReminder.mutate({
        phoneNumber,
        enabled: newValue
      });
    } else {
      toast({
        variant: "destructive",
        title: "Phone Number Required",
        description: "Please add a phone number in your profile to enable SMS reminders.",
      });
      // Revert toggle if no phone number
      setIsSMSReminderEnabled(!newValue);
    }
  };
  
  // Handle time of day selection for new medication
  const handleTimeOfDayChange = (time: string) => {
    const currentTimes = [...newMedication.timeOfDay];
    if (currentTimes.includes(time)) {
      setNewMedication({
        ...newMedication,
        timeOfDay: currentTimes.filter(t => t !== time)
      });
    } else {
      setNewMedication({
        ...newMedication,
        timeOfDay: [...currentTimes, time]
      });
    }
  };
  
  // Format medication frequency for display
  const formatFrequency = (frequency: string, timeOfDay: string[]) => {
    let frequencyText = '';
    
    switch (frequency) {
      case 'daily':
        frequencyText = 'Daily';
        break;
      case 'twice_daily':
        frequencyText = 'Twice daily';
        break;
      case 'every_other_day':
        frequencyText = 'Every other day';
        break;
      case 'weekly':
        frequencyText = 'Weekly';
        break;
      case 'as_needed':
        frequencyText = 'As needed';
        break;
      default:
        frequencyText = frequency;
    }
    
    if (timeOfDay && timeOfDay.length > 0) {
      const formattedTimes = timeOfDay.map(time => {
        switch (time) {
          case 'morning':
            return 'Morning';
          case 'afternoon':
            return 'Afternoon';
          case 'evening':
            return 'Evening';
          case 'bedtime':
            return 'Bedtime';
          default:
            return time;
        }
      });
      
      return `${frequencyText} (${formattedTimes.join(', ')})`;
    }
    
    return frequencyText;
  };
  
  // Get today's medications that need to be taken
  const getTodaysMedications = () => {
    if (!medications) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return medications.filter((med: Medication) => {
      const startDate = new Date(med.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = med.endDate ? new Date(med.endDate) : null;
      if (endDate) endDate.setHours(0, 0, 0, 0);
      
      // Check if the medication is active for today
      return startDate <= today && (!endDate || endDate >= today);
    });
  };
  
  // Check if a medication has been logged today
  const isMedicationLoggedToday = (medicationId: number) => {
    if (!medicationLogs) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return medicationLogs.some((log: MedicationLog) => {
      const logDate = new Date(log.takenAt);
      logDate.setHours(0, 0, 0, 0);
      
      return log.medicationId === medicationId && logDate.getTime() === today.getTime() && log.status === 'taken';
    });
  };
  
  // Get medications that need refills soon
  const getRefillsNeeded = () => {
    if (!medications) return [];
    
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return medications.filter((med: Medication) => {
      if (!med.refillDate) return false;
      
      const refillDate = new Date(med.refillDate);
      return refillDate <= thirtyDaysFromNow && med.refillsRemaining !== undefined && med.refillsRemaining <= 1;
    });
  };

  return (
    <>
      <Helmet>
        <title>Medication Adherence | {APP_NAME}</title>
        <meta name="description" content="Track your medications and earn rewards for adherence" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-primary">
            Medication Adherence
          </h1>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">SMS Reminders</span>
              <Switch 
                checked={isSMSReminderEnabled} 
                onCheckedChange={handleToggleSMSReminders}
                disabled={!phoneNumber || setupSMSReminder.isPending}
              />
            </div>
            
            <Button onClick={() => setIsAddMedicationOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="medications">My Medications</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Today's Medications
                    </CardTitle>
                    <CardDescription>
                      Medications you need to take today
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {medicationsLoading || logsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Loading medications...</span>
                      </div>
                    ) : getTodaysMedications().length > 0 ? (
                      <div className="space-y-4">
                        {getTodaysMedications().map((medication: Medication) => {
                          const isLogged = isMedicationLoggedToday(medication.id);
                          
                          return (
                            <div key={medication.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${isLogged ? 'bg-green-100' : 'bg-blue-100'}`}>
                                  <Pill className={`h-5 w-5 ${isLogged ? 'text-green-600' : 'text-blue-600'}`} />
                                </div>
                                <div>
                                  <h3 className="font-medium">{medication.name}</h3>
                                  <p className="text-sm text-gray-600">{medication.dosage}</p>
                                  <p className="text-xs text-gray-500">{formatFrequency(medication.frequency, medication.timeOfDay)}</p>
                                </div>
                              </div>
                              
                              {isLogged ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <Check className="h-3 w-3 mr-1" />
                                  Taken
                                </Badge>
                              ) : (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleLogMedication(medication)}
                                  disabled={logMedication.isPending}
                                >
                                  {logMedication.isPending ? (
                                    <>
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      Logging...
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-3 w-3 mr-1" />
                                      Log as Taken
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Medications for Today</h3>
                        <p className="text-gray-500 mb-4">
                          You don't have any medications scheduled for today.
                        </p>
                        <Button onClick={() => setIsAddMedicationOpen(true)}>
                          Add Medication
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      Upcoming Refills
                    </CardTitle>
                    <CardDescription>
                      Medications that need to be refilled soon
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {medicationsLoading ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : getRefillsNeeded().length > 0 ? (
                      <div className="space-y-3">
                        {getRefillsNeeded().map((medication: Medication) => (
                          <div key={medication.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-full bg-amber-100">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                              </div>
                              <div>
                                <h3 className="font-medium">{medication.name}</h3>
                                <p className="text-xs text-gray-600">
                                  Refill by: {medication.refillDate ? format(new Date(medication.refillDate), 'MMM d, yyyy') : 'Not specified'}
                                </p>
                              </div>
                            </div>
                            
                            <Badge variant="outline" className={medication.refillsRemaining === 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                              {medication.refillsRemaining === 0 ? 'No refills left' : `${medication.refillsRemaining} refill${medication.refillsRemaining !== 1 ? 's' : ''} left`}
                            </Badge>
                          </div>
                        ))}
                        
                        <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                          <BellRing className="h-4 w-4 text-blue-600" />
                          <AlertTitle>Refill Reminders</AlertTitle>
                          <AlertDescription className="text-blue-700">
                            SMS reminders will be sent 7 days before your refill date. Make sure your phone number is updated in your profile.
                          </AlertDescription>
                        </Alert>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                          No refills needed in the next 30 days
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Adherence Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : adherenceStats ? (
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Adherence Rate</span>
                            <span className="text-sm font-bold">{adherenceStats.adherenceRate}%</span>
                          </div>
                          <Progress value={adherenceStats.adherenceRate} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">
                            Based on {adherenceStats.totalMedications} medication{adherenceStats.totalMedications !== 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Flame className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">Current Streak</span>
                            </div>
                            <p className="text-2xl font-bold text-green-700">{adherenceStats.currentStreak} days</p>
                            <p className="text-xs text-green-600 mt-1">
                              Longest: {adherenceStats.longestStreak} days
                            </p>
                          </div>
                          
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <BadgeCheck className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-primary">Points Earned</span>
                            </div>
                            <p className="text-2xl font-bold text-primary">{adherenceStats.totalPointsEarned}</p>
                            <p className="text-xs text-primary/80 mt-1">
                              From medication tracking
                            </p>
                          </div>
                        </div>
                        
                        {adherenceStats.missedDoses > 0 && (
                          <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Missed Doses</AlertTitle>
                            <AlertDescription>
                              You've missed {adherenceStats.missedDoses} dose{adherenceStats.missedDoses !== 1 ? 's' : ''} in the last 30 days.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">
                          No adherence data available yet
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <BellRing className="h-5 w-5 text-primary" />
                      SMS Reminders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={isSMSReminderEnabled} 
                            onCheckedChange={handleToggleSMSReminders}
                            disabled={!phoneNumber || setupSMSReminder.isPending}
                          />
                          <span>{isSMSReminderEnabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        
                        {setupSMSReminder.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                      </div>
                      
                      {!phoneNumber ? (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Phone Number Missing</AlertTitle>
                          <AlertDescription>
                            Add your phone number in your profile to enable SMS reminders.
                            <Button 
                              variant="link" 
                              className="p-0 h-auto mt-1"
                              onClick={() => navigate('/profile')}
                            >
                              Update Profile
                            </Button>
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="text-sm text-gray-600">
                          <p>Reminders will be sent to:</p>
                          <p className="font-medium mt-1">{phoneNumber}</p>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        <p className="font-medium mb-1">Reminder Schedule:</p>
                        <ul className="space-y-1 text-gray-600">
                          <li>• Morning medications: 8:00 AM</li>
                          <li>• Afternoon medications: 1:00 PM</li>
                          <li>• Evening medications: 6:00 PM</li>
                          <li>• Bedtime medications: 9:00 PM</li>
                        </ul>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        Reply to SMS reminders with "TAKEN" to log your medication and earn points automatically.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Medications Tab */}
          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    My Medications
                  </div>
                  <Button size="sm" onClick={() => setIsAddMedicationOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage your medications and schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                {medicationsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading medications...</span>
                  </div>
                ) : medications && medications.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Refill Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medications.map((medication: Medication) => (
                        <TableRow key={medication.id}>
                          <TableCell className="font-medium">{medication.name}</TableCell>
                          <TableCell>{medication.dosage}</TableCell>
                          <TableCell>{formatFrequency(medication.frequency, medication.timeOfDay)}</TableCell>
                          <TableCell>{format(new Date(medication.startDate), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            {medication.refillDate ? (
                              <div className="flex items-center gap-1">
                                <span>{format(new Date(medication.refillDate), 'MMM d, yyyy')}</span>
                                {medication.refillsRemaining !== undefined && medication.refillsRemaining <= 1 && (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 ml-1">
                                    {medication.refillsRemaining === 0 ? 'No refills' : '1 refill left'}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              'Not set'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleLogMedication(medication)}
                                title="Log medication"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Edit medication"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Medications Added</h3>
                    <p className="text-gray-500 mb-4">
                      You haven't added any medications to track yet.
                    </p>
                    <Button onClick={() => setIsAddMedicationOpen(true)}>
                      Add Your First Medication
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5" />
                  Medication History
                </CardTitle>
                <CardDescription>
                  Track your medication adherence over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading history...</span>
                  </div>
                ) : medicationLogs && medicationLogs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicationLogs.map((log: MedicationLog) => {
                        // Find the medication name from the medications array
                        const medication = medications?.find((med: Medication) => med.id === log.medicationId);
                        
                        return (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div>
                                <span className="font-medium">{format(new Date(log.takenAt), 'MMM d, yyyy')}</span>
                                <br />
                                <span className="text-xs text-gray-500">{format(new Date(log.takenAt), 'h:mm a')}</span>
                              </div>
                            </TableCell>
                            <TableCell>{medication?.name || `Medication #${log.medicationId}`}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  log.status === 'taken' ? 'bg-green-50 text-green-700 border-green-200' :
                                  log.status === 'missed' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-gray-50 text-gray-700 border-gray-200'
                                }
                              >
                                {log.status === 'taken' && <Check className="h-3 w-3 mr-1" />}
                                {log.status === 'missed' && <X className="h-3 w-3 mr-1" />}
                                {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {log.pointsEarned ? (
                                <span className="text-green-600 font-medium">+{log.pointsEarned}</span>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>{log.notes || '-'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <CalendarCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Medication History</h3>
                    <p className="text-gray-500 mb-4">
                      Start logging your medications to build your history.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Reminders Tab */}
          <TabsContent value="reminders">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BellRing className="h-5 w-5" />
                    SMS Medication Reminders
                  </CardTitle>
                  <CardDescription>
                    Get timely reminders for your medications via SMS
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={isSMSReminderEnabled} 
                        onCheckedChange={handleToggleSMSReminders}
                        disabled={!phoneNumber || setupSMSReminder.isPending}
                        className="data-[state=checked]:bg-primary"
                      />
                      <div>
                        <p className="font-medium">{isSMSReminderEnabled ? 'SMS Reminders Enabled' : 'SMS Reminders Disabled'}</p>
                        <p className="text-sm text-gray-600">
                          {isSMSReminderEnabled 
                            ? 'You will receive SMS reminders for your medications' 
                            : 'Enable to receive SMS reminders for your medications'}
                        </p>
                      </div>
                    </div>
                    
                    {setupSMSReminder.isPending && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                  </div>
                  
                  {!phoneNumber ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Phone Number Required</AlertTitle>
                      <AlertDescription className="space-y-2">
                        <p>You need to add a phone number to your profile to enable SMS reminders.</p>
                        <Button 
                          onClick={() => navigate('/profile')}
                          size="sm"
                        >
                          Update Profile
                        </Button>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle>SMS Reminders Will Be Sent To:</AlertTitle>
                      <AlertDescription>
                        <span className="font-medium">{phoneNumber}</span>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">How SMS Reminders Work</h3>
                    
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex gap-3">
                        <div className="bg-primary/10 p-2 rounded-full h-fit">
                          <Bell className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Reminder Timing</h4>
                          <p className="text-sm text-gray-600">
                            You'll receive reminders based on your medication schedule:
                          </p>
                          <ul className="text-xs text-gray-600 list-disc pl-4 mt-1 space-y-1">
                            <li>Morning medications: 8:00 AM</li>
                            <li>Afternoon medications: 1:00 PM</li>
                            <li>Evening medications: 6:00 PM</li>
                            <li>Bedtime medications: 9:00 PM</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="bg-primary/10 p-2 rounded-full h-fit">
                          <Award className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Earn Points Automatically</h4>
                          <p className="text-sm text-gray-600">
                            When you receive a reminder, simply reply with "TAKEN" to:
                          </p>
                          <ul className="text-xs text-gray-600 list-disc pl-4 mt-1 space-y-1">
                            <li>Log your medication as taken</li>
                            <li>Earn points automatically</li>
                            <li>Maintain your adherence streak</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Sample SMS Reminder
                      </h4>
                      <div className="bg-white p-3 rounded border border-blue-100 mt-2 text-sm">
                        <p className="font-mono">
                          Hi John, it's time to take your Lisinopril (10mg). This was scheduled for Morning. Reply TAKEN-ABC123 to confirm you've taken it and earn points in your Health Rewards program.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Refill Reminders
                  </CardTitle>
                  <CardDescription>
                    Never miss a medication refill
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={true} 
                        className="data-[state=checked]:bg-primary"
                      />
                      <div>
                        <p className="font-medium">Refill Reminders Enabled</p>
                        <p className="text-sm text-gray-600">
                          You will receive reminders when it's time to refill your medications
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Upcoming Refills</h3>
                    
                    {medicationsLoading ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : getRefillsNeeded().length > 0 ? (
                      <div className="space-y-3">
                        {getRefillsNeeded().map((medication: Medication) => (
                          <div key={medication.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <span className="font-medium">{medication.name}</span>
                              </div>
                              <Badge variant="outline" className="bg-amber-100 border-amber-200 text-amber-800">
                                {medication.refillsRemaining === 0 ? 'No refills left' : `${medication.refillsRemaining} refill${medication.refillsRemaining !== 1 ? 's' : ''} left`}
                              </Badge>
                            </div>
                            <div className="mt-2 text-sm">
                              <p>Refill by: {medication.refillDate ? format(new Date(medication.refillDate), 'MMMM d, yyyy') : 'Not specified'}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                {medication.refillDate 
                                  ? `${formatDistanceToNow(new Date(medication.refillDate))} remaining`
                                  : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                          No refills needed in the next 30 days
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        How Refill Reminders Work
                      </h4>
                      <ul className="text-sm text-green-700 list-disc pl-4 mt-2 space-y-1">
                        <li>You'll receive an SMS reminder 7 days before your refill date</li>
                        <li>A second reminder will be sent 3 days before your refill date if you haven't refilled yet</li>
                        <li>You can track all your refills in the dashboard</li>
                        <li>Maintaining timely refills contributes to your adherence score</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Medication Dialog */}
      <Dialog open={isAddMedicationOpen} onOpenChange={setIsAddMedicationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
            <DialogDescription>
              Enter your medication details below
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveMedication} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medication Name</Label>
                <Input 
                  id="name" 
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                  placeholder="e.g., Lisinopril"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input 
                  id="dosage" 
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                  placeholder="e.g., 10mg"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select 
                  value={newMedication.frequency}
                  onValueChange={(value) => setNewMedication({...newMedication, frequency: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="twice_daily">Twice Daily</SelectItem>
                    <SelectItem value="every_other_day">Every Other Day</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="as_needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Time of Day</Label>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    type="button"
                    variant={newMedication.timeOfDay.includes('morning') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeOfDayChange('morning')}
                  >
                    Morning
                  </Button>
                  <Button 
                    type="button"
                    variant={newMedication.timeOfDay.includes('afternoon') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeOfDayChange('afternoon')}
                  >
                    Afternoon
                  </Button>
                  <Button 
                    type="button"
                    variant={newMedication.timeOfDay.includes('evening') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeOfDayChange('evening')}
                  >
                    Evening
                  </Button>
                  <Button 
                    type="button"
                    variant={newMedication.timeOfDay.includes('bedtime') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeOfDayChange('bedtime')}
                  >
                    Bedtime
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date"
                  value={newMedication.startDate}
                  onChange={(e) => setNewMedication({...newMedication, startDate: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input 
                  id="endDate" 
                  type="date"
                  value={newMedication.endDate}
                  onChange={(e) => setNewMedication({...newMedication, endDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea 
                id="instructions" 
                value={newMedication.instructions}
                onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                placeholder="e.g., Take with food"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="refillReminder">Refill Reminder</Label>
                <Switch 
                  id="refillReminder"
                  checked={newMedication.refillReminder}
                  onCheckedChange={(checked) => setNewMedication({...newMedication, refillReminder: checked})}
                />
              </div>
              
              {newMedication.refillReminder && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="refillDate">Next Refill Date</Label>
                    <Input 
                      id="refillDate" 
                      type="date"
                      value={newMedication.refillDate}
                      onChange={(e) => setNewMedication({...newMedication, refillDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="refillsRemaining">Refills Remaining</Label>
                    <Input 
                      id="refillsRemaining" 
                      type="number"
                      min="0"
                      value={newMedication.refillsRemaining}
                      onChange={(e) => setNewMedication({...newMedication, refillsRemaining: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddMedicationOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={addMedication.isPending}
              >
                {addMedication.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : 'Save Medication'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Medication Log Dialog */}
      <Dialog open={isConfirmLogOpen} onOpenChange={setIsConfirmLogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Medication</DialogTitle>
            <DialogDescription>
              Confirm that you've taken this medication
            </DialogDescription>
          </DialogHeader>
          
          {selectedMedication && (
            <form onSubmit={handleSubmitLog} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedMedication.name}</h3>
                    <p className="text-sm text-gray-600">{selectedMedication.dosage}</p>
                  </div>
                </div>
                
                {selectedMedication.instructions && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    "{selectedMedication.instructions}"
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="takenAt">Date & Time Taken</Label>
                <Input 
                  id="takenAt" 
                  type="datetime-local"
                  value={medicationLog.takenAt}
                  onChange={(e) => setMedicationLog({...medicationLog, takenAt: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={medicationLog.status}
                  onValueChange={(value: 'taken' | 'missed' | 'skipped') => setMedicationLog({...medicationLog, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="taken">Taken</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="skipped">Skipped (Intentionally)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  value={medicationLog.notes}
                  onChange={(e) => setMedicationLog({...medicationLog, notes: e.target.value})}
                  placeholder="e.g., Took with breakfast"
                />
              </div>
              
              {medicationLog.status === 'taken' && (
                <Alert className="bg-green-50 border-green-200">
                  <Award className="h-4 w-4 text-green-600" />
                  <AlertTitle>Earn Points!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Logging this medication as taken will earn you points in the Health Rewards program.
                  </AlertDescription>
                </Alert>
              )}
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsConfirmLogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={logMedication.isPending}
                  variant={medicationLog.status === 'taken' ? 'default' : 'secondary'}
                >
                  {logMedication.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : 'Confirm'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MedicationAdherence;