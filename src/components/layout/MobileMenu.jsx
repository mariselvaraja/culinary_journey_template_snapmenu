import React from 'react';
import { X, Utensils, Settings, LogIn, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useContent } from '@/context/contexts/ContentContext';
import { useAuth } from '@/context/contexts/AuthContext';

export function MobileMenu({ isOpen, onClose, onNavigate }) {
  const { content } = useContent();
  const auth = useAuth();
  const navigate = useNavigate();
  const links = content?.navigation?.links || [];

  console.log('MobileMenu auth state:', { session: auth.session, loading: auth.loading });

  if (!isOpen) return null;

  const isAuthenticated = !!auth.session;

  const handleLogout = async () => {
    try {
      console.log('Mobile menu: logging out...');
      await auth.signOut();
      console.log('Mobile menu: logout successful');
      onClose();
      navigate('/');
    } catch (err) {
      console.error('Mobile menu: logout error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4">
          <Link to="/" className="flex items-center space-x-2 text-white" onClick={onClose}>
            <Utensils className="h-6 w-6" />
            <span className="text-2xl font-serif">Maison</span>
          </Link>
          <button onClick={onClose} className="text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="flex flex-col space-y-4 px-4">
            {links.map((link, index) => {
              // Skip admin link from content if user is not authenticated
              if (link.path === '/admin' && !isAuthenticated) return null;
              // Skip admin link from content if it's already shown
              if (link.path === '/admin' && isAuthenticated) return null;
              return (
                <Link
                  key={index}
                  to={link.path}
                  className="text-white/80 hover:text-white py-2 text-lg font-light"
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              );
            })}
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/admin"
                  className="text-white/80 hover:text-white py-2 text-lg font-light flex items-center gap-2"
                  onClick={onClose}
                >
                  <Settings className="h-5 w-5" />
                  Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white/80 hover:text-white py-2 text-lg font-light flex items-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-white/80 hover:text-white py-2 text-lg font-light flex items-center gap-2"
                onClick={onClose}
              >
                <LogIn className="h-5 w-5" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
