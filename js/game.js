import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL   = "https://pckkopvifrnbzzapmiyb.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_wceBqsl7CVdEyGP_hRm_Zg_lv7Ixz3k"
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

let jugadorId = null

export const getJugadorId = () => jugadorId

export async function registrarJugador(alias, lado) {
  const { data, error } = await db
    .from('jugadores')
    .insert({ alias, lado })
    .select('id')
    .single()
  if (error) throw error
  jugadorId = data.id

  // Eliminar al cerrar/recargar la página
  window.addEventListener('beforeunload', () => {
    if (!jugadorId) return
    fetch(`${SUPABASE_URL}/rest/v1/jugadores?id=eq.${jugadorId}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      keepalive: true
    })
  })

  return data.id
}

export async function cambiarLado(nuevoLado) {
  if (!jugadorId) throw new Error('No hay jugador registrado')
  const { error } = await db
    .from('jugadores').update({ lado: nuevoLado }).eq('id', jugadorId)
  if (error) throw error
}

export async function eliminarJugador() {
  if (!jugadorId) return
  const id = jugadorId
  jugadorId = null
  await db.from('jugadores').delete().eq('id', id)
}

export async function obtenerJugadores() {
  const { data, error } = await db
    .from('jugadores')
    .select('id, alias, lado, created_at')
    .order('created_at', { ascending: true })
  if (error) throw error
  return {
    izquierda: data.filter(j => j.lado === 'LEFT'),
    derecha:   data.filter(j => j.lado === 'RIGHT'),
    total: data.length,
    todos: data
  }
}

export function calcularDesplazamiento(izquierda, derecha) {
  return Math.max(-150, Math.min(150, (izquierda - derecha) * 50))
}

const DURACION_MS = 90 * 1000

export function calcularEstadoPartida(todos) {
  if (todos.length < 3) {
    return { estado: 'esperando', tiempoRestante: null, ganador: null }
  }
  const inicio   = new Date(todos[2].created_at).getTime()
  const elapsed  = Date.now() - inicio

  if (elapsed >= DURACION_MS) {
    const izq     = todos.filter(j => j.lado === 'LEFT').length
    const der     = todos.filter(j => j.lado === 'RIGHT').length
    const ganador = izq > der ? 'LEFT' : der > izq ? 'RIGHT' : 'EMPATE'
    return { estado: 'terminado', tiempoRestante: 0, ganador }
  }

  return {
    estado: 'jugando',
    tiempoRestante: Math.ceil((DURACION_MS - elapsed) / 1000),
    ganador: null,
    inicioMs: inicio
  }
}

export async function reiniciarJuego() {
  jugadorId = null
  const { error } = await db.from('jugadores').delete().gte('id', 1)
  if (error) throw error
}

export function suscribirCambios(onCambio) {
  db.channel('jugadores-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jugadores' }, onCambio)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jugadores' }, onCambio)
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'jugadores' }, onCambio)
    .subscribe()
}
