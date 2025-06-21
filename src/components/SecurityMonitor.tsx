
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Database,
  Lock
} from 'lucide-react';

export const SecurityMonitor: React.FC = () => {
  const { metrics, isLoading, performSecurityAudit } = useSecurityMonitoring();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Audit</span>
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

  const overallSecurity = metrics.criticalIssues > 0 ? 'critical' : 
                         metrics.warnings > 0 ? 'warning' : 'healthy';

  const getSecurityIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getSecurityBadge = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Secure</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Warnings</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical Issues</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Security Audit</h2>
        <Button 
          onClick={performSecurityAudit}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Run Audit
        </Button>
      </div>

      {/* Overall Security Status */}
      <Card className={
        overallSecurity === 'critical' ? 'border-red-200 bg-red-50' :
        overallSecurity === 'warning' ? 'border-orange-200 bg-orange-50' :
        'border-green-200 bg-green-50'
      }>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            {getSecurityIcon(overallSecurity)}
            <div>
              <h3 className="font-semibold text-lg">
                Security Status: {getSecurityBadge(overallSecurity)}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Last audit: {metrics.lastAuditTime.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.criticalIssues}</div>
              <div className="text-sm text-gray-600">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.warnings}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.securityFunctions.length}
              </div>
              <div className="text-sm text-gray-600">Functions Audited</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Functions Audit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Security Functions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.securityFunctions.map((func, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{func.function_name}</div>
                  <div className="text-sm text-gray-600">Schema: {func.schema_name}</div>
                </div>
                <div className="flex items-center space-x-2">
                  {func.is_security_definer && (
                    <Badge variant="outline" className="text-xs">SECURITY DEFINER</Badge>
                  )}
                  {func.search_path_set ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Extension Audit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Extension Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.extensionAudit.map((ext, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{ext.extension_name}</div>
                  <Badge variant="outline" className="text-xs">{ext.schema_location}</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {ext.security_recommendation}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
