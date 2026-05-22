const CUERDA_Y  = 1.5
const CUERDA_Z  = -3
const MAX_FIGURAS = 5

const SKINS_DEFAULT = ['alien1','alien2','alien3','alien4','astro1','astro2','astro3','astro4','astro5']

function anim(el, to, dur = 600) {
  if (!el) return
  el.setAttribute('animation__pos', { property: 'position', to, dur, easing: 'easeOutElastic' })
}

export function actualizarCuerda(desplazamiento) {
  const x = desplazamiento / 75

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
    const x = dir * (5 + i * 0.9)
    const skin = j.skin || SKINS_DEFAULT[i % SKINS_DEFAULT.length]
    const teamColor = dir < 0 ? '#4aaeff' : '#ff8844'

    // Wrapper con animación flotante
    const wrapper = document.createElement('a-entity')
    wrapper.setAttribute('position', `${x} 0 ${CUERDA_Z}`)
    wrapper.setAttribute('animation__float',
      `property: position; dir: alternate; loop: true; ` +
      `to: ${x} 0.25 ${CUERDA_Z}; dur: ${900 + i * 130}; easing: easeInOutSine`)

    // Modelo GLB del personaje
    const fig = document.createElement('a-gltf-model')
    fig.setAttribute('src', `#model-${skin}`)
    fig.setAttribute('scale', '5 5 5')
    fig.setAttribute('rotation', `0 ${dir < 0 ? 90 : -90} 0`)
    wrapper.appendChild(fig)

    // Nombre grande y legible sobre el personaje
    const lbl = document.createElement('a-text')
    lbl.setAttribute('position', `0 3.2 0.05`)
    lbl.setAttribute('value', j.alias || '?')
    lbl.setAttribute('align', 'center')
    lbl.setAttribute('color', teamColor)
    lbl.setAttribute('scale', '5 5 5')
    lbl.setAttribute('width', '0.7')
    lbl.setAttribute('side', 'double')
    wrapper.appendChild(lbl)

    grupo.appendChild(wrapper)
  }

  if (jugadores.length > MAX_FIGURAS) {
    const x = dir * (5 + (MAX_FIGURAS - 1) * 0.9)
    const extra = document.createElement('a-text')
    extra.setAttribute('position', `${x} 4.0 ${CUERDA_Z}`)
    extra.setAttribute('value', `+${jugadores.length - MAX_FIGURAS}`)
    extra.setAttribute('align', 'center')
    extra.setAttribute('color', '#ffffff')
    extra.setAttribute('scale', '2.5 2.5 2.5')
    grupo.appendChild(extra)
  }
}
