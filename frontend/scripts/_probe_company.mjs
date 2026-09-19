// Throwaway adversarial probe: does #company land under the header?
import { writeFile } from 'node:fs/promises'

const CDP = 'http://127.0.0.1:9222'
const BASE = 'http://localhost:5173'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url)
    const session = { ws, id: 0, pending: new Map() }
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id && session.pending.has(msg.id)) {
        const { resolve: res, reject: rej } = session.pending.get(msg.id)
        session.pending.delete(msg.id)
        if (msg.error) rej(new Error(JSON.stringify(msg.error)))
        else res(msg.result)
      }
    })
    ws.addEventListener('open', () => resolve(session))
    ws.addEventListener('error', () => reject(new Error(`ws failed: ${url}`)))
  })
}

function send(session, method, params = {}, timeoutMs = 20000) {
  const id = ++session.id
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      session.pending.delete(id)
      reject(new Error(`CDP timeout: ${method}`))
    }, timeoutMs)
    session.pending.set(id, {
      resolve: (v) => { clearTimeout(timer); resolve(v) },
      reject: (e) => { clearTimeout(timer); reject(e) },
    })
    session.ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(session, expression, timeoutMs = 20000) {
  const result = await send(session, 'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true }, timeoutMs)
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text)
  }
  return result.result.value
}

const MEASURE = `(() => {
  const header = document.querySelector('header')
  const sec = document.getElementById('company')
  if (!header || !sec) return { error: 'missing header or #company' }
  const hb = header.getBoundingClientRect().bottom
  const sb = sec.getBoundingClientRect()
  const cs = getComputedStyle(sec)
  return {
    scrollY: Math.round(window.scrollY),
    headerTop: Math.round(header.getBoundingClientRect().top),
    headerBottom: Math.round(hb),
    headerHeight: Math.round(header.getBoundingClientRect().height),
    sectionTop: Math.round(sb.top),
    sectionBottom: Math.round(sb.bottom),
    scrollMarginTop: cs.scrollMarginTop,
    paddingTop: cs.paddingTop,
    hiddenBehindHeader: Math.round(hb - sb.top),
    heading: sec.querySelector('h2,h3')?.textContent?.trim().slice(0, 40) ?? null,
  }
})()`

async function main() {
  const reported = {}
  for (const width of [1440, 1280, 1024, 768, 390]) {
    const res = await fetch(`${CDP}/json/new?about:blank`, { method: 'PUT' })
    const tab = await res.json()
    const session = await connect(tab.webSocketDebuggerUrl)
    try {
      await send(session, 'Page.enable')
      await send(session, 'Emulation.setDeviceMetricsOverride',
        { width, height: 900, deviceScaleFactor: 1, mobile: false })
      await send(session, 'Page.navigate', { url: `${BASE}/about#company` })
      await sleep(800)

      // Wait for the route chunk + #company to exist.
      await evaluate(session, `(async () => {
        for (let i = 0; i < 100; i++) {
          if (document.getElementById('company') && document.querySelector('h1')) return true
          await new Promise(r => setTimeout(r, 100))
        }
        return false
      })()`)

      // Re-trigger the hash scroll the way an in-app link would.
      await evaluate(session, `(() => {
        const el = document.getElementById('company')
        el.scrollIntoView({ behavior: 'auto', block: 'start' })
        return true
      })()`)
      await sleep(300)
      const immediate = await evaluate(session, MEASURE)
      await sleep(1500)
      const settled = await evaluate(session, MEASURE)

      // Header height in both states: at the very top, and scrolled.
      await evaluate(session, `window.scrollTo(0, 0)`)
      await sleep(600)
      const atTop = await evaluate(session, `(() => {
        const h = document.querySelector('header').getBoundingClientRect()
        return { height: Math.round(h.height), bottom: Math.round(h.bottom) }
      })()`)
      await evaluate(session, `window.scrollTo(0, 4000)`)
      await sleep(900)
      const scrolledHeader = await evaluate(session, `(() => {
        const h = document.querySelector('header').getBoundingClientRect()
        return { height: Math.round(h.height), bottom: Math.round(h.bottom), scrollY: Math.round(window.scrollY) }
      })()`)

      reported[width] = { immediate, settled, atTop, scrolledHeader }
    } finally {
      await fetch(`${CDP}/json/close/${tab.id}`).catch(() => {})
    }
  }
  await writeFile('scripts/_probe_company.json', JSON.stringify(reported, null, 2))
  console.log(JSON.stringify(reported, null, 2))
}

main().catch((e) => { console.error('FAILED', e); process.exit(1) })
