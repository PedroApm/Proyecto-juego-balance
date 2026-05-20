import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'

const SUPABASE_URL = "https://pckkopvifrnbzzapmiyb.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_wceBqsl7CVdEyGP_hRm_Zg_lv7Ixz3k" // Conexión configurada por Equipo

window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
