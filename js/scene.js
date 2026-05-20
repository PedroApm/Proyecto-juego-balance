const CUERDA_Y  = 1.5
const CUERDA_Z  = -3
const MAX_FIGURAS = 5

function anim(el, to, dur = 600) {
  if (!el) return
  el.setAttribute('animation__pos', { property: 'position', to, dur, easing: 'easeOutElastic' })
}

export function actualizarCuerda(desplazamiento) {
  const x = desplazamiento / 75   // max ±150 → ±2 unidades

  anim(document.getElementById('cuerda'),         `${x} ${CUERDA_Y} ${CUERDA_Z}`)
  anim(document.getElementById('extremo-left'),   `${x - 4} ${CUERDA_Y} ${CUERDA_Z}`)
  anim(document.getElementById('extremo-right'),  `${x + 4} ${CUERDA_Y} ${CUERDA_Z}`)
  anim(document.getElementById('texto-left-3d'),  `${x - 4} ${CUERDA_Y + 0.55} ${CUERDA_Z}`)
  anim(document.getElementById('texto-right-3d'), `${x + 4} ${CUERDA_Y + 0.55} ${CUERDA_Z}`)

  const sonidoLeft  = document.getElementById('sonido-left')
  const sonidoRight = document.getElementById('sonido-right')

  if (Math.abs(desplazamiento) > 100) {
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
    const j = jugadores[i]
    const x = dir * (5 + i * 0.7)

    // Cuerpo (a-box)
    const fig = document.createElement('a-box')
    fig.setAttribute('position', `${x} 0.5 ${CUERDA_Z}`)
    fig.setAttribute('width',  '0.4')
    fig.setAttribute('height', '1')
    fig.setAttribute('depth',  '0.4')
    fig.setAttribute('color',  dir < 0 ? '#4aaeff' : '#ff8844')
    fig.setAttribute('opacity', '0.92')
    fig.setAttribute('animation', `property: position; dir: alternate; loop: true;
      to: ${x} 0.62 ${CUERDA_Z}; dur: ${900 + i * 130}; easing: easeInOutSine`)
    grupo.appendChild(fig)

    // Alias encima
    const lbl = document.createElement('a-text')
    lbl.setAttribute('position', `${x} 1.3 ${CUERDA_Z + 0.21}`)
    lbl.setAttribute('value', j.alias || '?')
    lbl.setAttribute('align', 'center')
    lbl.setAttribute('color', '#ffffff')
    lbl.setAttribute('scale', '1.1 1.1 1.1')
    lbl.setAttribute('width', '1.8')
    grupo.appendChild(lbl)
  }

  if (jugadores.length > MAX_FIGURAS) {
    const x = dir * (5 + (MAX_FIGURAS - 1) * 0.7)
    const extra = document.createElement('a-text')
    extra.setAttribute('position', `${x} 2.1 ${CUERDA_Z}`)
    extra.setAttribute('value', `+${jugadores.length - MAX_FIGURAS}`)
    extra.setAttribute('align', 'center')
    extra.setAttribute('color', '#fff')
    extra.setAttribute('scale', '1.5 1.5 1.5')
    grupo.appendChild(extra)
  }
}
