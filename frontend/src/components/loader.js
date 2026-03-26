// frontend/src/components/loader.js

const MESSAGES = [
  'Extraindo transcrição do YouTube...',
  'Analisando conteúdo com IA...',
  'Gerando resumo estruturado...',
  'Finalizando...',
]

export function createLoader() {
  const el = document.createElement('div')
  el.className = 'loader-wrap'
  el.innerHTML = `
    <div class="loader-hex-wrap">
      <svg class="loader-hex" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M24 4L43 15V33L24 44L5 33V15L24 4Z"
              stroke="url(#hex-grad)" stroke-width="1.5" fill="none"/>
        <path d="M24 4L43 15V33L24 44L5 33V15L24 4Z"
              stroke="url(#hex-grad2)" stroke-width="1.5" fill="none"
              stroke-dasharray="10 4" class="loader-hex-dash"/>
        <defs>
          <linearGradient id="hex-grad" x1="5" y1="4" x2="43" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#7c3aed"/>
            <stop offset="100%" stop-color="#06b6d4"/>
          </linearGradient>
          <linearGradient id="hex-grad2" x1="43" y1="4" x2="5" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div class="loader-bar-wrap">
      <div class="loader-bar"></div>
    </div>
    <div class="loader-text" aria-live="polite">${MESSAGES[0]}</div>
  `

  if (!document.getElementById('loader-style')) {
    const s = document.createElement('style')
    s.id = 'loader-style'
    s.textContent = `
      .loader-wrap { text-align:center; padding: 32px 0 8px; }
      .loader-hex-wrap { display:flex; justify-content:center; margin-bottom:24px; }
      .loader-hex { animation: hexPulse 2s ease-in-out infinite; }
      .loader-hex-dash { animation: hexSpin 3s linear infinite; transform-origin:24px 24px; }
      .loader-bar-wrap {
        height:3px; background:rgba(255,255,255,0.06); border-radius:4px;
        margin:0 0 20px; overflow:hidden;
      }
      .loader-bar {
        height:100%; width:40%; border-radius:4px;
        background: linear-gradient(90deg, transparent, #7c3aed, #06b6d4, #7c3aed, transparent);
        background-size: 200% auto;
        animation: progressShimmer 1.8s linear infinite;
      }
      .loader-text {
        font-size:0.85rem; color:#64748b;
        animation: textFadeInOut 2.5s ease infinite;
      }
    `
    document.head.appendChild(s)
  }

  let msgIdx = 0
  let interval = null

  function start() {
    msgIdx = 0
    const textEl = el.querySelector('.loader-text')
    textEl.textContent = MESSAGES[0]
    interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % MESSAGES.length
      textEl.style.animation = 'none'
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          textEl.style.animation = ''
          textEl.textContent = MESSAGES[msgIdx]
        })
      })
    }, 2500)
  }

  function stop() {
    clearInterval(interval)
  }

  return { el, start, stop }
}
