// frontend/src/api.js

const BASE = ''  // proxy via vite.config.js

/**
 * @param {string} url - URL do YouTube
 * @param {'topics'|'music'} mode
 * @returns {Promise<{summary:string, title:string, duration_ms:number}>}
 */
export async function summarize(url, mode) {
  const res = await fetch(`${BASE}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, mode }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro desconhecido.' }))
    throw new Error(err.detail ?? 'Erro na requisição.')
  }

  return res.json()
}

/**
 * @param {string} summary
 * @param {string} title
 * @returns {Promise<Blob>}
 */
export async function exportPdf(summary, title) {
  const res = await fetch(`${BASE}/export/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary, title }),
  })

  if (!res.ok) throw new Error('Falha ao gerar PDF.')
  return res.blob()
}

/** Download de texto como .txt no browser (sem backend) */
export function downloadTxt(text, filename = 'resumo.txt') {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Download de Blob como arquivo */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href    = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
