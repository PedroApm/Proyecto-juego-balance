const CUERDA_Y = 1.5
const CUERDA_Z  = -4
const MAX_FIGURAS = 5

function anim(el, to, dur = 600) {
  if (!el) return
  el.setAttribute('animation__pos', {
    property: 'position',
    to,
    dur,
    easing: 'easeOutElastic'
  })
}

export function actualizarCuerda(desplazamiento) {
  const x = desplazamiento / 75   // max 150 → ±2 unidades A-Frame

  anim(document.getElementById('cuerda'),       `${x} ${CUERDA_Y} ${CUERDA_Z}`)
  anim(document.getElementById('extremo-left'), `${x - 2.5} ${CUERDA_Y} ${CUERDA_Z}`)
  anim(document.getElementById('extremo-right'),`${x + 2.5} ${CUERDA_Y} ${CUERDA_Z}`)
  anim(document.getElementById('texto-left-3d'),`${x - 2.5} ${CUERDA_Y + 0.6} ${CUERDA_Z}`)
  anim(document.getElementById('texto-right-3d'),`${x + 2.5} ${CUERDA_Y + 0.6} ${CUERDA_Z}`)

  // Sonido inmersivo cuando un lado domina
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

export function actualizarJugadoresVisuales(cantidadIzquierda, cantidadDerecha) {
  const grupoLeft  = document.getElementById('jugadores-left')
  const grupoRight = document.getElementById('jugadores-right')
  if (!grupoLeft || !grupoRight) return

  renderizarFiguras(grupoLeft,  cantidadIzquierda, -1)
  renderizarFiguras(grupoRight, cantidadDerecha,    1)

  document.getElementById('marcador-left-3d')
    ?.setAttribute('value', `LEFT\n${cantidadIzquierda}`)
  document.getElementById('marcador-right-3d')
    ?.setAttribute('value', `RIGHT\n${cantidadDerecha}`)
}

function renderizarFiguras(grupo, cantidad, dir) {
  while (grupo.firstChild) grupo.removeChild(grupo.firstChild)

  const mostrar = Math.min(cantidad, MAX_FIGURAS)
  for (let i = 0; i < mostrar; i++) {
    const fig = document.createElement('a-box')
    fig.setAttribute('position', `${dir * (3.2 + i * 0.65)} 0.5 ${CUERDA_Z}`)
    fig.setAttribute('width',  '0.35')
    fig.setAttribute('height', '1')
    fig.setAttribute('depth',  '0.35')
    fig.setAttribute('color',  dir < 0 ? '#4aaeff' : '#ff8844')
    fig.setAttribute('opacity', '0.9')
    fig.setAttribute('animation', `property: position; dir: alternate; loop: true;
      to: ${dir * (3.2 + i * 0.65)} 0.6 ${CUERDA_Z}; dur: ${900 + i * 120}; easing: easeInOutSine`)
    grupo.appendChild(fig)
  }

  if (cantidad > MAX_FIGURAS) {
    const lbl = document.createElement('a-text')
    lbl.setAttribute('position', `${dir * (3.2 + (MAX_FIGURAS - 1) * 0.65)} 1.9 ${CUERDA_Z}`)
    lbl.setAttribute('value',  `+${cantidad - MAX_FIGURAS}`)
    lbl.setAttribute('align',  'center')
    lbl.setAttribute('color',  '#fff')
    lbl.setAttribute('scale',  '1.5 1.5 1.5')
    grupo.appendChild(lbl)
  }
}
