// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nrlxuiorheypaxypesrn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybHh1aW9yaGV5cGF4eXBlc3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODkwMDgsImV4cCI6MjA2Mzg2NTAwOH0.rtlrYmTaDHu2V4lsVF25zBT0Bz7gXEqK10qX-wE2-vE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});