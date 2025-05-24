import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Gift, 
  Home, 
  Image, 
  LogOut, 
  Menu, 
  PlusCircle, 
  Settings, 
  User, 
  Users, 
  X,
  Shield,
  CreditCard 
} from 'lucide-react';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';

const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user?.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user role:', error);
        setIsAdmin(false);
        return;
      }

      // Set admin status based on data, defaulting to false if no data
      setIsAdmin(data?.role === 'admin' || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Redirect if not authenticated
  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <Link to="/" className="flex items-center space-x-2">
              <Calendar className="h-7 w-7 text-primary-600" />
              <span className="text-lg font-serif font-bold text-gray-900">
                Save<span className="text-primary-600">The</span><span className="text-secondary-600">Date</span>
              </span>
            </Link>
            <button 
              className="lg:hidden" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-1">
              <Link
                to="/dashboard"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  isActive('/dashboard') && !isActive('/dashboard/create-event')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              
              <Link
                to="/dashboard/create-event"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  isActive('/dashboard/create-event')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <PlusCircle className="mr-3 h-5 w-5" />
                Create Event
              </Link>

              <Link
                to="/dashboard/payment-methods"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  isActive('/dashboard/payment-methods')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="mr-3 h-5 w-5" />
                Payment Methods
              </Link>

              {isAdmin && (
                <Link
                  to="/dashboard/admin"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive('/dashboard/admin')
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="mr-3 h-5 w-5" />
                  Admin Panel
                </Link>
              )}
              
              <div className="pt-4 pb-2">
                <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Your Events
                </h3>
              </div>
              
              {/* This would be dynamic based on user's events */}
              <div className="space-y-1">
                <Link
                  to="/dashboard/events/sample-event-id"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive('/dashboard/events/sample-event-id')
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  Wedding Day
                </Link>
              </div>
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <Link to="/dashboard/settings">
                <button className="p-1 rounded-full text-gray-400 hover:text-gray-500">
                  <Settings className="h-6 w-6" />
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;