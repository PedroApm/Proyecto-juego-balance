import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'

const SUPABASE_URL = "https://pckkopvifrnbzzapmiyb.supabase.co"
const SUPABASE_ANON_KEY = "TU_PUBLISHABLE_KEY_AQUI"

window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
