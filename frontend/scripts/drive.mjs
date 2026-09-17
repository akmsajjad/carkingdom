/**
 * Drives the running Vite dev server through the Chrome DevTools Protocol.
 *
 * Verifies what a build cannot: that React actually mounts, that client-side
 * routing works when a link is clicked, that every route renders, that the
 * layout holds at every breakpoint, and that the console stays clean. Also
 * captures screenshots so the result can be looked at rather than only
 * asserted on.
 *
 * Requires the dev server on :5173 and Chrome listening on :9222:
 *
 *   npm run dev
 *   chrome --headless=new --remote-debugging-port=9222 \
 *          --user-data-dir=/tmp/cd-cdp --no-first-run --disable-gpu about:blank
 *   npm run drive                    # everything
 *   npm run drive -- --responsive-only   # skip the route sweep while iterating
 */
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const SHOT_DIR = tmpdir()

const CDP = 'http://127.0.0.1:9222'
const BASE = 'http://localhost:5173'

/** `node scripts/drive.mjs --responsive-only` skips the route sweep, which is
 *  the slow half, while iterating on a layout problem. */
const RESPONSIVE_ONLY = process.argv.includes('--responsive-only')

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url)
    const session = { ws, id: 0, pending: new Map(), listeners: [] }

    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id && session.pending.has(msg.id)) {
        const { resolve: res, reject: rej } = session.pending.get(msg.id)
        session.pending.delete(msg.id)
        if (msg.error) rej(new Error(JSON.stringify(msg.error)))
        else res(msg.result)
      } else if (msg.method) {
        session.listeners.forEach((fn) => fn(msg))
      }
    })

    ws.addEventListener('open', () => resolve(session))
    ws.addEventListener('error', () => reject(new Error(`ws failed: ${url}`)))
  })
}

function send(session, method, params = {}, timeoutMs = 15000) {
  const id = ++session.id
  return new Promise((resolve, reject) => {
    // A hung CDP call — captureScreenshot on a backgrounded tab is the usual
    // culprit — must not hang the whole run.
    const timer = setTimeout(() => {
      session.pending.delete(id)
      reject(new Error(`CDP timeout: ${method}`))
    }, timeoutMs)

    session.pending.set(id, {
      resolve: (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      reject: (error) => {
        clearTimeout(timer)
        reject(error)
      },
    })

    session.ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(session, expression) {
  const result = await send(session, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.exception?.description ??
        result.exceptionDetails.text,
    )
  }
  return result.result.value
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function openTab(url) {
  const res = await fetch(`${CDP}/json/new?${encodeURIComponent(url)}`, {
    method: 'PUT',
  })
  if (!res.ok) throw new Error(`/json/new returned ${res.status}`)
  return res.json()
}

/**
 * Screenshots only come back from a tab the compositor considers visible; a
 * backgrounded target produces no frames and the call never resolves.
 */
async function screenshot(session, path) {
  await send(session, 'Page.bringToFront')
  await sleep(200)
  const result = await send(
    session,
    'Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: false },
    20000,
  )
  await writeFile(path, Buffer.from(result.data, 'base64'))
}

async function closeTab(id) {
  await fetch(`${CDP}/json/close/${id}`).catch(() => {})
}

/**
 * Waits until the page has actually rendered, not just until React has mounted.
 *
 * `#root` gains a child as soon as the layout shell renders, so it reports
 * "ready" while the lazy route chunk is still downloading and the page's own
 * `h1` has yet to appear — which showed up as rows of `h1=null imgs=0` for
 * pages that were fine a moment later. Every page in this app renders an `h1`
 * inside `main`, so that is the signal.
 */
async function waitForMount(session, timeoutMs = 10000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const mounted = await evaluate(
      session,
      `!!document.querySelector('main h1')`,
    )
    if (mounted) return true
    await sleep(120)
  }
  return false
}

const PAGE_PROBE = `(() => {
  const t = (sel) => document.querySelector(sel)?.textContent?.trim() ?? null
  const ids = [...document.querySelectorAll('[id]')].map((el) => el.id)
  return {
    title: document.title,
    url: location.pathname + location.search,
    h1: t('h1'),
    header: !!document.querySelector('header'),
    footer: !!document.querySelector('footer'),
    navLinks: [...document.querySelectorAll('header nav a')].map(a => a.textContent.trim()),
    mainText: (document.querySelector('main')?.innerText ?? '').slice(0, 160),
    imgCount: document.querySelectorAll('img').length,
    brokenImgs: [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0).length,
    duplicateIds: [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))],
  }
})()`

const results = []
const problems = []
let interactions = null
let detail = null

async function visit(session, path, label) {
  await send(session, 'Page.navigate', { url: `${BASE}${path}` })
  await sleep(700)
  const mounted = await waitForMount(session)
  if (!mounted) {
    problems.push(`${label}: React never mounted at ${path}`)
    return null
  }
  await sleep(250)
  const probe = await evaluate(session, PAGE_PROBE)
  results.push({ label, path, ...probe })
  return probe
}

async function main() {
  // --- Tab 1: console + client-side navigation -----------------------------
  const tab = await openTab('about:blank')
  const session = await connect(tab.webSocketDebuggerUrl)

  const consoleErrors = []
  const consoleWarnings = []
  const exceptions = []

  session.listeners.push((msg) => {
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args
        .map((a) => a.value ?? a.description ?? a.type)
        .join(' ')
      if (msg.params.type === 'error') consoleErrors.push(text)
      else if (msg.params.type === 'warning') consoleWarnings.push(text)
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      exceptions.push(
        msg.params.exceptionDetails.exception?.description ??
          msg.params.exceptionDetails.text,
      )
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      consoleErrors.push(`[${msg.params.entry.source}] ${msg.params.entry.text}`)
    }
  })

  await send(session, 'Runtime.enable')
  await send(session, 'Log.enable')
  await send(session, 'Page.enable')
  await send(session, 'Network.enable')

  // Desktop viewport
  await send(session, 'Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })

  await visit(session, '/', 'Home')
  await screenshot(session, join(SHOT_DIR, 'cd-shot-home.png'))

  // --- Client-side navigation by clicking a real link ---------------------
  if (!RESPONSIVE_ONLY) {
    const clicked = await evaluate(
      session,
      `(() => {
        const link = [...document.querySelectorAll('header nav a')]
          .find(a => a.textContent.trim() === 'Used Cars')
        if (!link) return { ok: false, reason: 'no Used Cars link in header nav' }
        link.click()
        return { ok: true }
      })()`,
    )

    if (!clicked.ok) {
      problems.push(`Client-side nav: ${clicked.reason}`)
    } else {
      await sleep(900)
      const after = await evaluate(session, PAGE_PROBE)
      results.push({ label: 'Client-side nav click → Used Cars', path: 'click', ...after })
      if (after.url !== '/used-cars') {
        problems.push(`Clicking "Used Cars" landed on ${after.url}, expected /used-cars`)
      }
    }

    await screenshot(session, join(SHOT_DIR, 'cd-shot-desktop.png'))

    // --- Every other route, loaded directly -------------------------------
    // These slugs must match `src/data/vehicles.js` exactly. The vehicle one
    // used to read `toyota-camry-2024`, which is not a slug any vehicle has —
    // `defineVehicle` builds `2024-toyota-camry-se` — so the sweep was checking
    // a placeholder that ignored its route params and rendered regardless. It
    // reported green for two phases without ever loading a real listing.
    const routes = [
      ['/used-cars/2024-toyota-camry-se', 'Vehicle Details'],
      ['/used-cars/2021-toyota-corolla-le', 'Vehicle Details (sold)'],
      ['/used-cars/not-a-real-vehicle', 'Vehicle Details (404)'],
      ['/favorites', 'Favorites'],
      ['/compare', 'Compare'],
      ['/services', 'Services'],
      ['/services/oil-change', 'Service Details'],
      ['/parts', 'Parts'],
      ['/parts/brake-pad-set-front', 'Part Details'],
      ['/cart', 'Cart'],
      ['/careers', 'Careers'],
      ['/careers/service-technician', 'Job Details'],
      ['/about', 'About'],
      ['/contact', 'Contact'],
      ['/this-route-does-not-exist', '404'],
    ]

    for (const [path, label] of routes) {
      await visit(session, path, label)
    }

    // --- Marketplace interactions ------------------------------------------
    // The responsive sweep proves the layout holds; this proves the thing the
    // phase is actually about — that filtering, sorting, paging, searching and
    // saving all change the URL and the results, rather than only rendering.
    await send(session, 'Page.navigate', { url: `${BASE}/used-cars` })
    await sleep(1200)

    interactions = await evaluate(
      session,
      `(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms))
        const log = { steps: [] }

        // React tracks the last value it wrote to an input, so assigning
        // .value directly is ignored. Calling the prototype setter bypasses
        // that tracker, which is what makes the synthetic event real.
        const setNativeValue = (el, value) => {
          const proto = el instanceof HTMLSelectElement
            ? HTMLSelectElement.prototype
            : HTMLInputElement.prototype
          Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value)
        }

        const footer = () => document.querySelector('main p[aria-live="polite"]')?.textContent ?? ''
        const count = () => {
          const text = footer()
          const m = text.match(/of\\s*([\\d,]+)/)
          if (m) return Number(m[1].replace(/,/g, ''))
          return text.includes('No vehicles') ? 0 : null
        }
        const prices = () => [...document.querySelectorAll('main article')]
          .map((a) => a.innerText.match(/\\$([\\d,]+)/))
          .filter(Boolean)
          .map((m) => Number(m[1].replace(/,/g, '')))
        const titles = () => [...document.querySelectorAll('main article h3')]
          .map((h) => h.textContent.trim())
        const chipLabels = () => [...document.querySelectorAll('main ul[aria-labelledby] button')]
          .map((b) => b.textContent.trim())
        const facet = (label) => [...document.querySelectorAll('aside input[type=checkbox]')]
          .find((i) => i.closest('label')?.textContent.trim().startsWith(label))
        const buttonByText = (root, text) => [...root.querySelectorAll('button')]
          .find((b) => b.textContent.trim() === text)

        // Fixed sleeps race the mock service: a page change lands at roughly
        // 800ms, close enough to a 1000ms wait that a slow render makes the
        // harness read the *previous* page's cards and report a pagination
        // failure that isn't real. Poll for the condition instead — it is both
        // faster when the app is quick and correct when it isn't.
        const waitFor = async (predicate, timeout = 6000) => {
          const deadline = Date.now() + timeout
          while (Date.now() < deadline) {
            if (predicate()) return true
            await wait(100)
          }
          return false
        }
        const ascending = (values) => values.every((v, i) => i === 0 || values[i - 1] <= v)

        log.steps.push({ step: 'initial', url: location.search, count: count(), cards: prices().length })
        const initialCount = count()

        const toyota = facet('Toyota')
        if (!toyota) return { ok: false, reason: 'no Toyota facet checkbox found' }
        toyota.click()
        await waitFor(() => { const t = titles(); return t.length > 0 && t.every((x) => x.includes('Toyota')) })
        log.steps.push({
          step: 'filter make=Toyota',
          url: location.search,
          count: count(),
          chips: chipLabels(),
          allToyota: titles().every((t) => t.includes('Toyota')),
        })

        facet('Honda')?.click()
        await waitFor(() => { const t = titles(); return t.some((x) => x.includes('Honda')) && t.some((x) => x.includes('Toyota')) })
        log.steps.push({ step: 'add make=Honda', url: location.search, count: count() })

        const toyotaChip = [...document.querySelectorAll('main ul[aria-labelledby] button')]
          .find((b) => b.textContent.includes('Toyota'))
        toyotaChip?.click()
        await waitFor(() => { const t = titles(); return t.length > 0 && t.every((x) => x.includes('Honda')) })
        log.steps.push({
          step: 'remove Toyota via chip',
          url: location.search,
          count: count(),
          chips: chipLabels(),
          allHonda: titles().every((t) => t.includes('Honda')),
        })

        const filtersAside = document.querySelector('aside[aria-label="Vehicle filters"]')
        buttonByText(filtersAside, 'Clear all')?.click()
        await waitFor(() => count() === initialCount && chipLabels().length === 0)
        log.steps.push({ step: 'clear all', url: location.search, count: count(), chips: chipLabels().length })

        const sort = document.querySelector('select[aria-label="Sort vehicles"]')
        setNativeValue(sort, 'price-asc')
        sort.dispatchEvent(new Event('change', { bubbles: true }))
        await waitFor(() => ascending(prices()) && prices().length > 0)
        const sorted = prices()
        log.steps.push({
          step: 'sort price-asc',
          url: location.search,
          ascending: ascending(sorted),
          first: sorted[0],
          last: sorted[sorted.length - 1],
        })

        const listBtn = document.querySelector('button[aria-label="List view"]')
        const gridWidth = document.querySelector('main article')?.getBoundingClientRect().width
        listBtn?.click()
        await wait(500)
        log.steps.push({
          step: 'view=list',
          url: location.search,
          pressed: listBtn?.getAttribute('aria-pressed'),
          gridWidthAtGrid: Math.round(gridWidth ?? 0),
          rowWidth: Math.round(document.querySelector('main article')?.getBoundingClientRect().width ?? 0),
        })

        const firstBeforePage = titles()[0]
        const pageNav = document.querySelector('nav[aria-label="Inventory pages"]')
        buttonByText(pageNav, '2')?.click()
        await waitFor(() => titles()[0] !== firstBeforePage)
        log.steps.push({
          step: 'page 2',
          url: location.search,
          firstTitleChanged: titles()[0] !== firstBeforePage,
          firstTitle: titles()[0],
        })

        const search = document.querySelector('input[aria-label="Search inventory"]')
        const countBeforeSearch = count()
        setNativeValue(search, 'truck')
        search.dispatchEvent(new Event('input', { bubbles: true }))
        await waitFor(() => count() !== countBeforeSearch && count() !== null)
        log.steps.push({
          step: 'search "truck"',
          url: location.search,
          count: count(),
          pageReset: !location.search.includes('page='),
        })

        const favorite = document.querySelector('main article button[aria-pressed]')
        const before = favorite?.getAttribute('aria-pressed')
        favorite?.click()
        await wait(500)
        log.steps.push({
          step: 'favorite first card',
          pressedBefore: before,
          pressedAfter: favorite?.getAttribute('aria-pressed'),
          stored: JSON.parse(localStorage.getItem('carkingdom:favorites') || '[]').length,
          headerBadge: document.querySelector('a[aria-label^="Favorites"]')?.textContent.trim() ?? null,
        })

        // The second toggle in the pair is compare, which writes to its own
        // context — the two together are what shake out shared-state bugs.
        const compare = document.querySelectorAll('main article button[aria-pressed]')[1]
        compare?.click()
        await wait(500)
        log.steps.push({
          step: 'compare first card',
          pressedAfter: compare?.getAttribute('aria-pressed'),
          stored: JSON.parse(localStorage.getItem('carkingdom:compare') || '[]').length,
          headerBadge: document.querySelector('a[aria-label^="Compare"]')?.textContent.trim() ?? null,
        })

        // Leave the storage as we found it so a re-run starts clean.
        localStorage.removeItem('carkingdom:favorites')
        localStorage.removeItem('carkingdom:compare')

        return { ok: true, ...log }
      })()`,
    )

    // --- Vehicle detail interactions ---------------------------------------
    // The detail page holds the gallery, the payment calculator and three
    // forms. A route sweep only proves it rendered; none of the behaviour a
    // customer actually uses is reachable without driving it.
    await send(session, 'Page.navigate', {
      url: `${BASE}/used-cars/2024-toyota-camry-se`,
    })
    await sleep(1600)

    detail = await evaluate(
      session,
      `(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms))
        const log = { steps: [] }

        const setNativeValue = (el, value) => {
          const proto = el instanceof HTMLSelectElement
            ? HTMLSelectElement.prototype
            : HTMLInputElement.prototype
          Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value)
        }
        const setReact = (el, value, eventName = 'input') => {
          setNativeValue(el, value)
          el.dispatchEvent(new Event(eventName, { bubbles: true }))
        }
        const buttonByText = (root, text) => [...(root ?? document).querySelectorAll('button')]
          .find((b) => b.textContent.trim() === text)
        const openDialog = () => document.querySelector('dialog[open]')
        const fieldError = (input) => {
          const ids = input?.getAttribute('aria-describedby')
          if (!ids) return null
          for (const id of ids.split(' ')) {
            const node = document.getElementById(id)
            if (node && /error|please|closed|choose|enter/i.test(node.textContent)) {
              return node.textContent.trim()
            }
          }
          return null
        }
        const waitFor = async (predicate, timeout = 6000) => {
          const deadline = Date.now() + timeout
          while (Date.now() < deadline) {
            if (predicate()) return true
            await wait(100)
          }
          return false
        }

        // --- Gallery ------------------------------------------------------
        const mainImg = () => document.querySelector('main img')
        const counter = () => [...document.querySelectorAll('main p')]
          .map((p) => p.textContent.trim())
          .find((t) => /^\\d+ \\/ \\d+$/.test(t)) ?? null

        const firstSrc = mainImg()?.getAttribute('src')
        const firstCounter = counter()
        // By aria-label, not by text: the gallery arrows are icon-only, so a
        // text-matching helper finds nothing and the step silently no-ops.
        // (No backticks in here — this code lives inside a template literal.)
        document.querySelector('button[aria-label="Next photo"]')?.click()
        await wait(300)
        log.steps.push({
          step: 'gallery next',
          counterBefore: firstCounter,
          counterAfter: counter(),
          srcChanged: mainImg()?.getAttribute('src') !== firstSrc,
        })

        const thumbs = [...document.querySelectorAll('main ul button[aria-label^="Show photo"]')]
        thumbs[3]?.click()
        await wait(300)
        log.steps.push({
          step: 'gallery thumbnail',
          thumbCount: thumbs.length,
          counter: counter(),
          current: thumbs[3]?.getAttribute('aria-current'),
        })

        // --- Payment calculator -------------------------------------------
        const monthlyText = () => {
          const el = [...document.querySelectorAll('main p')]
            .find((p) => /^\\$[\\d,]+$/.test(p.querySelector('span')?.textContent?.trim() ?? ''))
          return el?.querySelector('span')?.textContent.trim() ?? null
        }
        const termSelect = [...document.querySelectorAll('main select')]
          .find((s) => [...s.options].some((o) => o.value === '84'))
        const before = monthlyText()
        setReact(termSelect, '24', 'change')
        await wait(300)
        log.steps.push({
          step: 'payment calculator',
          before,
          after: monthlyText(),
          termIs24: termSelect?.value === '24',
        })

        // --- Enquiry form: validation then success -------------------------
        buttonByText(document, 'Ask a question')?.click()
        await waitFor(() => openDialog())
        const dialog = openDialog()
        log.steps.push({
          step: 'enquiry modal open',
          open: !!dialog,
          label: dialog?.getAttribute('aria-label') ?? dialog?.querySelector('h2')?.textContent?.trim() ?? null,
        })

        buttonByText(dialog, 'Send enquiry')?.click()
        await wait(300)
        log.steps.push({
          step: 'enquiry empty submit',
          alert: dialog?.querySelector('[role="alert"]')?.textContent.trim() ?? null,
          invalidFields: dialog?.querySelectorAll('[aria-invalid="true"]').length ?? 0,
          stillOpen: !!openDialog(),
        })

        setReact(dialog.querySelector('input[name="name"]'), 'Dana Whitehorse')
        setReact(dialog.querySelector('input[name="email"]'), 'dana@example.com')
        setReact(dialog.querySelector('input[name="phone"]'), '306-555-0142')
        await wait(150)
        buttonByText(dialog, 'Send enquiry')?.click()
        const succeeded = await waitFor(() =>
          /on its way/i.test(openDialog()?.textContent ?? ''),
        )
        log.steps.push({
          step: 'enquiry valid submit',
          succeeded,
          confirmation: openDialog()?.querySelector('[role="status"]')?.textContent.trim() ?? null,
        })
        openDialog()?.querySelector('button[aria-label="Close dialog"]')?.click()
        await wait(400)

        // --- Test drive: the closed-day rule --------------------------------
        buttonByText(document, 'Book a test drive')?.click()
        await waitFor(() => openDialog())
        const drive = openDialog()

        // Next Sunday, computed in the page so it matches the app's own clock.
        const sunday = (() => {
          const d = new Date()
          d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7))
          return d.toISOString().slice(0, 10)
        })()

        setReact(drive.querySelector('input[name="name"]'), 'Dana Whitehorse')
        setReact(drive.querySelector('input[name="email"]'), 'dana@example.com')
        setReact(drive.querySelector('input[name="phone"]'), '306-555-0142')
        const dateInput = drive.querySelector('input[name="date"]')
        setReact(dateInput, sunday)
        await wait(300)
        const timeSelect = drive.querySelector('select[name="time"]')
        log.steps.push({
          step: 'test drive sunday',
          date: sunday,
          timeDisabled: timeSelect?.disabled ?? null,
        })

        buttonByText(drive, 'Request test drive')?.click()
        await wait(400)
        log.steps.push({
          step: 'sunday rejected',
          error: fieldError(dateInput),
          stillOpen: !!openDialog(),
        })

        openDialog()?.querySelector('button[aria-label="Close dialog"]')?.click()
        await wait(300)

        // --- Sold vehicle hides the booking CTA -----------------------------
        return { ok: true, ...log }
      })()`,
    )

    // The sold branch is a different render of the same page, so it needs its
    // own visit rather than another step inside the probe above.
    await send(session, 'Page.navigate', {
      url: `${BASE}/used-cars/2021-toyota-corolla-le`,
    })
    await sleep(1600)
    detail.sold = await evaluate(
      session,
      `(() => {
        const text = document.querySelector('main')?.innerText ?? ''
        const buttons = [...document.querySelectorAll('main button, main a')]
          .map((b) => b.textContent.trim())
        return {
          hasBookCta: buttons.includes('Book a test drive'),
          hasBrowseCta: buttons.includes('Browse similar vehicles'),
          mentionsSold: /has been sold/i.test(text),
        }
      })()`,
    )
  }

  // --- Responsive sweep ---------------------------------------------------
  // `mobile: true` makes Chrome apply the meta viewport and report a layout
  // width that is not the one requested, so the sweep uses mobile: false with
  // an explicit width — that is what CSS media queries actually evaluate.
  const BREAKPOINTS = [360, 390, 480, 640, 768, 1024, 1280, 1440]
  const responsive = []

  for (const width of BREAKPOINTS) {
    await send(session, 'Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await visit(session, '/', `Home @${width}`)

    const row = await evaluate(
      session,
      `(() => {
        const vis = (el) => !!el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0
        const header = document.querySelector('header')
        const bar = header.querySelector('.container-page')
        const has = (text) => [...document.querySelectorAll('header a')].some(a => a.textContent.trim() === text && vis(a))
        return {
          width: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
          hamburger: vis(document.querySelector('button[aria-label="Open menu"]')),
          desktopNav: vis(document.querySelector('header nav[aria-label="Main"]')),
          favoritesIcon: vis(document.querySelector('a[aria-label^="Favorites"]')),
          browseCars: has('Browse Cars'),
          bookAppt: has('Book Appointment'),
          headerOverflows: bar ? bar.scrollWidth > bar.clientWidth + 1 : null,
          utilBar: vis(header.querySelector('.bg-brand-950')),
          offenders: [...document.querySelectorAll('body *')]
            .map((el) => ({ el, r: el.getBoundingClientRect() }))
            .filter(({ r }) => r.width > 0 && r.right > window.innerWidth + 1)
            .slice(0, 5)
            .map(({ el, r }) =>
              el.tagName.toLowerCase() +
              (el.className ? '.' + String(el.className).split(' ').slice(0, 3).join('.') : '') +
              ' [right=' + Math.round(r.right) + ' w=' + Math.round(r.width) + ']'
            ),
        }
      })()`,
    )
    responsive.push(row)

    if (row.overflowX) {
      problems.push(
        `Horizontal page overflow at ${width}px (scrollWidth ${row.scrollWidth} > ${row.width})`,
      )
    }
    if (row.headerOverflows) {
      problems.push(`Header content overflows its container at ${width}px`)
    }
  }

  // --- Mobile drawer at a true 390px viewport -----------------------------
  await send(session, 'Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: false,
  })
  await visit(session, '/', 'Home (mobile)')

  const drawer = await evaluate(
    session,
    `(async () => {
      const btn = document.querySelector('button[aria-label="Open menu"]')
      if (!btn) return { ok: false, reason: 'no hamburger button at 390px' }
      btn.click()
      await new Promise(r => setTimeout(r, 800))
      const dialog = document.querySelector('[role="dialog"][aria-label="Main menu"]')
      if (!dialog) return { ok: false, reason: 'drawer did not mount' }
      const rect = dialog.getBoundingClientRect()
      return {
        ok: true,
        innerWidth: window.innerWidth,
        panelWidth: getComputedStyle(dialog).width,
        panelLeft: Math.round(rect.left),
        panelRight: Math.round(rect.right),
        onScreen: rect.right <= window.innerWidth + 1,
        drawerLinks: [...dialog.querySelectorAll('a')].length,
        clippedText: [...dialog.querySelectorAll('a, p, span')].filter(
          (el) => el.scrollWidth > el.clientWidth + 1,
        ).length,
      }
    })()`,
  )

  if (drawer.ok) {
    if (!drawer.onScreen) problems.push('Mobile drawer extends past the right edge')
    if (drawer.clippedText > 0) {
      problems.push(`Mobile drawer: ${drawer.clippedText} clipped text element(s)`)
    }
  } else {
    problems.push(`Mobile drawer: ${drawer.reason}`)
  }

  // A closed drawer must not be reachable by keyboard.
  const closedFocus = await evaluate(
    session,
    `(async () => {
      const closeBtn = document.querySelector('[role="dialog"] button[aria-label^="Close"]')
      closeBtn?.click()
      await new Promise(r => setTimeout(r, 600))
      const link = document.querySelector('[role="dialog"] a')
      if (!link) return { ok: false, reason: 'no links in drawer' }
      link.focus()
      return {
        ok: true,
        focusableWhenClosed: document.activeElement === link,
        drawerInert: document.querySelector('[role="dialog"]')?.closest('[inert]') !== null,
      }
    })()`,
  )

  if (closedFocus.ok && closedFocus.focusableWhenClosed) {
    problems.push('Closed mobile drawer is still keyboard-focusable')
  }
  if (closedFocus.ok && !closedFocus.drawerInert) {
    problems.push('Closed mobile drawer is not marked inert')
  }

  await screenshot(session, join(SHOT_DIR, 'cd-shot-mobile-drawer.png'))

  // --- Report -------------------------------------------------------------
  console.log('\n================ ROUTES ================')
  for (const r of results) {
    const flag = r.header && r.footer ? 'ok ' : 'BAD'
    console.log(
      `${flag} ${r.path.padEnd(34)} h1=${JSON.stringify(r.h1)} imgs=${r.imgCount} broken=${r.brokenImgs}`,
    )
    if (r.duplicateIds?.length) {
      problems.push(`${r.path}: duplicate DOM ids — ${r.duplicateIds.join(', ')}`)
    }
  }

  console.log('\n================ MARKETPLACE INTERACTIONS ================')
  if (!interactions) {
    console.log('skipped (--responsive-only)')
  } else if (!interactions.ok) {
    problems.push(`Interactions aborted: ${interactions.reason}`)
    console.log(`FAILED: ${interactions.reason}`)
  } else {
    for (const step of interactions.steps) {
      const { step: name, ...rest } = step
      console.log(`${name.padEnd(22)} ${JSON.stringify(rest)}`)
    }

    const byStep = Object.fromEntries(interactions.steps.map((s) => [s.step, s]))
    const initial = byStep.initial
    const filtered = byStep['filter make=Toyota']
    const twoMakes = byStep['add make=Honda']
    const chipped = byStep['remove Toyota via chip']
    const cleared = byStep['clear all']
    const sortedStep = byStep['sort price-asc']
    const listStep = byStep['view=list']
    const paged = byStep['page 2']
    const searched = byStep['search "truck"']
    const favorited = byStep['favorite first card']
    const compared = byStep['compare first card']

    const expect = (condition, message) => {
      if (!condition) problems.push(`Interactions: ${message}`)
    }

    expect(filtered?.url.includes('make=Toyota'), 'filtering by make did not reach the URL')
    expect(filtered?.count < initial?.count, 'filtering by make did not narrow the results')
    expect(filtered?.allToyota, 'a non-Toyota card survived the make filter')
    expect(filtered?.chips?.length === 1, 'the active filter chip was not rendered')
    expect(twoMakes?.count > filtered?.count, 'adding a second make did not widen the results')
    expect(chipped?.allHonda, 'removing the Toyota chip left Toyota cards behind')
    expect(cleared?.url === '' , `clear all left a query string: ${cleared?.url}`)
    expect(cleared?.count === initial?.count, 'clear all did not restore the full result set')
    expect(sortedStep?.ascending, 'price-asc did not order the results')
    expect(listStep?.pressed === 'true', 'the list view button did not report itself pressed')
    expect(listStep?.rowWidth > listStep?.gridWidthAtGrid, 'list view rows are not wider than grid cards')
    expect(paged?.firstTitleChanged, 'page 2 showed the same first vehicle as page 1')
    expect(searched?.pageReset, 'changing the search did not reset to page 1')
    expect(favorited?.pressedAfter === 'true', 'the favorite button did not toggle on')
    expect(favorited?.stored === 1, 'the favorite was not persisted to localStorage')
    expect(favorited?.headerBadge?.includes('1'), 'the header favorites count did not update')
    expect(compared?.pressedAfter === 'true', 'the compare button did not toggle on')
    expect(compared?.stored === 1, 'the comparison was not persisted to localStorage')
  }

  console.log('\n================ VEHICLE DETAIL INTERACTIONS ================')
  if (!detail) {
    console.log('skipped (--responsive-only)')
  } else if (!detail.ok) {
    problems.push(`Detail interactions aborted: ${detail.reason}`)
    console.log(`FAILED: ${detail.reason}`)
  } else {
    for (const step of detail.steps) {
      const { step: name, ...rest } = step
      console.log(`${name.padEnd(24)} ${JSON.stringify(rest)}`)
    }
    console.log(`sold vehicle            ${JSON.stringify(detail.sold)}`)

    const byStep = Object.fromEntries(detail.steps.map((s) => [s.step, s]))
    const galleryNext = byStep['gallery next']
    const galleryThumb = byStep['gallery thumbnail']
    const calculator = byStep['payment calculator']
    const modalOpen = byStep['enquiry modal open']
    const emptySubmit = byStep['enquiry empty submit']
    const validSubmit = byStep['enquiry valid submit']
    const sunday = byStep['test drive sunday']
    const rejected = byStep['sunday rejected']

    const expect = (condition, message) => {
      if (!condition) problems.push(`Detail: ${message}`)
    }

    expect(galleryNext?.srcChanged, 'the next-photo button did not change the image')
    expect(galleryNext?.counterAfter === '2 / 5', `counter did not advance: ${galleryNext?.counterAfter}`)
    expect(galleryThumb?.thumbCount === 5, `expected 5 thumbnails, found ${galleryThumb?.thumbCount}`)
    expect(galleryThumb?.counter === '4 / 5', `thumbnail did not select photo 4: ${galleryThumb?.counter}`)
    expect(galleryThumb?.current === 'true', 'the selected thumbnail is not marked current')
    expect(calculator?.termIs24, 'the term select did not accept 24 months')
    expect(
      calculator?.before !== calculator?.after,
      'a shorter term did not change the estimated payment',
    )
    expect(modalOpen?.open, 'the enquiry dialog did not open')
    expect(emptySubmit?.stillOpen, 'an invalid enquiry closed the dialog')
    expect(emptySubmit?.invalidFields === 3, `expected 3 invalid fields, found ${emptySubmit?.invalidFields}`)
    expect(!!emptySubmit?.alert, 'no error summary was shown for an empty enquiry')
    expect(validSubmit?.succeeded, 'a valid enquiry did not reach the confirmation')
    expect(sunday?.timeDisabled === true, 'Sunday did not disable the time slot picker')
    expect(
      /sunday/i.test(rejected?.error ?? ''),
      `a Sunday test drive was not refused: ${rejected?.error}`,
    )
    expect(rejected?.stillOpen, 'a refused test drive closed the dialog')
    expect(detail.sold?.mentionsSold, 'the sold vehicle does not say it has sold')
    expect(detail.sold?.hasBrowseCta, 'the sold vehicle offers no way on to other inventory')
    expect(!detail.sold?.hasBookCta, 'the sold vehicle still offers a test drive')
  }

  console.log('\n================ VEHICLE ACTION BAR ================')
  // The bar is the only pinned element in the app, and the interesting
  // question is not whether it renders but whether it lets go of the footer.
  for (const width of [390, 1280]) {
    await send(session, 'Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await send(session, 'Page.navigate', {
      url: `${BASE}/used-cars/2024-toyota-camry-se`,
    })
    await sleep(1400)
    await waitForMount(session)

    const row = await evaluate(
      session,
      `(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms))

        // Lazy images change the document height as they load, so a single
        // scrollTo lands short of the bottom and every measurement taken from
        // it is wrong. Scroll until the position stops moving instead.
        let previous = -1
        for (let i = 0; i < 12; i++) {
          window.scrollTo(0, document.documentElement.scrollHeight)
          await wait(250)
          if (Math.abs(window.scrollY - previous) < 2) break
          previous = window.scrollY
        }

        const bar = [...document.querySelectorAll('main > div')].find(
          (d) => getComputedStyle(d).position === 'sticky',
        )
        const footer = document.querySelector('footer')
        const visible = !!bar && getComputedStyle(bar).display !== 'none'
          && bar.getBoundingClientRect().height > 0

        const barRect = visible ? bar.getBoundingClientRect() : null
        const footerRect = footer.getBoundingClientRect()
        const lastRow = footer.lastElementChild.getBoundingClientRect()

        return {
          visible,
          height: barRect ? Math.round(barRect.height) : 0,
          // The bar is constrained to <main>, so its bottom edge must never
          // pass the top of the footer. That is the property that keeps the
          // footer readable — which is the whole reason it is sticky and not
          // fixed.
          clearsFooter: !barRect || barRect.bottom <= Math.round(footerRect.top) + 1,
          // And the footer's last line has to be reachable at the true bottom.
          footerLastRowReachable:
            lastRow.bottom <= window.innerHeight + 1 && lastRow.top >= 0,
          atBottom:
            Math.abs(
              window.scrollY + window.innerHeight -
                document.documentElement.scrollHeight,
            ) < 3,
          overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
        }
      })()`,
    )

    console.log(`${String(width).padEnd(6)} ${JSON.stringify(row)}`)

    if (!row.atBottom) problems.push(`Action bar: could not scroll to the bottom at ${width}`)
    if (!row.footerLastRowReachable) {
      problems.push(`Action bar: the footer's last row is unreachable at ${width}`)
    }
    if (width === 390) {
      if (!row.visible) problems.push('Action bar: not visible on a phone')
      if (!row.clearsFooter) problems.push('Action bar: overlaps the footer on a phone')
    } else if (row.visible) {
      problems.push('Action bar: still visible on desktop')
    }
    if (row.overflowX) problems.push(`Action bar: horizontal overflow at ${width}`)
  }

  console.log('\n================ RESPONSIVE ================')
  console.log('width  ovfX   burger nav   fav   browse appt  util  hdrOvf')
  for (const r of responsive) {
    console.log(
      `${String(r.width).padEnd(6)} ${String(r.overflowX).padEnd(6)} ${String(r.hamburger).padEnd(6)} ${String(r.desktopNav).padEnd(5)} ${String(r.favoritesIcon).padEnd(5)} ${String(r.browseCars).padEnd(6)} ${String(r.bookAppt).padEnd(5)} ${String(r.utilBar).padEnd(5)} ${r.headerOverflows}`,
    )
    if (r.offenders?.length) {
      r.offenders.forEach((o) => console.log(`         ↳ ${o}`))
    }
  }

  console.log('\n================ MOBILE DRAWER ================')
  console.log(JSON.stringify(drawer, null, 2))
  console.log(`closed drawer inert: ${closedFocus.drawerInert}`)
  console.log(`closed drawer focusable: ${closedFocus.focusableWhenClosed}`)

  console.log('\n================ CONSOLE ================')
  console.log(`errors:   ${consoleErrors.length}`)
  consoleErrors.slice(0, 12).forEach((e) => console.log(`  ERR ${e.slice(0, 300)}`))
  console.log(`warnings: ${consoleWarnings.length}`)
  consoleWarnings.slice(0, 12).forEach((w) => console.log(`  WARN ${w.slice(0, 300)}`))
  console.log(`uncaught exceptions: ${exceptions.length}`)
  exceptions.slice(0, 6).forEach((e) => console.log(`  EXC ${e.slice(0, 300)}`))

  console.log('\n================ PROBLEMS ================')
  if (problems.length === 0) console.log('none')
  problems.forEach((p) => console.log(`  - ${p}`))

  // A run that found problems has to fail the process, or `npm run drive`
  // exits 0 and CI (or a hurried reader) takes a red run for a green one.
  if (problems.length > 0) process.exitCode = 1

  await closeTab(tab.id)

  // Closing the socket and letting the event loop drain on its own avoids a
  // libuv assertion on Windows that an abrupt process.exit() triggers while an
  // async handle is still closing.
  await new Promise((resolve) => {
    session.ws.addEventListener('close', resolve)
    session.ws.close()
    setTimeout(resolve, 1500)
  })
}

main().catch((error) => {
  console.error('DRIVER FAILED:', error)
  process.exitCode = 1
})
