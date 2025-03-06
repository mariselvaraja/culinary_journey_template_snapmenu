import React, { createContext, useContext, useState, useEffect } from 'react';
import { authClient } from '@/lib/supabase';

export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize auth state
  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    // Get initial session
    authClient.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('AuthProvider: Session error:', error);
        setError(error.message);
      } else {
        console.log('AuthProvider: Initial session:', session?.user?.email);
        console.log('AuthProvider: User metadata:', session?.user?.user_metadata);
        setSession(session);
        
        // Check admin role
        const userRole = session?.user?.user_metadata?.role;
        console.log('AuthProvider: User role:', userRole);
        setIsAdmin(userRole === 'admin');

        // If no role is set, set admin role for development
        if (session?.user && !userRole) {
          setAdminRole();
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authClient.auth.onAuthStateChange((_event, session) => {
      console.log('AuthProvider: Auth state changed:', session?.user?.email);
      console.log('AuthProvider: User metadata:', session?.user?.user_metadata);
      setSession(session);
      
      // Check admin role on auth change
      const userRole = session?.user?.user_metadata?.role;
      console.log('AuthProvider: User role:', userRole);
      setIsAdmin(userRole === 'admin');

      // If no role is set, set admin role for development
      if (session?.user && !userRole) {
        setAdminRole();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setAdminRole = async () => {
    try {
      if (!session?.user) {
        console.error('AuthProvider: No user session found');
        return;
      }

      console.log('AuthProvider: Setting admin role for user:', session.user.email);
      
      const { data, error } = await authClient.auth.updateUser({
        data: { role: 'admin' }
      });

      if (error) {
        console.error('AuthProvider: Error setting admin role:', error);
        throw error;
      }

      console.log('AuthProvider: Updated user metadata:', data.user.user_metadata);
      setSession({ ...session, user: data.user });
      setIsAdmin(true);
    } catch (err) {
      console.error('AuthProvider: Error in setAdminRole:', err);
      setError(err.message);
    }
  };

  const signIn = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      console.log('AuthProvider: Signing in...');
      
      const { data, error } = await authClient.auth.signInWithPassword(credentials);
      
      if (error) {
        console.error('AuthProvider: Sign in error:', error);
        throw error;
      }
      
      console.log('AuthProvider: Sign in successful:', data.user?.email);
      console.log('AuthProvider: User metadata:', data.user?.user_metadata);
      
      // Check admin role after sign in
      const userRole = data.user?.user_metadata?.role;
      console.log('AuthProvider: User role:', userRole);
      setIsAdmin(userRole === 'admin');

      // If no role is set, set admin role for development
      if (data.user && !userRole) {
        await setAdminRole();
      }
      
      setSession(data.session);
      return { data, error: null };
    } catch (err) {
      console.error('AuthProvider: Sign in error:', err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('AuthProvider: Signing out...');
      
      const { error } = await authClient.auth.signOut();
      
      if (error) {
        console.error('AuthProvider: Sign out error:', error);
        throw error;
      }
      
      console.log('AuthProvider: Sign out successful');
      setSession(null);
      setIsAdmin(false);
    } catch (err) {
      console.error('AuthProvider: Sign out error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    loading,
    error,
    signIn,
    signOut,
    isAdmin,
    setAdminRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
