import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yrjlxcckarqbpslljpcj.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyamx4Y2NrYXJxYnBzbGxqcGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNjUyODQsImV4cCI6MjA4Mjc0MTI4NH0.xQbLEBRkKut-Ku0Qkj9ZdiDjTVrYHBoiJkg3U6F4lCM'

export const supabase = createClient(supabaseUrl, supabaseKey)

export const hasSupabase = Boolean(supabaseUrl && supabaseKey)
