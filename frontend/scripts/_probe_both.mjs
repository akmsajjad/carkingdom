// Compare #company (no inbound link) against #team (linked from the footer).
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

const measure = (id) => `(() => {
  const header = document.querySelector('header')
  const el = document.getElementById(${JSON.stringify(id)})
  if (!header || !el) return { error: 'missing', id: ${JSON.stringify(id)} }
  const hb = header.getBoundingClientRect().bottom
  const r = el.getBoundingClientRect()
  const cs = getComputedStyle(el)
  // The first real piece of content inside the section, ignoring padding.
  const inner = el.querySelector('h2,h3,p,div')
  const ir = inner ? inner.getBoundingClientRect() : null
  return {
    id: ${JSON.stringify(id)},
    scrollY: Math.round(window.scrollY),
    headerHeight: Math.round(header.getBoundingClientRect().height),
    headerBottom: Math.round(hb),
    boxTop: Math.round(r.top),
    scrollMarginTop: cs.scrollMarginTop,
    paddingTop: cs.paddingTop,
    boxTopBehindHeaderBy: Math.round(hb - r.top),
    firstContentTop: ir ? Math.round(ir.top) : null,
    firstContentBehindHeaderBy: ir ? Math.round(hb - ir.top) : null,
  }
})()`

async function probe(id) {
  const res = await fetch(`${CDP}/json/new?about:blank`, { method: 'PUT' })
  const tab = await res.json()
  const session = await connect(tab.webSocketDebuggerUrl)
  try {
    await send(session, 'Page.enable')
    await send(session, 'Emulation.setDeviceMetricsOverride',
      { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
    await send(session, 'Page.navigate', { url: `${BASE}/about#${id}` })
    await sleep(1000)
    await evaluate(session, `(async () => {
      for (let i = 0; i < 100; i++) {
        if (document.getElementById(${JSON.stringify(id)}) && document.querySelector('h1')) return true
        await new Promise(r => setTimeout(r, 100))
      }
      return false
    })()`)
    await sleep(2500)
    return await evaluate(session, measure(id))
  } finally {
    await fetch(`${CDP}/json/close/${tab.id}`).catch(() => {})
  }
}

const out = { team: await probe('team'), company: await probe('company') }
console.log(JSON.stringify(out, null, 2))
