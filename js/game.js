import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = "https://pckkopvifrnbzzapmiyb.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_wceBqsl7CVdEyGP_hRm_Zg_lv7Ixz3k"
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

let jugadorId = null

export async function registrarJugador(alias, lado) {
  const { data, error } = await db
    .from('jugadores')
    .insert({ alias, lado })
    .select('id')
    .single()

  if (error) throw error
  jugadorId = data.id
  return data.id
}

export async function cambiarLado(nuevoLado) {
  if (!jugadorId) throw new Error('No hay jugador registrado')

  const { error } = await db
    .from('jugadores')
    .update({ lado: nuevoLado })
    .eq('id', jugadorId)

  if (error) throw error
}

export async function obtenerConteo() {
  const { data, error } = await db
    .from('jugadores')
    .select('lado')

  if (error) throw error

  const izquierda = data.filter(j => j.lado === 'LEFT').length
  const derecha = data.filter(j => j.lado === 'RIGHT').length
  return { izquierda, derecha }
}

export function calcularDesplazamiento(izquierda, derecha) {
  const diferencia = izquierda - derecha
  const desplazamiento = diferencia * 50
  return Math.max(-150, Math.min(150, desplazamiento))
}

export function suscribirCambios(onCambio) {
  db.channel('jugadores-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jugadores' }, onCambio)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jugadores' }, onCambio)
    .subscribe()
}
