
import React from 'react';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminOnly } from '@/components/AdminOnly';
import { AdminDataSync } from '@/components/AdminDataSync';
import { AdminDataTable } from '@/components/AdminDataTable';
import { Shield } from 'lucide-react';

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
                Manage your football picks application data and settings.
              </p>
            </div>

            <div className="space-y-8">
              <AdminDataSync />
              <AdminDataTable />
            </div>
          </div>
        </Layout>
      </AdminOnly>
    </ProtectedRoute>
  );
};

export default Admin;
