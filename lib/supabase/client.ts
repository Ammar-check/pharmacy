"use client";

import { createBrowserClient } from "@supabase/ssr";

const FALLBACK_URL = "https://ndtmojatnuxjmogkazrd.supabase.co";
const FALLBACK_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kdG1vamF0bnV4am1vZ2thenJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mjk0ODUsImV4cCI6MjA3ODAwNTQ4NX0.aG2KuI8jJ81Tu-S1xD7n0d0BBLg92EBAgdoMdFbtZ80";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON;

// Create a single supabase browser client for interacting with your database
export const supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

export default supabaseClient;
