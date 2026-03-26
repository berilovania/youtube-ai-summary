// frontend/src/views/app.js
import { summarize, exportPdf, downloadTxt, downloadBlob } from '../api.js'
import { createLoader } from '../components/loader.js'
import { typewriterReveal } from '../components/typewriter.js'
import { addToHistory } from './history.js'

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Extrai video_id de uma URL do YouTube.
 * @param {string} url
 * @returns {string|null}
 */
function extractVideoId(url) {
  const m = url.match(/(?:v=|be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

/**
 * Adiciona ripple effect num botão ao clicar.
 * @param {HTMLElement} btn
 * @param {MouseEvent} e
 */
function addRipple(btn, e) {
  const rect = btn.getBoundingClientRect()
  const ripple = document.createElement('span')
  ripple.className = 'ripple'
  ripple.style.left = `${e.clientX - rect.left}px`
  ripple.style.top  = `${e.clientY - rect.top}px`
  btn.appendChild(ripple)
  ripple.addEventListener('animationend', () => ripple.remove())
}

/**
 * Renderiza a view principal no container.
 * @param {HTMLElement} container
 */
export function renderApp(container) {
  container.innerHTML = `
    <h1 class="display-title anim-slide-down">O que vamos resumir hoje?</h1>
    <p class="display-subtitle anim-slide-down" data-stagger="1">
      Cole o link do YouTube e deixe a IA cuidar do resto.
    </p>

    <div class="feature-pills anim-fade-in" data-stagger="2">
      <span class="feature-pill">✨ Tópicos claros e diretos</span>
      <span class="feature-pill">🎧 Análise de músicas</span>
      <span class="feature-pill">🚀 IA ultrarrápida (Mistral)</span>
    </div>

    <div class="glass" id="main-card" style="padding:28px">
      <div class="url-input-wrap anim-slide-up" data-stagger="3">
        <input
          class="url-input"
          id="url-input"
          type="url"
          placeholder="Cole aqui o link do YouTube (ex: https://youtu.be/...)"
          autocomplete="off"
          spellcheck="false"
        />
        <span class="url-input-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2a7 7 0 100 14A7 7 0 009 2zM6 9l2.5 2.5L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>

      <div class="mode-selector anim-slide-up" id="mode-selector" data-stagger="4">
        <div class="mode-pill" id="mode-pill"></div>
        <button class="mode-btn active" data-mode="topics">📝 Resumo em Tópicos</button>
        <button class="mode-btn" data-mode="music">🎧 Significado de Música</button>
      </div>

      <button class="btn-primary anim-slide-up" id="btn-generate" data-stagger="5">
        Gerar Resumo ✨
      </button>

      <div id="banner-area"></div>
      <div id="loader-area"></div>
    </div>

    <div id="result-area"></div>
  `

  const urlInput    = container.querySelector('#url-input')
  const btnGenerate = container.querySelector('#btn-generate')
  const modeSelector= container.querySelector('#mode-selector')
  const modePill    = container.querySelector('#mode-pill')
  const bannerArea  = container.querySelector('#banner-area')
  const loaderArea  = container.querySelector('#loader-area')
  const resultArea  = container.querySelector('#result-area')
  const mainCard    = container.querySelector('#main-card')

  let currentMode = 'topics'
  let currentSummary = null
  let currentVideoId = null
  let currentTitle   = null

  // Mode selector: sliding pill
  function updatePill(activeBtn) {
    const rect    = activeBtn.getBoundingClientRect()
    const parent  = modeSelector.getBoundingClientRect()
    modePill.style.left  = `${rect.left - parent.left}px`
    modePill.style.width = `${rect.width}px`
  }

  requestAnimationFrame(() => {
    const activeBtn = modeSelector.querySelector('.mode-btn.active')
    if (activeBtn) updatePill(activeBtn)
  })

  modeSelector.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modeSelector.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      currentMode = btn.dataset.mode
      updatePill(btn)
    })
  })

  let bannerTimer = null
  function showBanner(msg, type = 'error') {
    clearTimeout(bannerTimer)
    bannerArea.innerHTML = `<div class="banner ${type}">${escapeHtml(msg)}</div>`
    bannerTimer = setTimeout(() => { bannerArea.innerHTML = '' }, 6000)
  }

  btnGenerate.addEventListener('click', async (e) => {
    addRipple(btnGenerate, e)
    await handleGenerate()
  })

  async function handleGenerate() {
    const url = urlInput.value.trim()
    if (!url) {
      showBanner('⚠️ Cole um link do YouTube para começar.', 'error')
      return
    }

    const videoId = extractVideoId(url)
    if (!videoId) {
      showBanner('⚠️ Link inválido. Use um link do YouTube válido.', 'error')
      return
    }

    btnGenerate.disabled = true
    bannerArea.innerHTML = ''
    resultArea.innerHTML = ''
    mainCard.classList.add('glow-loading')

    const loader = createLoader()
    loaderArea.innerHTML = ''
    loaderArea.appendChild(loader.el)
    loader.start()

    try {
      const data = await summarize(url, currentMode)
      currentSummary = data.summary
      currentVideoId = videoId
      currentTitle   = data.title

      addToHistory({
        title:    currentTitle,
        url,
        video_id: currentVideoId,
        summary:  currentSummary,
        mode:     currentMode,
      })

      loader.stop()
      loaderArea.innerHTML = ''
      mainCard.classList.remove('glow-loading')
      mainCard.classList.add('glow-success')
      setTimeout(() => mainCard.classList.remove('glow-success'), 2400)

      renderResult(currentSummary)

    } catch (err) {
      loader.stop()
      loaderArea.innerHTML = ''
      mainCard.classList.remove('glow-loading')
      showBanner(`❌ ${err.message}`, 'error')
    } finally {
      btnGenerate.disabled = false
    }
  }

  function renderResult(summary) {
    resultArea.innerHTML = `
      <div class="result-card glass" id="result-card">
        <div class="result-label">Resumo gerado com IA</div>
        <div class="result-content" id="result-content"></div>
        <div class="download-row hidden" id="download-row">
          <button class="btn-download" id="btn-dl-txt">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Baixar TXT
          </button>
          <button class="btn-download" id="btn-dl-pdf">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            Baixar PDF
          </button>
        </div>
      </div>
    `

    const contentEl   = resultArea.querySelector('#result-content')
    const downloadRow = resultArea.querySelector('#download-row')

    typewriterReveal(contentEl, summary, () => {
      downloadRow.classList.remove('hidden')
    })

    resultArea.querySelector('#btn-dl-txt').addEventListener('click', () => {
      downloadTxt(currentSummary, `resumo-${currentVideoId}.txt`)
    })

    resultArea.querySelector('#btn-dl-pdf').addEventListener('click', async (e) => {
      const btn = e.currentTarget
      btn.disabled = true
      btn.textContent = 'Gerando PDF...'
      try {
        const blob = await exportPdf(currentSummary, currentTitle)
        downloadBlob(blob, `resumo-${currentVideoId}.pdf`)
      } catch (err) {
        showBanner('Erro ao gerar PDF: ' + err.message, 'error')
      } finally {
        btn.disabled = false
        btn.textContent = 'Baixar PDF'
      }
    })
  }
}
