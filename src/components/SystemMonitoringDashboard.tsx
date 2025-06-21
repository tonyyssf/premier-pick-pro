
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiMonitoring } from '@/components/ApiMonitoring';
import { SystemHealthMonitor } from '@/components/SystemHealthMonitor';
import { ErrorLogsMonitor } from '@/components/ErrorLogsMonitor';
import { Activity, Heart, AlertTriangle } from 'lucide-react';

export const SystemMonitoringDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Monitoring</h1>
        <p className="text-gray-600">
          Monitor system health, API performance, and debug issues in real-time.
        </p>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>API Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>System Health</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Error Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-6">
          <ApiMonitoring />
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <SystemHealthMonitor />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <ErrorLogsMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};
