// frontend/src/main.js
import { initParticles } from './components/particles.js'
import { renderApp }     from './views/app.js'
import { renderHistory, renderHistoryModal } from './views/history.js'

// Initialize particles
initParticles()

// Animate header on load
const header = document.getElementById('app-header')
requestAnimationFrame(() => {
  setTimeout(() => header?.classList.add('visible'), 100)
})

// View Router
const viewContainer = document.getElementById('view-container')
let currentView = 'app'

function navigate(view) {
  if (view === currentView) return

  viewContainer.style.transition = 'opacity 0.2s ease'
  viewContainer.style.opacity = '0'

  setTimeout(() => {
    currentView = view

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view)
    })

    if (view === 'app') {
      renderApp(viewContainer)
    } else if (view === 'history') {
      renderHistory(viewContainer, openModal)
    }

    // Double rAF forces a browser layout flush before restoring opacity,
    // ensuring the CSS transition runs after the new view is painted.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        viewContainer.style.opacity = '1'
      })
    })
  }, 200)
}

// Nav button click handlers
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.view))
})

// Modal
const modalOverlay = document.getElementById('modal-overlay')
const modalContent = document.getElementById('modal-content')
const modalClose   = document.getElementById('modal-close')

function openModal(entry) {
  modalContent.innerHTML = ''
  modalContent.appendChild(renderHistoryModal(entry))
  modalOverlay.classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  modalOverlay.classList.add('hidden')
  document.body.style.overflow = ''
}

modalClose.addEventListener('click', closeModal)
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal()
})
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) closeModal()
})

// Initial render
renderApp(viewContainer)
