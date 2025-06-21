
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeagueAnalytics } from '@/components/LeagueAnalytics';
import { UserEngagementMetrics } from '@/components/UserEngagementMetrics';
import { PerformanceReports } from '@/components/PerformanceReports';
import { BarChart3, Users, TrendingUp } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reporting</h1>
        <p className="text-gray-600">
          Comprehensive insights into league performance, user engagement, and system metrics.
        </p>
      </div>

      <Tabs defaultValue="leagues" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leagues" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>League Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>User Engagement</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Performance Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leagues" className="space-y-6">
          <LeagueAnalytics />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserEngagementMetrics />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};
