import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Settings,
  FileText,
  Eye,
  Clock,
  Users,
  Zap,
  BarChart3,
  AlertCircle
} from 'lucide-react';

// Types for neural governance data
interface GovernanceDashboard {
  riskAssessments: {
    total: number;
    byCategory: Record<string, number>;
    pendingReview: number;
  };
  complianceStatus: {
    byFramework: Record<string, { compliant: number; violations: number; warnings: number }>;
    criticalViolations: number;
  };
  neuralPerformance: {
    modelsTracked: number;
    averagePerformance: number;
    alertsGenerated: number;
  };
  automationMetrics: {
    activeRules: number;
    executionsToday: number;
    successRate: number;
  };
}

interface RiskAssessment {
  id: number;
  assessmentType: string;
  entityId: string;
  entityType: string;
  riskScore: number;
  riskCategory: string;
  identifiedRisks: string[];
  mitigationStrategies: string[];
  complianceViolations: string[];
  requiresHumanReview: boolean;
  createdAt: string;
}

interface ComplianceRecord {
  id: number;
  framework: string;
  category: string;
  entityType: string;
  complianceStatus: string;
  severity: string;
  description: string;
  recommendedActions: string[];
  createdAt: string;
}

interface NeuralMetric {
  id: number;
  modelName: string;
  metricType: string;
  value: number;
  threshold: number;
  status: string;
  performanceTrend: string;
  evaluationDate: string;
}

const NeuralGovernance = () => {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedRiskCategory, setSelectedRiskCategory] = useState('all');

  // Redirect if not authenticated or not admin
  if (!isAuthenticated) {
    navigate('/login?redirect=/admin/neural-governance');
    return null;
  }

  if (user?.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  // Fetch governance dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<GovernanceDashboard>({
    queryKey: ['/api/neural-governance/dashboard'],
    enabled: isAuthenticated && user?.role === 'admin'
  });

  // Fetch risk assessments
  const { data: riskAssessments, isLoading: riskLoading } = useQuery<RiskAssessment[]>({
    queryKey: ['/api/neural-governance/risk-assessments', { 
      riskCategory: selectedRiskCategory === 'all' ? undefined : selectedRiskCategory 
    }],
    enabled: isAuthenticated && user?.role === 'admin'
  });

  // Fetch compliance records
  const { data: complianceRecords, isLoading: complianceLoading } = useQuery<ComplianceRecord[]>({
    queryKey: ['/api/neural-governance/compliance-status', { 
      framework: selectedFramework === 'all' ? undefined : selectedFramework 
    }],
    enabled: isAuthenticated && user?.role === 'admin'
  });

  // Fetch neural metrics
  const { data: neuralMetrics, isLoading: metricsLoading } = useQuery<NeuralMetric[]>({
    queryKey: ['/api/neural-governance/neural-metrics'],
    enabled: isAuthenticated && user?.role === 'admin'
  });

  // Fetch compliance frameworks
  const { data: complianceFrameworks } = useQuery({
    queryKey: ['/api/neural-governance/compliance-frameworks'],
    enabled: isAuthenticated && user?.role === 'admin'
  });

  const getRiskCategoryColor = (category: string) => {
    switch (category) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'violation': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceStatusIcon = (status: string) => {
    switch (status) {
      case 'passing': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'failing': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p>Loading Neural Governance Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Neural Governance Intelligence | {APP_NAME}</title>
        <meta name="description" content="AI governance, risk assessment, and compliance monitoring dashboard" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Neural Governance Intelligence</h1>
              <p className="text-gray-600">AI governance, risk assessment, and compliance monitoring</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="neural-metrics">Neural Metrics</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {dashboardData && (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Risk Assessments</CardTitle>
                      <Shield className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.riskAssessments.total}</div>
                      <p className="text-xs text-gray-600">
                        {dashboardData.riskAssessments.pendingReview} pending review
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Critical Violations</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {dashboardData.complianceStatus.criticalViolations}
                      </div>
                      <p className="text-xs text-gray-600">Immediate attention required</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Neural Performance</CardTitle>
                      <Brain className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Math.round(dashboardData.neuralPerformance.averagePerformance * 100)}%
                      </div>
                      <p className="text-xs text-gray-600">
                        {dashboardData.neuralPerformance.modelsTracked} models tracked
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Automation Success</CardTitle>
                      <Zap className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData.automationMetrics.successRate}%
                      </div>
                      <p className="text-xs text-gray-600">
                        {dashboardData.automationMetrics.activeRules} active rules
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Risk Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment Overview</CardTitle>
                    <CardDescription>Distribution of risk categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(dashboardData.riskAssessments.byCategory).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getRiskCategoryColor(category)}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </Badge>
                            <span className="text-sm text-gray-600">{count} assessments</span>
                          </div>
                          <Progress 
                            value={(count / dashboardData.riskAssessments.total) * 100} 
                            className="w-24" 
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Framework Status</CardTitle>
                    <CardDescription>Current compliance status across frameworks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(dashboardData.complianceStatus.byFramework).map(([framework, status]) => (
                        <div key={framework} className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">{framework}</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-green-600">Compliant:</span>
                              <span>{status.compliant}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-yellow-600">Warnings:</span>
                              <span>{status.warnings}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-red-600">Violations:</span>
                              <span>{status.violations}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Risk Assessment Tab */}
          <TabsContent value="risk-assessment" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Risk Assessments</h2>
              <div className="flex items-center gap-4">
                <Select value={selectedRiskCategory} onValueChange={setSelectedRiskCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by risk category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="critical">Critical Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assessment Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Review Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riskAssessments?.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">{assessment.assessmentType}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{assessment.entityType}</div>
                            <div className="text-sm text-gray-600">{assessment.entityId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{assessment.riskScore}</span>
                            <Progress value={assessment.riskScore} className="w-16" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskCategoryColor(assessment.riskCategory)}>
                            {assessment.riskCategory}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assessment.requiresHumanReview ? (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              <Eye className="h-3 w-3 mr-1" />
                              Review Required
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Auto-Approved
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Compliance Monitoring</h2>
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frameworks</SelectItem>
                  <SelectItem value="HIPAA">HIPAA</SelectItem>
                  <SelectItem value="GDPR">GDPR</SelectItem>
                  <SelectItem value="SOX">SOX</SelectItem>
                  <SelectItem value="FDA_21CFR11">FDA 21 CFR Part 11</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Framework</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complianceRecords?.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.framework}</TableCell>
                        <TableCell>{record.category}</TableCell>
                        <TableCell>{record.entityType}</TableCell>
                        <TableCell>
                          <Badge className={getComplianceStatusColor(record.complianceStatus)}>
                            {record.complianceStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            record.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            record.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            record.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {record.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={record.description}>
                            {record.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(record.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Neural Metrics Tab */}
          <TabsContent value="neural-metrics" className="space-y-6">
            <h2 className="text-2xl font-bold">Neural Network Performance</h2>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model Name</TableHead>
                      <TableHead>Metric Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Last Evaluation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {neuralMetrics?.map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell className="font-medium">{metric.modelName}</TableCell>
                        <TableCell>{metric.metricType}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{(metric.value / 100).toFixed(2)}</span>
                            <Progress value={metric.value / 100} className="w-16" />
                          </div>
                        </TableCell>
                        <TableCell>{(metric.threshold / 100).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPerformanceStatusIcon(metric.status)}
                            <span className="capitalize">{metric.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(metric.performanceTrend)}
                            <span className="capitalize">{metric.performanceTrend}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(metric.evaluationDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Intelligent Automation</h2>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Configure Rules
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    Active Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {dashboardData?.automationMetrics.activeRules || 0}
                  </div>
                  <p className="text-sm text-gray-600">Automation rules running</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Executions Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {dashboardData?.automationMetrics.executionsToday || 0}
                  </div>
                  <p className="text-sm text-gray-600">Automated actions performed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {dashboardData?.automationMetrics.successRate || 0}%
                  </div>
                  <p className="text-sm text-gray-600">Successful executions</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Automation Rules Configuration</CardTitle>
                <CardDescription>
                  Intelligent automation rules for governance and compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">
                    Configure automation rules to streamline governance processes
                  </p>
                  <Button>
                    Create New Rule
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

export default NeuralGovernance;