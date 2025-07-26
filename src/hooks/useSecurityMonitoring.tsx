
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { securityLogger } from '@/utils/securityLogger';

export interface SecurityAuditResult {
  function_name: string;
  schema_name: string;
  is_security_definer: boolean;
  search_path_set: boolean;
}

export interface ExtensionAuditResult {
  extension_name: string;
  schema_location: string;
  security_recommendation: string;
}

export interface SecurityMetrics {
  securityFunctions: SecurityAuditResult[];
  extensionAudit: ExtensionAuditResult[];
  lastAuditTime: Date;
  criticalIssues: number;
  warnings: number;
  securityScore: number;
}

export const useSecurityMonitoring = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const auditSecurityFunctions = async (): Promise<SecurityAuditResult[]> => {
    try {
      const { data, error } = await supabase.rpc('security_audit_log');
      
      if (error) {
        console.error('Error auditing security functions:', error);
        securityLogger.log({
          type: 'suspicious_activity',
          details: { operation: 'security_audit_failed', error: error.message }
        });
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Security audit error:', error);
      return [];
    }
  };

  const auditExtensions = async (): Promise<ExtensionAuditResult[]> => {
    try {
      const { data, error } = await supabase.rpc('audit_extension_usage');
      
      if (error) {
        console.error('Error auditing extensions:', error);
        securityLogger.log({
          type: 'suspicious_activity',
          details: { operation: 'extension_audit_failed', error: error.message }
        });
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Extension audit error:', error);
      return [];
    }
  };

  const calculateSecurityMetrics = (
    functions: SecurityAuditResult[], 
    extensions: ExtensionAuditResult[]
  ): Pick<SecurityMetrics, 'criticalIssues' | 'warnings' | 'securityScore'> => {
    let criticalIssues = 0;
    let warnings = 0;

    // Check for functions without proper search_path
    functions.forEach(func => {
      if (func.is_security_definer && !func.search_path_set) {
        criticalIssues++;
      }
    });

    // Check extension recommendations
    extensions.forEach(ext => {
      if (ext.security_recommendation.includes('SECURITY ISSUE')) {
        criticalIssues++;
      } else if (ext.security_recommendation.includes('Consider') || 
                 ext.security_recommendation.includes('monitor')) {
        warnings++;
      }
    });

    // Calculate security score (0-100)
    const totalChecks = functions.length + extensions.length;
    const issues = criticalIssues * 2 + warnings; // Weight critical issues more heavily
    const maxPossibleIssues = totalChecks * 2;
    const securityScore = totalChecks > 0 ? Math.max(0, Math.round(((maxPossibleIssues - issues) / maxPossibleIssues) * 100)) : 100;

    return { criticalIssues, warnings, securityScore };
  };

  const performSecurityAudit = async () => {
    setIsLoading(true);
    try {
      const [functionAudit, extensionAudit] = await Promise.all([
        auditSecurityFunctions(),
        auditExtensions()
      ]);

      const { criticalIssues, warnings, securityScore } = calculateSecurityMetrics(functionAudit, extensionAudit);

      const newMetrics: SecurityMetrics = {
        securityFunctions: functionAudit,
        extensionAudit,
        lastAuditTime: new Date(),
        criticalIssues,
        warnings,
        securityScore
      };

      setMetrics(newMetrics);

      // Log security audit completion
      securityLogger.log({
        type: 'suspicious_activity',
        details: { 
          operation: 'security_audit_completed',
          criticalIssues,
          warnings,
          securityScore,
          functionCount: functionAudit.length,
          extensionCount: extensionAudit.length
        }
      });

      if (criticalIssues > 0) {
        toast({
          title: "Security Issues Detected",
          description: `${criticalIssues} critical security issues found (Score: ${securityScore}/100)`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Security audit failed:', error);
      securityLogger.log({
        type: 'suspicious_activity',
        details: { operation: 'security_audit_error', error: String(error) }
      });
      
      toast({
        title: "Security Audit Failed",
        description: "Could not complete security audit",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performSecurityAudit();
    
    // Set up periodic security audits every 5 minutes
    const interval = setInterval(performSecurityAudit, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    isLoading,
    performSecurityAudit
  };
};
