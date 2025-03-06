import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Settings, 
  Menu as MenuIcon, 
  Upload, 
  FileJson, 
  Layout,
  BarChart2,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Package
} from 'lucide-react';
import { useAuth } from '@/context/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, signOut, loading } = useAuth();
  const currentPath = location.pathname;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  const navigation = [
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart2,
      current: currentPath === '/admin/analytics'
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: Package,
      current: currentPath === '/admin/orders'
    },
    {
      name: 'Reservations',
      href: '/admin/reservations',
      icon: Calendar,
      current: currentPath === '/admin/reservations'
    },
    {
      name: 'Tables',
      href: '/admin/tables',
      icon: Users,
      current: currentPath === '/admin/tables'
    },
    {
      name: 'Reservation Settings',
      href: '/admin/reservation-config',
      icon: Settings,
      current: currentPath === '/admin/reservation-config'
    },
    {
      name: 'Menu Upload',
      href: '/admin/menu-upload',
      icon: Upload,
      current: currentPath === '/admin/menu-upload'
    },
    {
      name: 'View Menu JSON',
      href: '/admin/view-menu',
      icon: FileJson,
      current: currentPath === '/admin/view-menu'
    },
    {
      name: 'View Site Content',
      href: '/admin/view-content',
      icon: Layout,
      current: currentPath === '/admin/view-content'
    }
  ];

  const handleLogout = async () => {
    try {
      console.log('AdminDashboard: Logging out...');
      await signOut();
      console.log('AdminDashboard: Logout successful');
      navigate('/');
    } catch (err) {
      console.error('AdminDashboard: Logout error:', err);
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 bg-white border-b border-neutral-200 transition-all duration-300 ${isSidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={handleHomeClick}
                className="flex items-center hover:text-orange-700"
              >
                <MenuIcon className="h-8 w-8 text-orange-600" />
                <span className="ml-2 text-xl font-medium text-gray-900">Admin Dashboard</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`fixed left-0 h-full bg-white border-r border-neutral-200 overflow-y-auto transition-all duration-300 ease-in-out z-30 ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute right-0 top-24 -mr-3 bg-white border border-neutral-200 rounded-full p-1.5 hover:bg-neutral-50 z-50"
        >
          {isSidebarCollapsed ? 
            <ChevronRight className="h-4 w-4 text-gray-600" /> : 
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          }
        </button>
        <nav className="p-4 pt-20 space-y-1 relative">
          {navigation.map((item) => (
            <div key={item.name} className="relative group">
              <Link
                to={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg
                  transition-all duration-150 ease-in-out
                  group relative
                  ${item.current
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon
                  className={`
                    h-5 w-5
                    ${item.current ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'}
                    ${isSidebarCollapsed ? '' : 'mr-3'}
                  `}
                />
                {!isSidebarCollapsed && (
                  <>
                    <span>{item.name}</span>
                    <ChevronRight 
                      className={`
                        absolute right-2 h-4 w-4 transition-transform duration-150
                        ${item.current ? 'text-orange-500 transform rotate-90' : 'text-gray-400'}
                      `}
                    />
                  </>
                )}
              </Link>
              {/* Tooltip for collapsed state */}
              {isSidebarCollapsed && (
                <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <main className="p-6 min-h-screen pb-20 pt-20">
          <Outlet />
        </main>
        {/* Footer */}
        <footer className="fixed bottom-0 right-0 bg-white border-t border-neutral-200 py-4 px-6 z-40 transition-all duration-300"
          style={{ width: `calc(100% - ${isSidebarCollapsed ? '4rem' : '16rem'})` }}>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">© 2024 SnapMenu. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
