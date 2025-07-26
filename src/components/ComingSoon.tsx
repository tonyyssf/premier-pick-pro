import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Sparkles, TrendingUp, BarChart3 } from 'lucide-react';

const ComingSoon: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Insights Dashboard
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Deep analytics and performance insights coming soon
        </p>
        <Badge variant="secondary" className="text-sm px-4 py-2">
          <Clock className="w-4 h-4 mr-2" />
          In Development
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Performance Analytics */}
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 text-sm">
              Track your pick accuracy, efficiency trends, and performance over time
            </p>
          </CardContent>
        </Card>

        {/* Team Analysis */}
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Team Analysis</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 text-sm">
              Analyze team performance patterns and optimize your pick strategy
            </p>
          </CardContent>
        </Card>

        {/* Smart Recommendations */}
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Smart Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 text-sm">
              AI-powered pick suggestions based on historical data and trends
            </p>
          </CardContent>
        </Card>

        {/* Season Projections */}
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-lg">Season Projections</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 text-sm">
              Predict your final standings and optimize for the long game
            </p>
          </CardContent>
        </Card>

        {/* League Comparisons */}
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-lg">League Comparisons</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 text-sm">
              Compare your performance across different leagues and formats
            </p>
          </CardContent>
        </Card>

        {/* Export & Reports */}
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <CardTitle className="text-lg">Export & Reports</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 text-sm">
              Generate detailed reports and export your data for analysis
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Stay Tuned for Advanced Analytics
            </h3>
            <p className="text-gray-600 mb-4">
              We're working hard to bring you comprehensive insights that will help you make better picks and dominate your leagues.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                Performance Tracking
              </Badge>
              <Badge variant="outline" className="text-xs">
                AI Recommendations
              </Badge>
              <Badge variant="outline" className="text-xs">
                Advanced Analytics
              </Badge>
              <Badge variant="outline" className="text-xs">
                Export Features
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComingSoon; 