import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useSecurityMonitoringContext } from '@/components/SecurityMonitoringProvider';
import { securityLogger } from '@/utils/securityLogger';
import { useAdmin } from '@/hooks/useAdmin';

export const SecurityAuditDashboard: React.FC = () => {
  const { metrics, isLoading, performSecurityAudit } = useSecurityMonitoringContext();
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return null; // Only show to admins
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-emerald-600" />;
    if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const handleViewLogs = () => {
    const recentEvents = securityLogger.getRecentEvents(20);
    console.table(recentEvents);
    
    // You could also show in a modal or separate component
    const summary = securityLogger.getSecuritySummary();
    console.log('Security Summary:', summary);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Security Audit Dashboard</h2>
        </div>
        <Button 
          onClick={performSecurityAudit} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Audit
        </Button>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Security Score Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              {getScoreIcon(metrics.securityScore)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(metrics.securityScore)}`}>
                {metrics.securityScore}/100
              </div>
              <p className="text-xs text-muted-foreground">
                Last updated: {metrics.lastAuditTime.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Critical Issues Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {metrics.criticalIssues}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>

          {/* Warnings Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {metrics.warnings}
              </div>
              <p className="text-xs text-muted-foreground">
                Recommendations for improvement
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Functions Audit */}
      {metrics?.securityFunctions && (
        <Card>
          <CardHeader>
            <CardTitle>Database Security Functions</CardTitle>
            <CardDescription>
              Audit of security-critical database functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.securityFunctions.map((func: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{func.function_name}</span>
                    <span className="text-sm text-muted-foreground ml-2">({func.schema_name})</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={func.is_security_definer ? "default" : "destructive"}>
                      {func.is_security_definer ? "SECURITY DEFINER" : "NO DEFINER"}
                    </Badge>
                    <Badge variant={func.search_path_set ? "default" : "destructive"}>
                      {func.search_path_set ? "SEARCH PATH SET" : "NO SEARCH PATH"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extension Audit */}
      {metrics?.extensionAudit && (
        <Card>
          <CardHeader>
            <CardTitle>Extension Security Audit</CardTitle>
            <CardDescription>
              Review of installed database extensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.extensionAudit.map((ext: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{ext.extension_name}</span>
                    <span className="text-sm text-muted-foreground ml-2">({ext.schema_location})</span>
                  </div>
                  <Badge 
                    variant={ext.security_recommendation.includes('SECURITY ISSUE') ? "destructive" : "default"}
                  >
                    {ext.security_recommendation.length > 50 
                      ? ext.security_recommendation.substring(0, 50) + '...'
                      : ext.security_recommendation
                    }
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Security Event Logs</CardTitle>
          <CardDescription>
            Recent security events and monitoring data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleViewLogs} variant="outline">
            View Security Logs in Console
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Opens detailed security logs in browser console for analysis
          </p>
        </CardContent>
      </Card>
    </div>
  );
};