import { createClient } from '@supabase/supabase-js';

// Replace with your actual project URL and anon public key from Supabase Dashboard -> Settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jpcnqthawkjdsofjxhdp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwY25xdGhhd2tqZHNvZmp4aGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMTQzNTAsImV4cCI6MjEwMzY5MDM1MH0.n8zgQJ1EbMubIZDre7j6-QcalztnMvDBEuihIQHsPJ4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);