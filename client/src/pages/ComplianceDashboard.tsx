import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Database,
  Lock,
  FileText,
  Zap,
  TrendingUp,
  Settings,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface ComplianceScore {
  category: string;
  requirement: string;
  currentScore: number;
  maxScore: number;
  percentage: number;
  issues: string[];
  recommendations: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface SystemHealthMetrics {
  overallHealth: number;
  complianceScore: number;
  trustScore: number;
  integrityScore: number;
  performanceScore: number;
  securityScore: number;
  detailed: {
    hipaa: ComplianceScore[];
    audit: any;
    ai_governance: any;
    data_integrity: any;
    system_performance: any;
  };
}

interface OptimizationPlan {
  criticalActions: string[];
  highPriorityActions: string[];
  mediumPriorityActions: string[];
  estimatedImpact: number;
}

const ComplianceDashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not authenticated or not admin
  if (!isAuthenticated) {
    navigate('/login?redirect=/admin/compliance-dashboard');
    return null;
  }

  if (user?.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  // Run compliance assessment
  const assessmentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/compliance-optimizer/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to run compliance assessment');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Assessment Complete",
        description: `System health: ${Math.round(data.assessment.overallHealth * 100)}%`,
      });
    },
    onError: (error) => {
      toast({
        title: "Assessment Failed",
        description: "Unable to complete compliance assessment",
        variant: "destructive",
      });
    }
  });

  // Get health status
  const { data: healthStatus, refetch: refetchHealth } = useQuery({
    queryKey: ['/api/compliance-optimizer/health-status'],
    enabled: isAuthenticated && user?.role === 'admin'
  });

  const getScoreColor = (percentage: number) => {
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 95) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const runAssessment = () => {
    assessmentMutation.mutate();
  };

  const assessmentData = assessmentMutation.data;

  return (
    <>
      <Helmet>
        <title>Compliance Dashboard | {APP_NAME}</title>
        <meta name="description" content="HIPAA compliance and system health monitoring" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
                <p className="text-gray-600">HIPAA compliance and system health monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => refetchHealth()}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={runAssessment}
                disabled={assessmentMutation.isPending}
              >
                {assessmentMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Assessing...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Run Assessment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthStatus?.systemStatus === 'operational' ? (
                  <span className="text-green-600">Operational</span>
                ) : (
                  <span className="text-red-600">Degraded</span>
                )}
              </div>
              <p className="text-xs text-gray-600">
                Uptime: {healthStatus ? Math.round(healthStatus.uptime / 3600) : 0}h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assessmentData ? (
                  <span className={getScoreColor(assessmentData.assessment.overallHealth * 100)}>
                    {Math.round(assessmentData.assessment.overallHealth * 100)}%
                  </span>
                ) : (
                  <span className="text-gray-400">--</span>
                )}
              </div>
              <p className="text-xs text-gray-600">
                {assessmentData ? 'Last assessed' : 'Run assessment to view'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">HIPAA Compliance</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assessmentData ? (
                  <span className={getScoreColor(assessmentData.assessment.complianceScore * 100)}>
                    {Math.round(assessmentData.assessment.complianceScore * 100)}%
                  </span>
                ) : (
                  <span className="text-gray-400">--</span>
                )}
              </div>
              <p className="text-xs text-gray-600">
                Regulatory compliance score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Lock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assessmentData ? (
                  <span className={getScoreColor(assessmentData.assessment.securityScore * 100)}>
                    {Math.round(assessmentData.assessment.securityScore * 100)}%
                  </span>
                ) : (
                  <span className="text-gray-400">--</span>
                )}
              </div>
              <p className="text-xs text-gray-600">
                Security controls effectiveness
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Assessment Results */}
        {assessmentData && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="hipaa">HIPAA Details</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Scores</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>HIPAA Compliance</span>
                        <span className="font-medium">
                          {Math.round(assessmentData.assessment.complianceScore * 100)}%
                        </span>
                      </div>
                      <Progress value={assessmentData.assessment.complianceScore * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Trust Score</span>
                        <span className="font-medium">
                          {Math.round(assessmentData.assessment.trustScore * 100)}%
                        </span>
                      </div>
                      <Progress value={assessmentData.assessment.trustScore * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Data Integrity</span>
                        <span className="font-medium">
                          {Math.round(assessmentData.assessment.integrityScore * 100)}%
                        </span>
                      </div>
                      <Progress value={assessmentData.assessment.integrityScore * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Performance</span>
                        <span className="font-medium">
                          {Math.round(assessmentData.assessment.performanceScore * 100)}%
                        </span>
                      </div>
                      <Progress value={assessmentData.assessment.performanceScore * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Audit Events</span>
                      <span className="font-medium">{assessmentData.assessment.detailed.audit.totalEvents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Assessments</span>
                      <span className="font-medium">{assessmentData.assessment.detailed.ai_governance.riskAssessments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Decisions</span>
                      <span className="font-medium">{assessmentData.assessment.detailed.ai_governance.aiDecisions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Automation Rules</span>
                      <span className="font-medium">{assessmentData.assessment.detailed.ai_governance.automationRules}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* HIPAA Details Tab */}
            <TabsContent value="hipaa" className="space-y-6">
              <div className="space-y-4">
                {assessmentData.assessment.detailed.hipaa.map((score: ComplianceScore, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{score.category}</CardTitle>
                          <p className="text-sm text-gray-600">{score.requirement.replace('_', ' ')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(score.priority)}
                          <Badge className={getScoreBadge(score.percentage)}>
                            {score.percentage}%
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Progress value={score.percentage} className="h-2" />
                        
                        {score.issues.length > 0 && (
                          <div>
                            <h4 className="font-medium text-red-700 mb-2">Issues Identified:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {score.issues.map((issue, idx) => (
                                <li key={idx} className="text-sm text-red-600">{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {score.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-medium text-blue-700 mb-2">Recommendations:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {score.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm text-blue-600">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Optimization Tab */}
            <TabsContent value="optimization" className="space-y-6">
              {assessmentData.optimizationPlan && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        Optimization Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        +{assessmentData.optimizationPlan.estimatedImpact}%
                      </div>
                      <p className="text-sm text-gray-600">
                        Estimated improvement after implementing recommendations
                      </p>
                    </CardContent>
                  </Card>

                  {assessmentData.optimizationPlan.criticalActions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                          <XCircle className="h-5 w-5" />
                          Critical Actions Required
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {assessmentData.optimizationPlan.criticalActions.map((action: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-red-600">•</span>
                              <span className="text-sm">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {assessmentData.optimizationPlan.highPriorityActions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700">
                          <AlertTriangle className="h-5 w-5" />
                          High Priority Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {assessmentData.optimizationPlan.highPriorityActions.map((action: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-orange-600">•</span>
                              <span className="text-sm">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Audit Coverage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {assessmentData.assessment.detailed.audit.coverage}%
                    </div>
                    <p className="text-sm text-gray-600">
                      Event types covered
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-green-600" />
                      Data Integrity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {assessmentData.assessment.detailed.data_integrity.integrityScore}%
                    </div>
                    <p className="text-sm text-gray-600">
                      Data consistency score
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-purple-600" />
                      System Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {assessmentData.assessment.detailed.system_performance.performanceScore}%
                    </div>
                    <p className="text-sm text-gray-600">
                      Overall performance
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Initial State */}
        {!assessmentData && (
          <Card>
            <CardHeader>
              <CardTitle>System Assessment</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Ready for Assessment</h3>
              <p className="text-gray-600 mb-4">
                Run a comprehensive compliance assessment to view detailed health metrics
              </p>
              <Button onClick={runAssessment} disabled={assessmentMutation.isPending}>
                {assessmentMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running Assessment...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Start Assessment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default ComplianceDashboard;