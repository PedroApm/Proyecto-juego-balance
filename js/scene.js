// Scene management
import { obtenerConteo, calcularDesplazamiento, suscribirCambios } from './game.js'

const CUERDA_Y = 1.5
const CUERDA_Z = -4
const MAX_FIGURAS = 5

export function actualizarCuerda(desplazamiento) {
  const cuerda = document.getElementById('cuerda')
  if (!cuerda) return
  const x = desplazamiento / 100
  cuerda.setAttribute('animation__pos', {
    property: 'position',
    to: `${x} ${CUERDA_Y} ${CUERDA_Z}`,
    dur: 600,
    easing: 'easeOutElastic'
  })

  const textoLeft = document.getElementById('texto-left-3d')
  const textoRight = document.getElementById('texto-right-3d')
  if (textoLeft) textoLeft.setAttribute('animation__pos', {
    property: 'position',
    to: `${x - 2.5} ${CUERDA_Y + 0.5} ${CUERDA_Z}`,
    dur: 600,
    easing: 'easeOutElastic'
  })
  if (textoRight) textoRight.setAttribute('animation__pos', {
    property: 'position',
    to: `${x + 2.5} ${CUERDA_Y + 0.5} ${CUERDA_Z}`,
    dur: 600,
    easing: 'easeOutElastic'
  })

  // Sonido inmersivo si supera 100 unidades
  const sonidoLeft = document.getElementById('sonido-left')
  const sonidoRight = document.getElementById('sonido-right')
  if (Math.abs(desplazamiento) > 100) {
    if (desplazamiento > 0) {
      sonidoRight?.setAttribute('sound', 'src: #audio-tension; autoplay: false')
      sonidoLeft?.setAttribute('sound', 'src: #audio-tension; autoplay: true; loop: true')
    } else {
      sonidoLeft?.setAttribute('sound', 'src: #audio-tension; autoplay: false')
      sonidoRight?.setAttribute('sound', 'src: #audio-tension; autoplay: true; loop: true')
    }
  } else {
    sonidoLeft?.setAttribute('sound', 'src: #audio-ambient; autoplay: false')
    sonidoRight?.setAttribute('sound', 'src: #audio-ambient; autoplay: false')
  }
}

export function actualizarJugadoresVisuales(cantidadIzquierda, cantidadDerecha) {
  const grupoLeft = document.getElementById('jugadores-left')
  const grupoRight = document.getElementById('jugadores-right')
  if (!grupoLeft || !grupoRight) return

  renderizarFiguras(grupoLeft, cantidadIzquierda, -1)
  renderizarFiguras(grupoRight, cantidadDerecha, 1)

  // Actualizar texto 3D del marcador
  document.getElementById('marcador-left-3d')
    ?.setAttribute('value', `LEFT\n${cantidadIzquierda}`)
  document.getElementById('marcador-right-3d')
    ?.setAttribute('value', `RIGHT\n${cantidadDerecha}`)
}

function renderizarFiguras(grupo, cantidad, direccion) {
  // Limpiar figuras anteriores
  while (grupo.firstChild) grupo.removeChild(grupo.firstChild)

  const mostrar = Math.min(cantidad, MAX_FIGURAS)
  for (let i = 0; i < mostrar; i++) {
    const figura = document.createElement('a-box')
    const x = direccion * (3 + i * 0.7)
    figura.setAttribute('position', `${x} 0.5 ${CUERDA_Z}`)
    figura.setAttribute('width', '0.4')
    figura.setAttribute('height', '1')
    figura.setAttribute('depth', '0.4')
    figura.setAttribute('color', direccion < 0 ? '#4aaeff' : '#ff8844')
    figura.setAttribute('opacity', '0.85')
    grupo.appendChild(figura)
  }

  // Si hay más del límite visual, mostrar contador encima del último
  if (cantidad > MAX_FIGURAS) {
    const label = document.createElement('a-text')
    const x = direccion * (3 + (MAX_FIGURAS - 1) * 0.7)
    label.setAttribute('position', `${x} 1.8 ${CUERDA_Z}`)
    label.setAttribute('value', `+${cantidad - MAX_FIGURAS}`)
    label.setAttribute('align', 'center')
    label.setAttribute('color', '#fff')
    label.setAttribute('scale', '1.5 1.5 1.5')
    grupo.appendChild(label)
  }
}

// Conectar con game.js y suscribir a cambios en tiempo real
async function iniciarEscena() {
  const { izquierda, derecha } = await obtenerConteo()
  const d = calcularDesplazamiento(izquierda, derecha)
  actualizarCuerda(d)
  actualizarJugadoresVisuales(izquierda, derecha)

  suscribirCambios(async () => {
    const { izquierda: iz, derecha: de } = await obtenerConteo()
    const despl = calcularDesplazamiento(iz, de)
    actualizarCuerda(despl)
    actualizarJugadoresVisuales(iz, de)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene')
  if (scene) {
    scene.addEventListener('loaded', iniciarEscena)
  }
})
