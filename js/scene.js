const CUERDA_ALTURA = 1.0   // metros sobre la superficie esférica
const CUERDA_Z      = -3
const MAX_FIGURAS   = 5

const ESFERA_R  = 30
const ESFERA_CY = -30
const ESFERA_CZ = -5

const DESPLAZAMIENTO_MAX = 150;
const REGLA_Y = 0.19;
const REGLA_Z = -3.02;

const SKINS_DEFAULT = ['alien1','alien2','alien3','alien4','astro1','astro2','astro3','astro4','astro5']

function getSuperficieY(x, z) {
  const d2 = ESFERA_R * ESFERA_R - x * x - (z - ESFERA_CZ) * (z - ESFERA_CZ)
  return d2 > 0 ? ESFERA_CY + Math.sqrt(d2) : 0
}

function anim(el, to, dur = 600) {
  if (!el) return
  el.setAttribute('animation__pos', { property: 'position', to, dur, easing: 'easeOutElastic' })
}

// desplazamiento a posición X visual 
function mapearDesplazamientoAX(desplazamiento) {
  const clamped = Math.max(-DESPLAZAMIENTO_MAX, Math.min(DESPLAZAMIENTO_MAX, desplazamiento))
  return (clamped / DESPLAZAMIENTO_MAX) * 4
}

function construirCuerdaCurva(cx, desplazamiento = 0) {
  const grupo = document.getElementById('cuerda-group')
  if (!grupo) return
  while (grupo.firstChild) grupo.removeChild(grupo.firstChild)

  const N = 8
  const xA = cx - 4
  const xB = cx + 4

  // NUEVO: intensidad visual según el desequilibrio
  const fuerza = Math.min(1, Math.abs(desplazamiento) / DESPLAZAMIENTO_MAX)

  // NUEVO: colores según lado dominante
  const colorBase = '#d4a96a'
  const colorLeft = '#4aaeff'
  const colorRight = '#ff8844'

  const colorDominante =
    desplazamiento < 0 ? colorLeft :
    desplazamiento > 0 ? colorRight :
    colorBase

  for (let i = 0; i < N; i++) {
    const t1 = i / N
    const t2 = (i + 1) / N
    const x1 = xA + t1 * (xB - xA)
    const x2 = xA + t2 * (xB - xA)
    const y1 = getSuperficieY(x1, CUERDA_Z) + CUERDA_ALTURA
    const y2 = getSuperficieY(x2, CUERDA_Z) + CUERDA_ALTURA

    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    const dx = x2 - x1
    const dy = y2 - y1
    const len = Math.sqrt(dx * dx + dy * dy)
    const angZ = Math.atan2(dy, dx) * 180 / Math.PI

    const seg = document.createElement('a-cylinder')
    seg.setAttribute('position', `${mx.toFixed(3)} ${my.toFixed(3)} ${CUERDA_Z}`)
    seg.setAttribute('radius', '0.09')
    seg.setAttribute('height', (len + 0.01).toFixed(3))
    seg.setAttribute('rotation', `0 0 ${(90 + angZ).toFixed(2)}`)

    // MODIFICADO: antes era color fijo '#d4a96a'
    seg.setAttribute('color', colorDominante)

    // NUEVO: la cuerda se ve más intensa con mayor desequilibrio
    seg.setAttribute('opacity', String(0.82 + fuerza * 0.18))

    seg.setAttribute('roughness', '0.7')
    seg.setAttribute('metalness', '0.1')
    grupo.appendChild(seg)
  }
}

export function actualizarCuerda(desplazamiento, tiempoRestante = null) {
  const cx = -desplazamiento / 75  // negado: más jugadores en LEFT → cuerda se va a la izquierda

    construirCuerdaCurva(cx, desplazamiento)

  const yL = getSuperficieY(cx - 4, CUERDA_Z) + CUERDA_ALTURA
  const yR = getSuperficieY(cx + 4, CUERDA_Z) + CUERDA_ALTURA

  anim(document.getElementById('extremo-left'),   `${cx - 4} ${yL.toFixed(3)} ${CUERDA_Z}`)
  anim(document.getElementById('extremo-right'),  `${cx + 4} ${yR.toFixed(3)} ${CUERDA_Z}`)
  anim(document.getElementById('texto-left-3d'),  `${cx - 4} ${(yL + 0.6).toFixed(3)} ${CUERDA_Z}`)
  anim(document.getElementById('texto-right-3d'), `${cx + 4} ${(yR + 0.6).toFixed(3)} ${CUERDA_Z}`)

  const indicador = document.getElementById('indicador-balance')
  const xIndicador = mapearDesplazamientoAX(desplazamiento)
  
  const sonidoLeft  = document.getElementById('sonido-left')
  const sonidoRight = document.getElementById('sonido-right')

  const ultimos30 = tiempoRestante !== null && tiempoRestante <= 30 && tiempoRestante > 0

  if (ultimos30 && desplazamiento !== 0) {
    const izqPierde = desplazamiento < 0
    sonidoLeft?.setAttribute('sound',
      `src: #audio-${izqPierde ? 'tension' : 'ambient'}; autoplay: true; loop: true; volume: ${izqPierde ? 0.7 : 0.3}`)
    sonidoRight?.setAttribute('sound',
      `src: #audio-${izqPierde ? 'ambient' : 'tension'}; autoplay: true; loop: true; volume: ${izqPierde ? 0.3 : 0.7}`)
  } else if (Math.abs(desplazamiento) > 100) {
    if (desplazamiento > 0) {
      sonidoRight?.setAttribute('sound', 'src: #audio-ambient; autoplay: false')
      sonidoLeft?.setAttribute('sound',  'src: #audio-tension; autoplay: true; loop: true; volume: 0.6')
    } else {
      sonidoLeft?.setAttribute('sound',  'src: #audio-ambient; autoplay: false')
      sonidoRight?.setAttribute('sound', 'src: #audio-tension; autoplay: true; loop: true; volume: 0.6')
    }
  } else {
    sonidoLeft?.setAttribute('sound',  'src: #audio-ambient; autoplay: true; loop: true; volume: 0.3')
    sonidoRight?.setAttribute('sound', 'src: #audio-ambient; autoplay: true; loop: true; volume: 0.3')
  }
}

export function actualizarJugadoresVisuales(jugadoresIzq, jugadoresDer) {
  const grupoLeft  = document.getElementById('jugadores-left')
  const grupoRight = document.getElementById('jugadores-right')
  if (!grupoLeft || !grupoRight) return

  renderizarFiguras(grupoLeft,  jugadoresIzq, -1)
  renderizarFiguras(grupoRight, jugadoresDer,  1)

  document.getElementById('marcador-left-3d')
    ?.setAttribute('value', `LEFT\n${jugadoresIzq.length}`)
  document.getElementById('marcador-right-3d')
    ?.setAttribute('value', `RIGHT\n${jugadoresDer.length}`)
}

function renderizarFiguras(grupo, jugadores, dir) {
  while (grupo.firstChild) grupo.removeChild(grupo.firstChild)

  const mostrar = Math.min(jugadores.length, MAX_FIGURAS)
  for (let i = 0; i < mostrar; i++) {
    const j      = jugadores[i]
    const x      = dir * (5 + i * 0.9)
    const skin   = j.skin || SKINS_DEFAULT[i % SKINS_DEFAULT.length]
    const surfY  = getSuperficieY(x, CUERDA_Z)

    const wrapper = document.createElement('a-entity')
    wrapper.setAttribute('position', `${x} ${surfY.toFixed(3)} ${CUERDA_Z}`)
    wrapper.setAttribute('animation__float',
      `property: position; dir: alternate; loop: true; ` +
      `to: ${x} ${(surfY + 0.25).toFixed(3)} ${CUERDA_Z}; dur: ${900 + i * 130}; easing: easeInOutSine`)

    const fig = document.createElement('a-gltf-model')
    fig.setAttribute('src', `#model-${skin}`)
    fig.setAttribute('scale', '15 15 15')
    fig.setAttribute('rotation', `0 ${dir < 0 ? 90 : -90} 0`)
    wrapper.appendChild(fig)

    const lbl = document.createElement('a-text')
    lbl.setAttribute('position', `0 3.0 0.1`)
    lbl.setAttribute('value', j.alias || '?')
    lbl.setAttribute('align', 'center')
    lbl.setAttribute('color', '#ffffff')
    lbl.setAttribute('scale', '4 4 4')
    lbl.setAttribute('width', '2')
    lbl.setAttribute('side', 'double')
    wrapper.appendChild(lbl)

    grupo.appendChild(wrapper)
  }

  if (jugadores.length > MAX_FIGURAS) {
    const x     = dir * (5 + (MAX_FIGURAS - 1) * 0.9)
    const surfY = getSuperficieY(x, CUERDA_Z)
    const extra = document.createElement('a-text')
    extra.setAttribute('position', `${x} ${(surfY + 7.0).toFixed(3)} ${CUERDA_Z}`)
    extra.setAttribute('value', `+${jugadores.length - MAX_FIGURAS}`)
    extra.setAttribute('align', 'center')
    extra.setAttribute('color', '#ffffff')
    extra.setAttribute('scale', '2.5 2.5 2.5')
    grupo.appendChild(extra)
  }
}

