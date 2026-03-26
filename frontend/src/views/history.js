// frontend/src/views/history.js
import { downloadTxt, exportPdf, downloadBlob } from '../api.js'

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const STORAGE_KEY = 'yt_summary_history'
const MAX_ENTRIES = 20

/** @returns {Array} */
export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

/** @param {Array} entries */
function saveHistory(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

/**
 * Salva um novo resumo no histórico (LRU, máx. MAX_ENTRIES).
 * @param {{title:string, url:string, video_id:string, summary:string, mode:string}} item
 */
export function addToHistory(item) {
  const entries = loadHistory()
  const entry = {
    id:         crypto.randomUUID(),
    title:      item.title,
    url:        item.url,
    video_id:   item.video_id,
    summary:    item.summary,
    mode:       item.mode,
    created_at: new Date().toISOString(),
  }
  entries.unshift(entry)
  if (entries.length > MAX_ENTRIES) entries.pop()
  saveHistory(entries)
  return entry
}

/** Remove entrada por id */
export function removeFromHistory(id) {
  const entries = loadHistory().filter(e => e.id !== id)
  saveHistory(entries)
}

/** Formata data ISO para pt-BR */
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function thumbnailUrl(video_id) {
  return `https://img.youtube.com/vi/${video_id}/mqdefault.jpg`
}

/**
 * Renderiza a view de histórico no container.
 * @param {HTMLElement} container
 * @param {Function} openModal - (entry) => void
 */
export function renderHistory(container, openModal) {
  const entries = loadHistory()

  if (entries.length === 0) {
    container.innerHTML = `
      <h1 class="display-title" style="margin-bottom:8px">Histórico</h1>
      <p class="display-subtitle">Seus últimos resumos gerados</p>
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <path d="M32 8L56 20V44L32 56L8 44V20L32 8Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M22 32h20M32 22v20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <h3>Nenhum resumo ainda</h3>
        <p>Gere seu primeiro resumo na aba Resumir</p>
      </div>
    `
    return
  }

  container.innerHTML = `
    <h1 class="display-title" style="margin-bottom:8px">Histórico</h1>
    <p class="display-subtitle">${entries.length} resumo${entries.length > 1 ? 's' : ''} salvos</p>
    <div class="history-grid" id="history-grid"></div>
  `

  const grid = container.querySelector('#history-grid')

  entries.forEach((entry, i) => {
    const card = document.createElement('div')
    card.className = 'history-card'
    card.style.animationDelay = `${i * 60}ms`
    card.dataset.id = entry.id

    const badgeClass = entry.mode === 'music' ? 'music' : 'topics'
    const badgeLabel = entry.mode === 'music' ? '🎧 Música' : '📝 Tópicos'

    card.innerHTML = `
      <img
        class="history-thumb"
        src="${thumbnailUrl(entry.video_id)}"
        alt="Thumbnail do vídeo"
        loading="lazy"
        onerror="this.style.display='none'"
      />
      <div class="history-body">
        <div class="history-title">${escapeHtml(entry.title)}</div>
        <div class="history-meta">
          <span class="history-date">${formatDate(entry.created_at)}</span>
          <span class="mode-badge ${badgeClass}">${badgeLabel}</span>
        </div>
        <div class="history-actions" style="margin-top:12px">
          <button class="btn-icon" data-action="view">Ver resumo</button>
          <button class="btn-icon danger" data-action="delete">Deletar</button>
        </div>
      </div>
    `

    card.querySelector('[data-action="view"]').addEventListener('click', (e) => {
      e.stopPropagation()
      openModal(entry)
    })

    card.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
      e.stopPropagation()
      removeFromHistory(entry.id)
      card.style.transition = 'opacity 0.3s, transform 0.3s'
      card.style.opacity = '0'
      card.style.transform = 'scale(0.95)'
      setTimeout(() => {
        card.remove()
        const remaining = grid.querySelectorAll('.history-card').length
        if (remaining === 0) renderHistory(container, openModal)
      }, 300)
    })

    card.addEventListener('click', () => openModal(entry))

    grid.appendChild(card)
  })
}

/** Renderiza conteúdo do modal de um entry */
export function renderHistoryModal(entry) {
  const badgeClass = entry.mode === 'music' ? 'music' : 'topics'
  const badgeLabel = entry.mode === 'music' ? '🎧 Música' : '📝 Tópicos'

  const wrap = document.createElement('div')
  wrap.innerHTML = `
    <div class="modal-title">${escapeHtml(entry.title)}</div>
    <div class="modal-meta">
      <span>${formatDate(entry.created_at)}</span>
      <span class="mode-badge ${badgeClass}">${badgeLabel}</span>
    </div>
    <div class="modal-summary">${escapeHtml(entry.summary)}</div>
    <div class="modal-actions">
      <button class="btn-download" id="modal-dl-txt">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Baixar TXT
      </button>
      <button class="btn-download" id="modal-dl-pdf">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Baixar PDF
      </button>
    </div>
  `

  wrap.querySelector('#modal-dl-txt').addEventListener('click', () => {
    downloadTxt(entry.summary, `resumo-${entry.video_id}.txt`)
  })

  wrap.querySelector('#modal-dl-pdf').addEventListener('click', async () => {
    const btn = wrap.querySelector('#modal-dl-pdf')
    btn.disabled = true
    btn.textContent = 'Gerando...'
    try {
      const blob = await exportPdf(entry.summary, entry.title)
      downloadBlob(blob, `resumo-${entry.video_id}.pdf`)
    } catch (e) {
      alert('Erro ao gerar PDF: ' + e.message)
    } finally {
      btn.disabled = false
      btn.textContent = 'Baixar PDF'
    }
  })

  return wrap
}
