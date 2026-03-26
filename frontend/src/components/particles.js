// frontend/src/components/particles.js

const PARTICLE_COUNT = 80
const CONNECTION_DISTANCE = 120
const MOUSE_REPEL_RADIUS = 100

export function initParticles() {
  const canvas = document.getElementById('particles-canvas')
  const ctx = canvas.getContext('2d')
  let particles = []
  let mouse = { x: -9999, y: -9999 }
  let animId

  function resize() {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
  }

  function createParticle() {
    return {
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      vx:   (Math.random() - 0.5) * 0.4,
      vy:   (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 0.5,
    }
  }

  function init() {
    resize()
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle)
  }

  function getParticleColor(p) {
    return particles.indexOf(p) % 3 === 0
      ? 'rgba(6,182,212,'
      : 'rgba(124,58,237,'
  }

  function drawParticle(p) {
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = getParticleColor(p) + '0.7)'
    ctx.fill()
  }

  function drawConnection(a, b, dist) {
    const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.3
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.strokeStyle = `rgba(124,58,237,${alpha})`
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  function update(p) {
    const dx = p.x - mouse.x
    const dy = p.y - mouse.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < MOUSE_REPEL_RADIUS) {
      const force = (MOUSE_REPEL_RADIUS - dist) / MOUSE_REPEL_RADIUS * 0.6
      p.vx += (dx / dist) * force
      p.vy += (dy / dist) * force
    }

    p.vx *= 0.99
    p.vy *= 0.99

    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
    if (speed > 1.5) { p.vx *= 1.5 / speed; p.vy *= 1.5 / speed }

    p.x += p.vx
    p.y += p.vy

    if (p.x < 0)              p.x = canvas.width
    if (p.x > canvas.width)   p.x = 0
    if (p.y < 0)              p.y = canvas.height
    if (p.y > canvas.height)  p.y = 0
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < particles.length; i++) {
      update(particles[i])
      drawParticle(particles[i])

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < CONNECTION_DISTANCE) {
          drawConnection(particles[i], particles[j], dist)
        }
      }
    }

    animId = requestAnimationFrame(loop)
  }

  function onMouseMove(e) {
    mouse.x = e.clientX
    mouse.y = e.clientY
  }

  function onMouseLeave() {
    mouse.x = -9999
    mouse.y = -9999
  }

  init()
  loop()

  requestAnimationFrame(() => {
    canvas.classList.add('visible')
  })

  window.addEventListener('resize', () => { init() })
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseleave', onMouseLeave)

  return () => {
    cancelAnimationFrame(animId)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseleave', onMouseLeave)
  }
}
