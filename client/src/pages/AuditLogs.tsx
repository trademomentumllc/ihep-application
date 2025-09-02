import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { CalendarIcon, DownloadIcon, FilterIcon, InfoIcon, SearchIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Types for audit logs
interface AuditLog {
  id: number;
  timestamp: string;
  userId: number | null;
  username?: string;
  email?: string;
  eventType: string;
  resourceType: string;
  resourceId: string | null;
  action: string;
  description: string;
  ipAddress: string;
  success: boolean;
  additionalInfo?: any;
}

interface AuditSummary {
  period: {
    start: string;
    end: string;
  };
  totalAccessEvents: number;
  totalModificationEvents: number;
  failedAuthEvents: number;
  topAccessedResources: Array<{
    resourceType: string;
    count: number;
  }>;
}

// Component for audit logs - HIPAA compliance interface
const AuditLogs = () => {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('logs');
  const [filters, setFilters] = useState({
    userId: '',
    resourceType: '',
    eventType: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    page: 1
  });

  // Redirect if not authenticated or not admin
  if (!isAuthenticated) {
    navigate('/login?redirect=/admin/audit-logs');
    return null;
  }

  if (user?.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  // Fetch audit logs with proper typing for TanStack Query v5
  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['/api/audit', filters],
  });

  // Fetch audit summary
  const { data: auditSummary, isLoading: summaryLoading } = useQuery<AuditSummary>({
    queryKey: ['/api/audit/summary', 
      {
        startDate: filters.startDate ? filters.startDate.toISOString() : undefined, 
        endDate: filters.endDate ? filters.endDate.toISOString() : undefined
      }
    ],
  });

  // Handler for filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  // Helper for date formatting
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <>
      <Helmet>
        <title>Audit Logs | {APP_NAME}</title>
        <meta name="description" content="HIPAA-compliant audit logs for tracking PHI access" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary mb-6">HIPAA Compliance Audit Logs</h1>
      
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="logs">Audit Logs</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          {/* Audit Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Access Logs</CardTitle>
                <CardDescription>
                  Review all PHI access logs for compliance tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters Section */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="w-full md:w-auto">
                    <Label htmlFor="resourceType">Resource Type</Label>
                    <Select
                      value={filters.resourceType}
                      onValueChange={(value) => handleFilterChange('resourceType', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All resources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All resources</SelectItem>
                        <SelectItem value="appointment">Appointments</SelectItem>
                        <SelectItem value="patient">Patients</SelectItem>
                        <SelectItem value="message">Messages</SelectItem>
                        <SelectItem value="authentication">Authentication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select
                      value={filters.eventType}
                      onValueChange={(value) => handleFilterChange('eventType', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All events" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All events</SelectItem>
                        <SelectItem value="PHI_ACCESS">PHI Access</SelectItem>
                        <SelectItem value="PHI_MODIFICATION">PHI Modification</SelectItem>
                        <SelectItem value="PHI_DELETION">PHI Deletion</SelectItem>
                        <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.startDate ? format(filters.startDate, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.startDate || undefined}
                          onSelect={(date) => handleFilterChange('startDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.endDate ? format(filters.endDate, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.endDate || undefined}
                          onSelect={(date) => handleFilterChange('endDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                {/* Table Section */}
                <div className="border rounded-md">
                  {logsLoading ? (
                    <div className="p-8 text-center">Loading audit logs...</div>
                  ) : !auditLogs?.logs?.length ? (
                    <div className="p-8 text-center">No audit logs found with the selected filters</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Resource</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>IP Address</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {auditLogs.logs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="whitespace-nowrap">{formatDate(log.timestamp)}</TableCell>
                              <TableCell>
                                {log.username || log.email || `User #${log.userId}` || 'System'}
                              </TableCell>
                              <TableCell>{log.eventType}</TableCell>
                              <TableCell>{log.resourceType} {log.resourceId && `#${log.resourceId}`}</TableCell>
                              <TableCell>{log.action}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {log.success ? 'Success' : 'Failed'}
                                </span>
                              </TableCell>
                              <TableCell>{log.ipAddress}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
                
                {/* Pagination Section */}
                {auditLogs?.pagination && (
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Page {filters.page} of {Math.ceil(auditLogs.pagination.total / auditLogs.pagination.limit)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                        disabled={filters.page <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                        disabled={filters.page >= Math.ceil(auditLogs.pagination.total / auditLogs.pagination.limit)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Summary Tab */}
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>HIPAA Compliance Summary</CardTitle>
                <CardDescription>
                  Overview of PHI access activities for compliance reporting
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="p-8 text-center">Loading summary data...</div>
                ) : !auditSummary ? (
                  <div className="p-8 text-center">No summary data available</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Summary Metrics */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Activity Metrics</h3>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Reporting Period</p>
                          <p className="font-medium">
                            {auditSummary.period && (
                              <>
                                {format(new Date(auditSummary.period.start), 'PPP')} to {format(new Date(auditSummary.period.end), 'PPP')}
                              </>
                            )}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Total PHI Access Events</p>
                          <p className="text-2xl font-semibold">{auditSummary.totalAccessEvents}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Total PHI Modification Events</p>
                          <p className="text-2xl font-semibold">{auditSummary.totalModificationEvents}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Failed Authentication Attempts</p>
                          <p className="text-2xl font-semibold">{auditSummary.failedAuthEvents}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Top Resources Accessed */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Top Resources Accessed</h3>
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Resource Type</TableHead>
                              <TableHead className="text-right">Access Count</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {auditSummary.topAccessedResources.map((resource, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{resource.resourceType}</TableCell>
                                <TableCell className="text-right">{resource.count}</TableCell>
                              </TableRow>
                            ))}
                            {auditSummary.topAccessedResources.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center py-4">No resource access data available</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* HIPAA Compliance Info */}
                      <div className="mt-6 p-4 border rounded-md bg-blue-50">
                        <div className="flex items-start gap-4">
                          <InfoIcon className="text-blue-500 mt-1" />
                          <div>
                            <h4 className="font-semibold mb-2">HIPAA Compliance Information</h4>
                            <p className="text-sm text-gray-700 mb-2">
                              This dashboard is designed to help maintain compliance with HIPAA Privacy Rule requirements for tracking PHI access.
                            </p>
                            <p className="text-sm text-gray-700">
                              All access to Protected Health Information is logged and available for audit purposes.
                              Florida regulations require 30-day breach notification, and New York requires 14-day record access for patients.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Export Button */}
                <div className="flex justify-end mt-6">
                  <Button variant="outline" className="gap-2">
                    <DownloadIcon className="h-4 w-4" /> 
                    Export Report (PDF)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AuditLogs;