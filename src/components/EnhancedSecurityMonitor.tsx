
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useAdmin } from '@/hooks/useAdmin';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity,
  Clock,
  Users,
  Lock,
  Eye,
  RefreshCw
} from 'lucide-react';

export const EnhancedSecurityMonitor: React.FC = () => {
  const { metrics, isLoading, performSecurityAudit } = useSecurityMonitoring();
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return null; // Only show to admins
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Enhanced Security Monitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const getThreatLevel = () => {
    if (metrics.criticalIssues > 0) return 'high';
    if (metrics.warnings > 2) return 'medium';
    return 'low';
  };

  const threatLevel = getThreatLevel();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Enhanced Security Monitor</h2>
        <Button 
          onClick={performSecurityAudit}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Run Security Audit
        </Button>
      </div>

      {/* Security Score Overview */}
      <Card className={
        threatLevel === 'high' ? 'border-red-200 bg-red-50' :
        threatLevel === 'medium' ? 'border-orange-200 bg-orange-50' :
        'border-green-200 bg-green-50'
      }>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {threatLevel === 'high' ? (
                <XCircle className="h-8 w-8 text-red-500" />
              ) : threatLevel === 'medium' ? (
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-500" />
              )}
              <div>
                <h3 className="text-xl font-bold">Security Score: {metrics.securityScore}/100</h3>
                <p className="text-sm text-gray-600">
                  Last audit: {metrics.lastAuditTime.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">{metrics.criticalIssues}</div>
              <div className="text-xs text-gray-500">Critical Issues</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.criticalIssues}</div>
            <p className="text-xs text-gray-500 mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.warnings}</div>
            <p className="text-xs text-gray-500 mt-1">Should be reviewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Security Functions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.securityFunctions.length}</div>
            <p className="text-xs text-gray-500 mt-1">Database functions audited</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Extensions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.extensionAudit.length}</div>
            <p className="text-xs text-gray-500 mt-1">Extensions reviewed</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues Alert */}
      {metrics.criticalIssues > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Security Issues Detected:</strong> {metrics.criticalIssues} issues require immediate attention.
            Review the security functions and extension audit results below.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Functions Audit */}
      <Card>
        <CardHeader>
          <CardTitle>Security Functions Audit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.securityFunctions.map((func, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{func.schema_name}.{func.function_name}</div>
                    <div className="text-sm text-gray-600">
                      Security Definer: {func.is_security_definer ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
                <Badge variant={func.search_path_set ? 'default' : 'destructive'}>
                  {func.search_path_set ? 'Search Path Set' : 'Missing Search Path'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Extension Security Audit */}
      <Card>
        <CardHeader>
          <CardTitle>Extension Security Audit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.extensionAudit.map((ext, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{ext.extension_name}</div>
                    <div className="text-sm text-gray-600">Schema: {ext.schema_location}</div>
                  </div>
                </div>
                <Badge variant={
                  ext.security_recommendation.includes('SECURITY ISSUE') ? 'destructive' :
                  ext.security_recommendation.includes('Consider') ? 'default' :
                  'outline'
                }>
                  {ext.security_recommendation.includes('SECURITY ISSUE') ? 'Issue' :
                   ext.security_recommendation.includes('Consider') ? 'Warning' :
                   'OK'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
