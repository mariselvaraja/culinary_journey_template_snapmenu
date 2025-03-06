import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
  throw new Error('Missing Supabase URL configuration. Please check your environment variables.');
}

if (!supabaseKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
  throw new Error('Missing Supabase key configuration. Please check your environment variables.');
}

console.log('Initializing Supabase clients with URL:', supabaseUrl);

// Create auth client with session persistence
export const authClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Create public client without auth
export const publicClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storage: null
  }
});

// Test the auth client
authClient.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
});

// Test the public client
publicClient
  .from('configurations')
  .select('value')
  .eq('key', 'reservation')
  .single()
  .then(({ data, error }) => {
    if (error) {
      console.error('Public client test failed:', error);
    } else {
      console.log('Public client test successful');
    }
  })
  .catch(err => {
    console.error('Public client test error:', err);
  });

// For backward compatibility
export const supabase = authClient;
