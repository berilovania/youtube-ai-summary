// frontend/src/components/typewriter.js

/**
 * Anima a digitação de um texto numa série de linhas/tópicos.
 * @param {HTMLElement} container - elemento que recebe as linhas
 * @param {string} text - texto completo do resumo
 * @param {Function} onDone - callback ao terminar
 */
export function typewriterReveal(container, text, onDone = () => {}) {
  container.innerHTML = ''
  const lines = text.split('\n').filter(l => l.trim())

  let lineIdx = 0

  function revealLine(line, lineEl, cb) {
    const indicator = lineEl.querySelector('.topic-indicator')
    const textSpan  = lineEl.querySelector('.topic-text')

    lineEl.classList.add('visible')
    if (indicator) {
      indicator.classList.add('blink')
    }

    let i = 0
    const interval = setInterval(() => {
      textSpan.textContent += line[i] ?? ''
      i++
      if (i >= line.length) {
        clearInterval(interval)
        cb()
      }
    }, 28)
  }

  function revealNext() {
    if (lineIdx >= lines.length) {
      onDone()
      return
    }

    const line = lines[lineIdx]
    const lineEl = document.createElement('div')
    lineEl.className = 'result-topic'
    lineEl.innerHTML = `
      <span class="topic-indicator">▸</span>
      <span class="topic-text"></span>
    `
    container.appendChild(lineEl)

    revealLine(line, lineEl, () => {
      lineIdx++
      setTimeout(revealNext, 150)
    })
  }

  revealNext()
}
