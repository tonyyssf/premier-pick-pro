
import React from 'react';
import { Layout } from '@/components/Layout';
import { AdminOnly } from '@/components/AdminOnly';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDataSync from '@/components/AdminDataSync';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { SystemMonitoringDashboard } from '@/components/SystemMonitoringDashboard';
import { EnhancedSecurityMonitor } from '@/components/EnhancedSecurityMonitor';
import { RapidApiTester } from '@/components/RapidApiTester';
import { Database, TrendingUp, Activity, Shield, TestTube } from 'lucide-react';

const Admin = () => {
  return (
    <AdminOnly>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Manage system data, monitor performance, and review security metrics.
            </p>
          </div>

          <Tabs defaultValue="data" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="data" className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Data Management</span>
              </TabsTrigger>
              <TabsTrigger value="api-testing" className="flex items-center space-x-2">
                <TestTube className="h-4 w-4" />
                <span>API Testing</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>System Monitoring</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Enhanced Security</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="space-y-6">
              <AdminDataSync />
            </TabsContent>

            <TabsContent value="api-testing" className="space-y-6">
              <RapidApiTester />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <SystemMonitoringDashboard />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <EnhancedSecurityMonitor />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </AdminOnly>
  );
};

export default Admin;
