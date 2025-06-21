
import React from 'react';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminOnly } from '@/components/AdminOnly';
import { AdminDataSync } from '@/components/AdminDataSync';
import { AdminDataTable } from '@/components/AdminDataTable';
import { SystemMonitoringDashboard } from '@/components/SystemMonitoringDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Database, Activity } from 'lucide-react';

const Admin = () => {
  return (
    <ProtectedRoute>
      <AdminOnly>
        <Layout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-8 w-8 text-plpe-purple" />
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              </div>
              <p className="text-gray-600">
                Manage your football picks application data, settings, and monitor system health.
              </p>
            </div>

            <Tabs defaultValue="data" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="data" className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Data Management</span>
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>System Monitoring</span>
                </TabsTrigger>
                <TabsTrigger value="tables" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Database Tables</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="data" className="space-y-8">
                <AdminDataSync />
              </TabsContent>

              <TabsContent value="monitoring" className="space-y-8">
                <SystemMonitoringDashboard />
              </TabsContent>

              <TabsContent value="tables" className="space-y-8">
                <AdminDataTable />
              </TabsContent>
            </Tabs>
          </div>
        </Layout>
      </AdminOnly>
    </ProtectedRoute>
  );
};

export default Admin;
