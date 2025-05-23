import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Users, Calendar, DollarSign, AlertTriangle, Download } from 'lucide-react';
import { getAdminStats, getSystemHealth } from '../../lib/admin';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, healthData] = await Promise.all([
        getAdminStats(),
        getSystemHealth()
      ]);
      setStats(statsData);
      setHealth(healthData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      // Implementation for data export
      toast.success('Data export started');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage system performance</p>
        </div>
        <Button onClick={exportData} leftIcon={<Download className="w-4 h-4" />}>
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">{stats?.totalEvents || 0}</p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-full">
                <Calendar className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ₦{(stats?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <DollarSign className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-2xl font-bold capitalize">{health?.status || 'Unknown'}</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent System Logs</h2>
            <div className="space-y-4">
              {health?.recentErrors?.map((error: any) => (
                <div key={error.id} className="p-4 bg-error-50 rounded-lg">
                  <p className="text-error-700 font-medium">{error.message}</p>
                  <p className="text-sm text-error-600">
                    {new Date(error.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
              {!health?.recentErrors?.length && (
                <p className="text-gray-500">No recent errors</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Average Revenue per User</p>
                <p className="font-medium">
                  ₦{(stats?.averageRevenuePerUser || 0).toLocaleString()}
                </p>
              </div>
              {/* Add more revenue metrics here */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;