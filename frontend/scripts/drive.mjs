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

/**
 * Progress trace, on stderr so the report on stdout stays clean.
 *
 * The probes all run before a single line of the report is printed, so a run
 * that dies mid-way previously produced *nothing* — indistinguishable from a
 * run that is still working. Every section announces itself first, which turns
 * a silent hang into a named one.
 */
function step(name) {
  process.stderr.write(`  .. ${name}\n`)
}

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

/**
 * `timeoutMs` matters for any expression that waits inside the page. The CDP
 * call cannot return until the awaited promise settles, so an expression
 * holding several `waitFor` calls needs a budget larger than their sum — with
 * the 15s default it dies as a "CDP timeout" and looks like a hung browser.
 */
async function evaluate(session, expression, timeoutMs = 15000) {
  const result = await send(
    session,
    'Runtime.evaluate',
    {
      expression,
      returnByValue: true,
      awaitPromise: true,
    },
    timeoutMs,
  )
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
let services = null
let booking = null
let footerLinks = []

async function visit(session, path, label) {
  step(`route ${path}`)
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

  step('client-side navigation')
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
      ['/services/detailing', 'Service Details (last in catalogue)'],
      ['/services/not-a-real-service', 'Service Details (404)'],
      ['/appointments', 'Appointments'],
      ['/appointments?service=brake-service', 'Appointments (preselected)'],
      ['/parts', 'Parts'],
      // `brake-pad-set-front` was a placeholder written in Phase 1, before the
      // parts data existed. When Phase 5 gave the catalogue real slugs this
      // became a 404 — which the sweep happily reported as a pass, because a
      // 404 page renders a heading like any other. The slug below is built by
      // `definePart` from the brand and name, so it is the brand-prefixed form.
      ['/parts/meridian-ceramic-brake-pads-front', 'Part Details'],
      ['/parts/not-a-real-part', 'Part Details (404)'],
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

    // --- Every link in the footer ------------------------------------------
    // Added in Phase 4 after finding four of them pointed at service slugs that
    // did not exist. Nothing caught it for three phases: the route sweep checks
    // the routes someone remembered to list, and the service-detail page used to
    // render for any slug at all. A link list that is typed by hand drifts, so
    // this walks the footer and resolves every href it finds.
    footerLinks = await evaluate(
      session,
      `(() => {
        const hrefs = [...document.querySelectorAll('footer a[href^="/"]')]
          .map((a) => a.getAttribute('href'))
        return [...new Set(hrefs)]
      })()`,
    )

    const footerResults = []
    for (const href of footerLinks) {
      // Query strings are dropped: the sweep is asking whether the path exists,
      // and every filter combination is the marketplace's job, not this one's.
      const path = href.split('?')[0]
      await send(session, 'Page.navigate', { url: `${BASE}${href}` })
      await sleep(900)
      await waitForMount(session)

      const result = await evaluate(
        session,
        `(async () => {
          const wait = (ms) => new Promise((r) => setTimeout(r, ms))
          const deadline = Date.now() + 12000
          const heading = () =>
            document.querySelector('main h1')?.textContent?.trim() ?? null
          const copy = () => document.querySelector('main')?.textContent ?? ''

          // Two identical headings in a row, and a heading at all. Reading once
          // after a fixed sleep was wrong twice over: the poll could see the
          // previous document's h1 before the navigation committed, and the
          // service-detail page renders without any h1 at all while its request
          // is in flight. Either way the sweep reported a working link as dead.
          let previous = null
          let current = null
          while (Date.now() < deadline) {
            current = heading()
            if (current && current === previous) break
            previous = current
            await wait(200)
          }

          return {
            h1: current,
            // The two pages a valid link can land on that still mean the link is
            // wrong. Checked by copy rather than by status code, because a
            // client-side route answers 200 whatever it renders.
            broken: /couldn.t find that (service|vehicle)|took a wrong turn/i.test(copy()),
          }
        })()`,
      )

      footerResults.push({ href, path, ...result })
    }

    const brokenLinks = footerResults.filter((row) => row.broken || !row.h1)
    if (brokenLinks.length > 0) {
      for (const row of brokenLinks) {
        problems.push(
          `Footer link goes nowhere: ${row.href} (h1=${JSON.stringify(row.h1)})`,
        )
      }
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

        // The facets arrive with the inventory, and the inventory is a mock
        // request. Reading the aside straight after the navigation used to work
        // by luck; it aborted the whole probe the one time the dev server was
        // slow enough to still be transforming modules.
        await waitFor(() => document.querySelectorAll('aside input[type=checkbox]').length > 0)

        // Recorded after that wait, not before: the baseline the "clear all"
        // assertion compares against has to be a count that was actually read,
        // and read too early it is null — which makes a working reset look like
        // a failure to restore the result set.
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

        // Wait for the vehicle to arrive before touching the gallery. Read too
        // early this finds no image and no counter, and "the next-photo button
        // did not change the image" is then a report about the harness that
        // looks exactly like a report about the app.
        await waitFor(() => mainImg() && counter())

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
        // Phase 4 replaced the free date input with a shared SchedulePicker, so
        // this rule moved out of validation and into the control: a Sunday is a
        // disabled chip that cannot be chosen at all. The probe asserts the
        // control rather than the old "we are closed on Sundays" message, since
        // that message would still appear against a picker that offered Sundays
        // and only rejected them after the customer had picked one.
        buttonByText(document, 'Book a test drive')?.click()
        await waitFor(() => openDialog())
        const drive = openDialog()

        const fieldsetByLegend = (root, text) =>
          [...root.querySelectorAll('fieldset')]
            .find((f) => f.querySelector('legend')?.textContent.trim() === text)
        const dayChips = () =>
          [...(fieldsetByLegend(drive, 'Preferred day')?.querySelectorAll('button') ?? [])]
        const slotButtons = () =>
          [...(fieldsetByLegend(drive, 'Preferred time')?.querySelectorAll('button') ?? [])]
        const pressedDay = () =>
          dayChips().find((b) => b.getAttribute('aria-pressed') === 'true') ?? null
        const pressedSlot = () =>
          slotButtons().find((b) => b.getAttribute('aria-pressed') === 'true') ?? null

        // The slot list comes from the mock service, so wait for it rather than
        // guess a sleep long enough to cover a slow render.
        await waitFor(() => slotButtons().length > 0)

        // Empty submit first, while the error summary is still the only thing
        // on screen — the same dialog-scrolling hazard the enquiry form has.
        buttonByText(drive, 'Request test drive')?.click()
        await wait(300)
        log.steps.push({
          step: 'test drive: empty submit',
          alert: drive.querySelector('[role="alert"]')?.textContent.trim() ?? null,
          invalidFields: drive.querySelectorAll('[aria-invalid="true"]').length,
          stillOpen: !!openDialog(),
        })

        const closedChips = dayChips().filter((b) => b.disabled)
        const openedOn = pressedDay()?.getAttribute('aria-label') ?? null
        closedChips[0]?.click()
        await wait(300)
        log.steps.push({
          step: 'test drive: closed days',
          dayChips: dayChips().length,
          closedChips: closedChips.length,
          closedLabels: closedChips.map((b) => b.getAttribute('aria-label')),
          // It opens on a bookable day, so the times are on screen immediately
          // rather than behind a click.
          openedOn,
          closedChipIgnored: (pressedDay()?.getAttribute('aria-label') ?? null) === openedOn,
        })

        log.steps.push({
          step: 'test drive: slots',
          slots: slotButtons().length,
          free: slotButtons().filter((b) => !b.disabled).length,
          // A crossed-out time that will not say why is the usual complaint
          // about booking widgets, so the reason is part of the contract.
          reasons: [
            ...new Set(slotButtons().filter((b) => b.disabled).map((b) => b.title)),
          ].filter(Boolean),
        })

        // The same day strip renders in here on a much narrower box than the
        // appointment page gives it. It is the same component, but not the same
        // container, and the bug it once had — a fieldset that would not shrink
        // below its fourteen chips — was invisible from the DOM.
        const strip = [...drive.querySelectorAll('fieldset div')]
          .find((d) => getComputedStyle(d).overflowX === 'auto')
        const stripRect = strip?.getBoundingClientRect()
        const dialogRect = drive.getBoundingClientRect()
        const stripLastChip = strip ? [...strip.querySelectorAll('button')].pop() : null
        log.steps.push({
          step: 'test drive: day strip',
          dialogWidth: Math.round(dialogRect.width),
          stripWidth: stripRect ? Math.round(stripRect.width) : null,
          insideDialog: !!stripRect && stripRect.right <= dialogRect.right + 1,
          scrolls: !!strip && strip.scrollWidth > strip.clientWidth,
          holdsEveryDay:
            !!strip &&
            !!stripLastChip &&
            stripLastChip.getBoundingClientRect().right <=
              stripRect.left + strip.scrollWidth + 1,
        })

        // Changing the day must drop the chosen time: a slot belongs to a day,
        // so carrying one across would book a time that does not exist.
        const pickedSlot = slotButtons().find((b) => !b.disabled)
        const pickedSlotLabel = pickedSlot?.textContent.trim() ?? null
        pickedSlot?.click()
        await wait(200)
        const registered = pressedSlot()?.textContent.trim() ?? null

        const otherDay = dayChips().find(
          (b) => !b.disabled && b.getAttribute('aria-pressed') !== 'true',
        )
        otherDay?.click()
        await waitFor(() => slotButtons().length > 0)
        await wait(250)
        log.steps.push({
          step: 'test drive: day change clears time',
          pickedSlot: pickedSlotLabel,
          registered,
          cleared: pressedSlot() === null,
          reloadedSlots: slotButtons().length,
        })

        // Now fill the whole thing in and book it.
        //
        // The day to book on has to be searched for, not assumed. Some days in
        // the mock diary are fully booked, so "the next day along" is not
        // reliably bookable — the probe clicked it, found every time disabled,
        // clicked nothing, submitted an incomplete form and reported that a
        // filled-in test drive never reached the confirmation.
        let bookingSlot = slotButtons().find((b) => !b.disabled)
        for (const chip of dayChips()) {
          if (bookingSlot) break
          if (chip.disabled || chip.getAttribute('aria-pressed') === 'true') continue
          chip.click()
          await waitFor(() => slotButtons().length > 0)
          await wait(250)
          bookingSlot = slotButtons().find((b) => !b.disabled)
        }

        const bookingSlotLabel = bookingSlot?.textContent.trim() ?? null
        bookingSlot?.click()
        setReact(drive.querySelector('input[name="name"]'), 'Dana Whitehorse')
        setReact(drive.querySelector('input[name="email"]'), 'dana@example.com')
        setReact(drive.querySelector('input[name="phone"]'), '306-555-0142')
        await wait(200)
        buttonByText(drive, 'Request test drive')?.click()
        const driveBooked = await waitFor(() => /test drive is booked/i.test(drive.textContent))
        log.steps.push({
          step: 'test drive: booked',
          slot: bookingSlotLabel,
          booked: driveBooked,
          confirmation: drive.querySelector('[role="status"]')?.textContent.trim() ?? null,
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
      `(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms))
        // Poll for the page rather than reading it once after a sleep. The
        // vehicle arrives on a mock request, so a fixed wait that is generous
        // on a warm dev server is not generous on a cold one — and the failure
        // it produces reads as "the sold vehicle still offers a test drive",
        // which is a bug report about the app rather than about the harness.
        const deadline = Date.now() + 12000
        const read = () => {
          const text = document.querySelector('main')?.innerText ?? ''
          const buttons = [...document.querySelectorAll('main button, main a')]
            .map((b) => b.textContent.trim())
          return {
            hasBookCta: buttons.includes('Book a test drive'),
            hasBrowseCta: buttons.includes('Browse similar vehicles'),
            mentionsSold: /has been sold/i.test(text),
          }
        }
        let row = read()
        while (Date.now() < deadline && !row.mentionsSold) {
          await wait(200)
          row = read()
        }
        return row
      })()`,
    )
  }

  step('service catalogue and booking')
  // --- Service catalogue and booking ---------------------------------------
  // Phase 4's own surface. The listing is the only place every service is on
  // screen at once, which is where a card pointing at a slug nobody defined
  // shows up; the booking page is the only place the shop's real constraints —
  // shut days, job length, times already gone — become visible at all.
  if (!RESPONSIVE_ONLY) {
    await send(session, 'Page.navigate', { url: `${BASE}/services` })
    await sleep(1600)

    services = await evaluate(
      session,
      `(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms))
        const waitFor = async (predicate, timeout = 6000) => {
          const deadline = Date.now() + timeout
          while (Date.now() < deadline) {
            if (predicate()) return true
            await wait(100)
          }
          return false
        }
        const cards = () => [...document.querySelectorAll('main article')]

        // The expected catalogue comes from the app's own service layer, not
        // from a number typed in here. A harness that counts to eight is
        // testing its own copy of the list.
        let catalogue = []
        let dataError = null
        try {
          const mod = await import('/src/services/services.js')
          catalogue = await mod.getServices()
        } catch (error) {
          dataError = String(error)
        }

        const mounted = await waitFor(() => cards().length > 0)
        const hrefs = cards().map((c) => c.querySelector('h3 a')?.getAttribute('href') ?? null)
        const prices = cards().map((c) => {
          const m = /From \\$([\\d,.]+)/.exec(c.innerText)
          return m ? Number(m[1].replace(/,/g, '')) : null
        })

        return {
          ok: true,
          dataError,
          mounted,
          catalogueSize: catalogue.length,
          cards: cards().length,
          hrefs,
          prices,
          // Every card resolves to something the catalogue actually holds...
          allResolve: hrefs.every((href) =>
            catalogue.some((s) => '/services/' + s.slug === href),
          ),
          // ...and every service has a card, so none is silently missing.
          allListed: catalogue.every((s) =>
            hrefs.includes('/services/' + s.slug),
          ),
          // The stretched-link rule: one link per card, not a title link plus a
          // "Learn more" link to the same place.
          oneLinkPerCard: cards().every((c) => c.querySelectorAll('a').length === 1),
          pricesMatch: catalogue.every((s) => prices.includes(s.startingPrice)),
        }
      })()`,
    )

    await send(session, 'Page.navigate', { url: `${BASE}/services/brake-service` })
    await sleep(1500)
    services.detail = await evaluate(
      session,
      `(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms))
        const waitFor = async (predicate, timeout = 6000) => {
          const deadline = Date.now() + timeout
          while (Date.now() < deadline) {
            if (predicate()) return true
            await wait(100)
          }
          return false
        }
        const main = () => document.querySelector('main')
        await waitFor(() => /Brake Repair/.test(main()?.textContent ?? ''))
        // The related strip arrives on a second request of its own, so wait for
        // it rather than counting whatever has rendered by now.
        await waitFor(() => document.querySelectorAll('main article').length > 0)

        const mod = await import('/src/services/services.js')
        const service = await mod.getServiceBySlug('brake-service')
        const related = await mod.getRelatedServices('brake-service', 3)

        const text = main().innerText
        const headings = [...main().querySelectorAll('h2')].map((h) => h.textContent.trim())
        const links = [...main().querySelectorAll('a')].map((a) => ({
          href: a.getAttribute('href'),
          label: a.textContent.trim(),
        }))
        const bookLinks = links.filter((l) => l.label === 'Book this service')
        // The closing band is a general "book an appointment", not a link to
        // this service, so it is allowed to arrive without the slug. Every link
        // that names the service has to carry it, which is what makes the
        // appointment form open with the service already chosen.
        const genericLink = 'Book an appointment'
        const scopedLinks = links.filter(
          (l) => l.href?.startsWith('/appointments') && l.label !== genericLink,
        )
        const relatedCards = [...document.querySelectorAll('main article')]

        return {
          ok: true,
          h1: main().querySelector('h1')?.textContent.trim() ?? null,
          // The longest-form fields, which only exist on the detail page.
          hasEveryFeature: service.features.every((f) => text.includes(f)),
          hasEverySymptom: service.symptoms.every((s) => text.includes(s)),
          hasDescription: text.includes(service.description),
          price: /\\$189/.test(text),
          headings,
          bookingLinkCount: bookLinks.length,
          bookingLinkLabels: links
            .filter((l) => l.href?.startsWith('/appointments'))
            .map((l) => l.label),
          bookingLinksCarrySlug:
            bookLinks.length >= 2 &&
            bookLinks.every((l) => l.href === '/appointments?service=brake-service'),
          everyScopedLinkCarriesSlug:
            scopedLinks.length > 0 &&
            scopedLinks.every((l) => l.href === '/appointments?service=brake-service'),
          relatedCards: relatedCards.length,
          relatedExpected: related.length,
          relatedResolve: relatedCards.every((c) =>
            related.some((s) => c.querySelector('h3 a')?.getAttribute('href') === '/services/' + s.slug),
          ),
          // A detail page that offered itself under "other things we do" would
          // be telling the customer to read the page they are on.
          excludesItself: !relatedCards.some(
            (c) => c.querySelector('h3 a')?.getAttribute('href') === '/services/brake-service',
          ),
        }
      })()`,
    )

    await send(session, 'Page.navigate', {
      url: `${BASE}/appointments?service=brake-service`,
    })
    await sleep(1800)

    booking = await evaluate(
      session,
      `(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms))
        const waitFor = async (predicate, timeout = 8000) => {
          const deadline = Date.now() + timeout
          while (Date.now() < deadline) {
            if (predicate()) return true
            await wait(100)
          }
          return false
        }
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
        const buttonByText = (root, text) =>
          [...(root ?? document).querySelectorAll('button')]
            .find((b) => b.textContent.trim() === text)

        // The diary the picker will show, read from the app's own availability
        // service. A harness that hardcodes "Tuesday is full" is testing its own
        // copy of the rule and would keep passing after the rule changed.
        const schedule = await import('/src/utils/scheduling.js')
        const availability = await import('/src/services/appointments.js')
        const days = schedule.upcomingDays()

        const diary = await Promise.all(
          days.map(async (day) => ({
            iso: day.iso,
            label: day.label,
            closed: day.closed,
            data: day.closed
              ? null
              : await availability.getAppointmentAvailability(day.iso, { durationHours: 3 }),
          })),
        )
        const openDay = diary.find((d) => d.data?.slots.some((s) => s.available)) ?? null
        const fullDay =
          diary.find(
            (d) => d.data && d.data.slots.length > 0 && !d.data.slots.some((s) => s.available),
          ) ?? null

        const fieldsetByLegend = (text) =>
          [...document.querySelectorAll('main fieldset')]
            .find((f) => f.querySelector('legend')?.textContent.trim() === text)
        const dayChips = () =>
          [...(fieldsetByLegend('Preferred day')?.querySelectorAll('button') ?? [])]
        const slotButtons = () =>
          [...(fieldsetByLegend('Preferred time')?.querySelectorAll('button') ?? [])]
        const chipFor = (label) =>
          dayChips().find((b) => b.getAttribute('aria-label') === label) ?? null
        const pressedDay = () =>
          dayChips().find((b) => b.getAttribute('aria-pressed') === 'true')?.getAttribute('aria-label') ?? null
        const pressedSlot = () =>
          slotButtons().find((b) => b.getAttribute('aria-pressed') === 'true') ?? null
        const reasons = () =>
          slotButtons().reduce((acc, b) => {
            const key = b.disabled ? (b.title ?? 'no reason given') : 'free'
            acc[key] = (acc[key] ?? 0) + 1
            return acc
          }, {})
        const tooLate = () => reasons()['Too late for this job'] ?? 0
        const mainText = () => document.querySelector('main').textContent

        /**
         * Moves the picker onto a day, and waits for the diary to come back.
         *
         * Clicking a different day re-reads availability, and the picker swaps
         * the slot grid for skeletons while it does. Waiting on that empty phase
         * is what makes this a real reload: polling only for "some slots exist"
         * would read the previous day's grid and pass before the new one landed.
         */
        const selectDay = async (label) => {
          if (pressedDay() === label) return true
          chipFor(label)?.click()
          await waitFor(() => slotButtons().length === 0)
          await waitFor(() => slotButtons().length > 0)
          return pressedDay() === label
        }

        const select = document.querySelector('select[name="serviceSlug"]')
        const preselected = select?.value ?? null

        await waitFor(() => slotButtons().length > 0)

        // Counted now, not at the end: a successful submit replaces the whole
        // form with its confirmation, so anything read off the picker after that
        // reads an empty page.
        const dayChipTotal = dayChips().length
        const closedChipTotal = dayChips().filter((b) => b.disabled).length
        const optionTotal = select ? select.options.length : 0

        // Empty submit while nothing but the preselected service is filled.
        buttonByText(document.querySelector('main'), 'Request appointment')?.click()
        await wait(300)
        const emptySubmit = {
          alert: document.querySelector('main [role="alert"]')?.textContent.trim() ?? null,
          invalidFields: document.querySelectorAll('main [aria-invalid="true"]').length,
          nameError: /Please enter your name\\./.test(mainText()),
          vehicleError: /Please tell us the vehicle/.test(mainText()),
          timeError: /Please choose a time\\./.test(mainText()),
          // A form that had quietly dropped the query parameter would ask for
          // the service here — this is what proves the prefill is real.
          serviceError: /Please choose the service you need\\./.test(mainText()),
        }

        if (openDay) await selectDay(openDay.label)

        const brake = {
          day: pressedDay(),
          slots: slotButtons().length,
          reasons: reasons(),
        }

        // Pick a free time, then change the job to a one-hour oil change. The
        // times offered depend on how long the job takes, so the choice has to
        // go — otherwise the form holds a slot that no longer exists.
        const free = slotButtons().find((b) => !b.disabled)
        free?.click()
        await wait(250)
        brake.chosen = pressedSlot()?.textContent.trim() ?? null

        setReact(select, 'oil-change', 'change')
        await waitFor(() => select.value === 'oil-change')
        await waitFor(() => slotButtons().length === 0)
        // Three hours rules out the last two slots of the day; one hour rules
        // out none. Waiting on that count is what makes this a real reload
        // rather than a sleep that happened to be long enough.
        await waitFor(() => slotButtons().length > 0 && tooLate() === 0)
        const oil = {
          slots: slotButtons().length,
          reasons: reasons(),
          timeCleared: pressedSlot() === null,
          dayKept: pressedDay() === brake.day,
        }

        /**
         * The "nothing left that day" state, reached by asking the app which day
         * it is on rather than by faking one. Roughly one day in nine is full,
         * so a two-week window usually contains one but not always — when it
         * does not, the step says so instead of pretending.
         *
         * The brake job has to be back on first, and that is not tidiness. How
         * much of a day is bookable depends on how long the job takes, so
         * fullDay — derived above at three hours — is only full for a
         * three-hour job. Asserting it with the one-hour oil change still
         * selected found a free slot on a day the probe had just called full,
         * and reported it as the app failing to warn the customer. The day
         * list and the picker have to be talking about the same job.
         */
        let fullState = null
        if (fullDay) {
          setReact(select, 'brake-service', 'change')
          await waitFor(() => select.value === 'brake-service')
          await waitFor(() => slotButtons().length === 0)
          await waitFor(() => slotButtons().length > 0)

          await selectDay(fullDay.label)
          await waitFor(() => slotButtons().length > 0)
          fullState = {
            day: pressedDay(),
            slots: slotButtons().length,
            free: slotButtons().filter((b) => !b.disabled).length,
            message:
              [...document.querySelectorAll('main fieldset p')]
                .map((p) => p.textContent.trim())
                .find((t) => /has gone/i.test(t)) ?? null,
          }
        }

        // Back to a bookable day, then submit the whole thing for real.
        if (openDay) await selectDay(openDay.label)
        const bookingSlot = slotButtons().find((b) => !b.disabled)
        const bookingSlotLabel = bookingSlot?.textContent.trim() ?? null
        bookingSlot?.click()
        setReact(document.querySelector('input[name="vehicle"]'), '2018 Honda Civic')
        setReact(document.querySelector('input[name="name"]'), 'Dana Whitehorse')
        setReact(document.querySelector('input[name="email"]'), 'dana@example.com')
        setReact(document.querySelector('input[name="phone"]'), '306-555-0142')
        await wait(250)
        buttonByText(document.querySelector('main'), 'Request appointment')?.click()
        const booked = await waitFor(() => /appointment is booked/i.test(mainText()))

        return {
          ok: true,
          preselected,
          serviceOptions: optionTotal,
          dayChips: dayChipTotal,
          closedChips: closedChipTotal,
          closedExpected: days.filter((d) => d.closed).length,
          openDay: openDay ? openDay.label : null,
          fullDay: fullDay ? fullDay.label : null,
          emptySubmit,
          brake,
          oil,
          fullState,
          booked,
          bookingSlot: bookingSlotLabel,
          confirmation:
            document.querySelector('main [role="status"]')?.textContent.trim() ?? null,
        }
      })()`,
    )
  }

  step('responsive sweep')
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

  step('phase 4 pages at phone width')
  // --- Phase 4 pages at phone width ----------------------------------------
  // The sweep above only ever measures the homepage, which is where every
  // previous phase's layout work happened. Phase 4 added three pages whose
  // contents are the widest things in the app — a horizontally scrolling day
  // strip, a slot grid, and a two-column form with a sidebar — so measuring
  // them is the difference between believing they fit and knowing it.
  const phase4Responsive = []
  for (const width of [360, 390, 768, 1280]) {
    await send(session, 'Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    })

    // Only the appointment page has a picker; the two service pages are here
    // for the overflow measurement. Naming which is which means a picker that
    // silently disappeared from /appointments is a failure rather than a page
    // that quietly stopped being checked.
    for (const { path, expectStrip } of [
      { path: '/services', expectStrip: false },
      { path: '/services/brake-service', expectStrip: false },
      { path: '/appointments', expectStrip: true },
    ]) {
      await send(session, 'Page.navigate', { url: `${BASE}${path}` })
      await sleep(1500)
      await waitForMount(session)

      const row = await evaluate(
        session,
        `(() => {
          const overflowX = document.documentElement.scrollWidth > window.innerWidth + 1
          const scrollWidth = document.documentElement.scrollWidth
          const strip = [...document.querySelectorAll('main fieldset div')]
            .find((d) => getComputedStyle(d).overflowX === 'auto')
          if (!strip) return { overflowX, scrollWidth, strip: false }

          // The nearest ancestor that clips. A strip wider than the box that
          // contains it is invisible past that edge however healthy the page's
          // own scrollWidth looks — which is exactly how a day strip that
          // refused to shrink hid nine of its fourteen days while the sweep
          // reported no overflow at all.
          let clipper = strip.parentElement
          while (clipper && getComputedStyle(clipper).overflowX === 'visible') {
            clipper = clipper.parentElement
          }
          const stripRect = strip.getBoundingClientRect()
          const clipperRight = clipper
            ? clipper.getBoundingClientRect().right
            : window.innerWidth
          const lastChip = [...strip.querySelectorAll('button')].pop()

          return {
            overflowX,
            scrollWidth,
            strip: true,
            stripWidth: Math.round(stripRect.width),
            stripRight: Math.round(stripRect.right),
            clipperRight: Math.round(clipperRight),
            // Inside the viewport, and inside whatever box would clip it.
            stripContained:
              stripRect.right <= window.innerWidth + 1 &&
              stripRect.right <= clipperRight + 1,
            // The strip's own scroll box holds the whole fortnight, so the last
            // day can be reached by scrolling rather than being cut off.
            stripHoldsEveryDay:
              lastChip !== undefined &&
              lastChip.getBoundingClientRect().right <= stripRect.left + strip.scrollWidth + 1,
            stripScrolls: strip.scrollWidth > strip.clientWidth,
            chips: strip.querySelectorAll('button').length,
          }
        })()`,
      )
      phase4Responsive.push({ width, path, expectStrip, ...row })

      if (row.overflowX) {
        problems.push(`Phase 4: horizontal overflow on ${path} at ${width}px (${row.scrollWidth}px)`)
      }
      if (expectStrip && !row.strip) {
        problems.push(`Phase 4: the day picker is missing from ${path} at ${width}px`)
      }
      if (row.strip && !row.stripContained) {
        problems.push(
          `Phase 4: the day strip is clipped on ${path} at ${width}px ` +
            `(right ${row.stripRight} > ${row.clipperRight})`,
        )
      }
      if (row.strip && !row.stripHoldsEveryDay) {
        problems.push(`Phase 4: a day chip is unreachable on ${path} at ${width}px`)
      }

      // Kept because the day strip is the one thing here that has to be looked
      // at: whether a scroll container holds fourteen chips is not something a
      // measurement makes obvious. Scrolled to the picker first, since the top
      // of the page shows none of it.
      if (path === '/appointments') {
        await evaluate(
          session,
          `document.querySelector('main fieldset')?.scrollIntoView({ block: 'center' })`,
        )
        await sleep(400)
        await screenshot(session, join(SHOT_DIR, `cd-shot-appointments-${width}.png`))
      }
    }
  }

  step('parts catalogue')
  // --- Parts catalogue, cart and fitment ------------------------------------
  // The route sweep proves the pages render; this proves the phase works. The
  // four claims Phase 5 makes are that the catalogue filters, that a part can be
  // put in a cart and the cart sent to the counter, that the fitment checker
  // answers both ways, and that the footer's category links land on the right
  // results rather than on an unfiltered list.
  const partsCatalogue = await (async () => {
    await send(session, 'Page.navigate', { url: `${BASE}/parts` })
    await sleep(1500)
    await waitForMount(session)

    return evaluate(
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
        const countText = () =>
          document.querySelector('main p[aria-live="polite"]')?.textContent ?? ''
        const count = () => {
          const m = countText().match(/of\\s*([\\d,]+)/)
          if (m) return Number(m[1].replace(/,/g, ''))
          return countText().includes('No parts') ? 0 : null
        }
        const articles = () => [...document.querySelectorAll('main article')]
        const cardText = () => articles().map((a) => a.innerText)
        const facet = (label) =>
          [...document.querySelectorAll('aside[aria-label="Parts filters"] input[type=checkbox]')]
            .find((i) => i.closest('label')?.textContent.trim().startsWith(label))

        const waitFor = async (predicate, timeout = 8000) => {
          const deadline = Date.now() + timeout
          while (Date.now() < deadline) {
            if (predicate()) return true
            await wait(100)
          }
          return false
        }

        const facetsReady = await waitFor(
          () => document.querySelectorAll('aside[aria-label="Parts filters"] input[type=checkbox]').length > 0,
        )
        if (!facetsReady) return { ok: false, reason: 'the parts filter sidebar never rendered' }

        const initial = { count: count(), cards: articles().length }
        log.steps.push({ step: 'initial', url: location.search, ...initial })

        // 1. A facet narrows the results, and every card agrees with it.
        const brakes = facet('Brakes')
        if (!brakes) return { ok: false, reason: 'no Brakes facet checkbox found' }
        brakes.click()
        const brakesApplied = await waitFor(() => {
          const text = cardText()
          return text.length > 0 && text.every((t) => /brakes/i.test(t))
        })
        log.steps.push({
          step: 'filter category=Brakes',
          url: location.search,
          count: count(),
          cards: articles().length,
          allBrakes: cardText().every((t) => /brakes/i.test(t)),
          narrowed: count() !== null && count() < initial.count,
        })
        if (!brakesApplied) return { ok: false, reason: 'the Brakes facet did not narrow the grid', log }

        // 2. Search narrows further, and the URL carries it.
        const search = document.querySelector('main input[type=search]')
        if (!search) return { ok: false, reason: 'no search box on the parts page', log }
        setNativeValue(search, 'rotor')
        search.dispatchEvent(new Event('input', { bubbles: true }))
        const searched = await waitFor(() => {
          const text = cardText()
          return text.length > 0 && text.every((t) => /rotor/i.test(t))
        })
        log.steps.push({
          step: 'search "rotor"',
          url: location.search,
          count: count(),
          cards: articles().length,
          allRotor: cardText().every((t) => /rotor/i.test(t)),
        })
        if (!searched) return { ok: false, reason: 'the keyword search did not narrow the grid', log }

        // 3. Clear all restores the full catalogue.
        const clearAll = [...document.querySelectorAll('main button')]
          .find((b) => /^clear all$/i.test(b.textContent.trim()))
        if (!clearAll) return { ok: false, reason: 'no Clear all control once filters are on', log }
        clearAll.click()
        const cleared = await waitFor(() => count() === initial.count)
        log.steps.push({
          step: 'clear all',
          url: location.search,
          count: count(),
          restored: count() === initial.count,
        })
        if (!cleared) return { ok: false, reason: 'Clear all did not restore the full catalogue', log }

        return { ok: true, initial, steps: log.steps }
      })()`,
    )
  })()

  if (!partsCatalogue.ok) {
    problems.push(`Parts catalogue: ${partsCatalogue.reason}`)
  }

  step('parts category links')
  // --- The footer's category links land on filtered results -----------------
  // The footer sweep above proves these hrefs resolve to a real page; it does
  // not prove the query string does anything, because that sweep deliberately
  // drops it. A `?category=Brakes` that the catalogue quietly ignored would be
  // a footer full of links to the same unfiltered list.
  const partsCategoryLinks = []
  for (const category of ['Battery', 'Brakes', 'Engine', 'Electrical', 'Suspension']) {
    await send(session, 'Page.navigate', {
      url: `${BASE}/parts?category=${encodeURIComponent(category)}`,
    })
    await sleep(1400)
    await waitForMount(session)

    const row = await evaluate(
      session,
      `(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms))
        const deadline = Date.now() + 8000
        const countText = () =>
          document.querySelector('main p[aria-live="polite"]')?.textContent ?? ''
        while (Date.now() < deadline) {
          if (/of\\s*[\\d,]+/.test(countText())) break
          await wait(100)
        }
        const m = countText().match(/of\\s*([\\d,]+)/)
        const text = [...document.querySelectorAll('main article')].map((a) => a.innerText)
        return {
          category: ${JSON.stringify(category)},
          count: m ? Number(m[1].replace(/,/g, '')) : null,
          cards: text.length,
          // Matched against the card's own brand/category line rather than the
          // whole card, so a part whose *description* mentions brakes does not
          // pass a filter it is not part of.
          allMatch: text.length > 0 && text.every((t) =>
            t.toLowerCase().includes(${JSON.stringify(category)}.toLowerCase()),
          ),
          chip: [...document.querySelectorAll('main ul[aria-labelledby] button')]
            .map((b) => b.textContent.trim()),
        }
      })()`,
    )
    partsCategoryLinks.push(row)

    if (row.count === null) {
      problems.push(`Parts: ?category=${category} never resolved to a result count`)
    } else if (row.count === 0) {
      problems.push(`Parts: ?category=${category} matched nothing`)
    } else if (!row.allMatch) {
      problems.push(`Parts: ?category=${category} returned parts outside that category`)
    }
  }

  step('parts cart and checkout')
  // --- Add to cart, then send the order ------------------------------------
  const partsCart = await (async () => {
    await send(session, 'Page.navigate', { url: `${BASE}/parts` })
    await sleep(1500)
    await waitForMount(session)

    return evaluate(
      session,
      `(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms))
        const log = { steps: [] }
        const waitFor = async (predicate, timeout = 8000) => {
          const deadline = Date.now() + timeout
          while (Date.now() < deadline) {
            if (predicate()) return true
            await wait(100)
          }
          return false
        }
        const setNativeValue = (el, value) => {
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
            .set.call(el, value)
        }

        const ready = await waitFor(
          () => document.querySelectorAll('main article').length > 0,
        )
        if (!ready) return { ok: false, reason: 'the parts grid never rendered' }

        const firstCard = document.querySelector('main article')
        const partName = firstCard.querySelector('h3')?.textContent.trim() ?? null
        if (!partName) return { ok: false, reason: 'no part name on the first card' }

        const addButton = [...firstCard.querySelectorAll('button')]
          .find((b) => /add to cart/i.test(b.textContent))
        if (!addButton) return { ok: false, reason: 'no Add to cart button on the first card' }
        if (addButton.disabled) {
          return { ok: false, reason: 'the first part is out of stock, so nothing can be added' }
        }

        addButton.click()
        // The button reports its own success by changing label, which is the
        // only signal available without leaving the page.
        const confirmed = await waitFor(
          () => /added to cart/i.test(addButton.textContent),
          3000,
        )
        log.steps.push({ step: 'add to cart', partName, confirmed })
        if (!confirmed) return { ok: false, reason: 'the button never confirmed the add', log }

        // The header's cart count is the app's own acknowledgement that the
        // item landed in the provider rather than only in the button's state.
        const badge = await waitFor(() => {
          const el = document.querySelector('header a[href="/cart"]')
          return el && /\\d/.test(el.textContent)
        }, 3000)
        log.steps.push({
          step: 'header badge',
          badge: document.querySelector('header a[href="/cart"]')?.textContent.trim() ?? null,
        })

        return { ok: true, partName, badgeAppeared: badge, steps: log.steps }
      })()`,
    )
  })()

  if (!partsCart.ok) {
    problems.push(`Parts cart: ${partsCart.reason}`)
  }

  // The cart page, then the checkout dialog, driven as a customer would.
  const partsCheckout = await (async () => {
    await send(session, 'Page.navigate', { url: `${BASE}/cart` })
    await sleep(1500)
    await waitForMount(session)

    const opened = await evaluate(
      session,
      `(() => {
        const heading = document.querySelector('main h1')?.textContent.trim() ?? null
        const items = [...document.querySelectorAll('main li')]
          .map((li) => li.innerText)
          .filter((t) => /part number/i.test(t))
        const summary = [...document.querySelectorAll('main dl')]
          .map((dl) => dl.innerText)
          .join('\\n')
        const checkout = [...document.querySelectorAll('main button')]
          .find((b) => /continue to checkout/i.test(b.textContent))
        return {
          heading,
          empty: /cart is empty/i.test(document.querySelector('main')?.innerText ?? ''),
          lineItems: items.length,
          firstItem: items[0]?.split('\\n').slice(0, 3).join(' | ') ?? null,
          summary,
          hasCheckout: Boolean(checkout),
        }
      })()`,
    )

    if (opened.empty || opened.lineItems === 0) {
      problems.push(
        'Parts cart: the part added on the catalogue page is not in the cart — the cart is empty or has no line items',
      )
      return { ...opened, submitted: null }
    }
    if (!opened.hasCheckout) {
      problems.push('Parts cart: no "Continue to checkout" control')
      return { ...opened, submitted: null }
    }

    await screenshot(session, join(SHOT_DIR, 'cd-shot-cart.png'))

    // Filling the form and placing the order. The dialog collects name, phone,
    // email and a note and then returns a confirmation — so this drives the
    // whole flow rather than checking that a dialog exists.
    const submitted = await evaluate(
      session,
      `(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms))
        const setNativeValue = (el, value) => {
          const proto = el.tagName === 'TEXTAREA'
            ? HTMLTextAreaElement.prototype
            : HTMLInputElement.prototype
          Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value)
        }
        const fill = (el, value) => {
          if (!el) return false
          setNativeValue(el, value)
          el.dispatchEvent(new Event('input', { bubbles: true }))
          return true
        }

        const button = [...document.querySelectorAll('main button')]
          .find((b) => /continue to checkout/i.test(b.textContent))
        button.click()
        await wait(500)

        const dialog = document.querySelector('dialog[open]')
        if (!dialog) return { opened: false, reason: 'no dialog opened' }

        const ok = {
          opened: true,
          name: fill(dialog.querySelector('input[autocomplete="name"]'), 'Dana Whitfield'),
          phone: fill(dialog.querySelector('input[autocomplete="tel"]'), '3065550142'),
          email: fill(dialog.querySelector('input[autocomplete="email"]'), 'dana@example.com'),
        }
        if (!ok.name || !ok.phone || !ok.email) {
          return { ...ok, submitted: false, reason: 'a checkout field is missing from the dialog' }
        }

        const send = [...dialog.querySelectorAll('button')]
          .find((b) => /send order request/i.test(b.textContent))
        if (!send) return { ...ok, submitted: false, reason: 'no submit button in the dialog' }

        send.click()
        const deadline = Date.now() + 8000
        while (Date.now() < deadline) {
          if (/with the counter|nothing has been charged/i.test(dialog.innerText)) break
          await wait(150)
        }

        return {
          ...ok,
          submitted: /with the counter/i.test(dialog.innerText),
          // Sliced around the confirmation rather than from the top of the
          // dialog: the first four lines are the dialog's own header, which
          // reads identically whether the order succeeded or not, so printing
          // them made a passing run look like it had confirmed nothing.
          confirmation: (dialog.innerText.match(
            /Your order request is with the counter[\\s\\S]{0,200}/,
          ) ?? [''])[0].split('\\n').slice(0, 3).join(' ').trim(),
        }
      })()`,
    )

    if (!submitted.opened) {
      problems.push(`Parts checkout: ${submitted.reason}`)
    } else if (!submitted.submitted) {
      problems.push(
        `Parts checkout: the order form did not confirm — ${submitted.reason ?? 'no confirmation appeared'}`,
      )
    } else {
      // Dismissing the confirmation clears the cart, which is what makes the
      // empty state reachable at all — and it is the state most likely to be
      // broken by a change to the cart context.
      await evaluate(
        session,
        `(() => {
          const dialog = document.querySelector('dialog[open]')
          const done = dialog && [...dialog.querySelectorAll('button')]
            .find((b) => /^done$/i.test(b.textContent.trim()))
          done?.click()
        })()`,
      )
      await sleep(600)
      await screenshot(session, join(SHOT_DIR, 'cd-shot-cart-empty.png'))
    }

    return { ...opened, submitted }
  })()

  step('fitment checker')
  // --- Fitment checker answers both ways -----------------------------------
  // The whole point of the checker is that it can say no. A version that always
  // returned "fits" would pass every smoke test ever written for it, so this
  // asserts the negative case explicitly: a vehicle the part is not listed for.
  const partsFitment = await (async () => {
    await send(session, 'Page.navigate', {
      url: `${BASE}/parts/meridian-ceramic-brake-pads-front`,
    })
    await sleep(1600)
    await waitForMount(session)

    return evaluate(
      session,
      `(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms))
        const waitFor = async (predicate, timeout = 8000) => {
          const deadline = Date.now() + timeout
          while (Date.now() < deadline) {
            if (predicate()) return true
            await wait(100)
          }
          return false
        }
        const setNativeValue = (el, value) => {
          Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')
            .set.call(el, value)
        }
        const selectByLabel = (text) =>
          [...document.querySelectorAll('main select')]
            .find((s) => s.getAttribute('aria-label') === text ||
              document.querySelector('label[for="' + s.id + '"]')?.textContent.trim() === text)

        const ready = await waitFor(() => {
          const s = selectByLabel('Make')
          return s && s.options.length > 1
        })
        if (!ready) return { ok: false, reason: 'the fitment pickers never populated' }

        const make = selectByLabel('Make')
        const model = selectByLabel('Model')
        const year = selectByLabel('Year')

        const choose = async (select, value) => {
          setNativeValue(select, value)
          select.dispatchEvent(new Event('change', { bubbles: true }))
        }

        const optionValues = (select) =>
          [...select.options].map((o) => o.value).filter(Boolean)

        // The page lists the part's own applications, so the positive case is
        // read from there rather than guessed. Picking the first make in the
        // dropdown and the last year it offers was wrong: the year list is a
        // span across *every* part for that vehicle, and these brake pads cover
        // 2012–2017 of a range that runs to 2020 — so the probe rejected a part
        // for a year it was never listed against, and called the app broken.
        const appSection = [...document.querySelectorAll('main section')].find((s) =>
          /in the fitment list/i.test(s.querySelector('h2')?.textContent ?? ''),
        )
        const firstApplication = appSection?.querySelector('li')
        if (!firstApplication) {
          return { ok: false, reason: 'the part page lists no applications to test against' }
        }

        const appName = firstApplication.querySelector('p')?.textContent.trim() ?? ''
        const appYears = firstApplication.querySelectorAll('p')[1]?.textContent.trim() ?? ''
        const appYear = String(appYears).split(/[–-]/)[0].trim()

        const makeOption = optionValues(make).find((v) => appName.startsWith(v))
        if (!makeOption) {
          return { ok: false, reason: 'the first application names a make the picker does not offer' }
        }
        await choose(make, makeOption)
        if (!(await waitFor(() => optionValues(model).length > 0))) {
          return { ok: false, reason: 'choosing a make did not populate the models' }
        }

        const modelOption = optionValues(model).find((v) => appName.includes(v))
        if (!modelOption) {
          return { ok: false, reason: 'the first application names a model the picker does not offer' }
        }
        await choose(model, modelOption)
        if (!(await waitFor(() => optionValues(year).length > 0))) {
          return { ok: false, reason: 'choosing a model did not populate the years' }
        }
        if (!optionValues(year).includes(appYear)) {
          return {
            ok: false,
            reason: 'the year picker does not offer ' + appYear + ', which the part is listed for',
          }
        }
        await choose(year, appYear)

        const check = [...document.querySelectorAll('main button')]
          .find((b) => /check fitment/i.test(b.textContent))
        if (!check) return { ok: false, reason: 'no Check fitment button' }
        check.click()

        const answerFor = async () => {
          const deadline = Date.now() + 8000
          while (Date.now() < deadline) {
            const text = document.querySelector('main')?.innerText ?? ''
            const m = text.match(/(Fits your vehicle|We could not confirm a fit)([\\s\\S]{0,220})/)
            if (m) return { headline: m[1], detail: m[2].split('\\n').slice(1, 3).join(' ').trim() }
            await wait(150)
          }
          return null
        }

        const positive = await answerFor()
        if (!positive) return { ok: false, reason: 'the checker never produced an answer' }

        // --- And the negative case: a vehicle this part is not listed for.
        // A checker that always said yes would pass every positive assertion
        // here, so the "no" has to be asserted too. The make is deliberately
        // one the part does not cover, taken from the picker's own list.
        //
        // Waiting for the level below to be *non-empty* is not enough. Changing
        // the make clears the selected model straight away, but the model
        // *options* are only swapped once the new list arrives — so for a
        // moment the select still lists the previous make's models, the
        // non-empty wait passes on stale data, and the probe picks a model the
        // new make does not offer. The year list then comes back empty, the
        // submit button stays disabled because the year is unset, and the run
        // reports a checker that never answers. It has to wait for the list to
        // change, not merely to be populated.
        const otherMake = optionValues(make).find((v) => !appName.startsWith(v))
        let negative = null
        let negativeVehicle = null
        if (otherMake) {
          const staleModels = optionValues(model).join('|')
          await choose(make, otherMake)
          await waitFor(() => {
            const now = optionValues(model)
            return now.length > 0 && now.join('|') !== staleModels
          })

          const otherModel = optionValues(model)[0]
          const staleYears = optionValues(year).join('|')
          await choose(model, otherModel)
          await waitFor(() => {
            const now = optionValues(year)
            return now.length > 0 && now.join('|') !== staleYears
          })

          negativeVehicle = { make: otherMake, model: otherModel }
          await choose(year, optionValues(year)[0])
          check.click()
          negative = await answerFor()
        }

        return {
          ok: true,
          vehicle: { make: makeOption, model: modelOption, year: appYear },
          listedAs: appName + ' ' + appYears,
          positiveFits: positive.headline === 'Fits your vehicle',
          positiveAnswer: positive.headline + ' — ' + positive.detail,
          negativeVehicle,
          negativeRefused: negative?.headline === 'We could not confirm a fit',
          negativeAnswer: negative ? negative.headline + ' — ' + negative.detail : null,
          yearsOffered: optionValues(year).length,
        }
      })()`,
      // Six `waitFor` calls with 8s budgets live inside this one expression, so
      // the CDP call has to outlast their sum. At the 15s default a picker that
      // legitimately took a moment surfaced as "CDP timeout" — a harness
      // failure wearing the costume of a hung browser.
      60000,
    )
  })()

  if (!partsFitment.ok) {
    problems.push(`Fitment checker: ${partsFitment.reason}`)
  } else {
    if (!partsFitment.positiveFits) {
      problems.push(
        `Fitment checker: a vehicle from the part's own fitment list (${partsFitment.listedAs}) was rejected — "${partsFitment.positiveAnswer}"`,
      )
    }
    if (!partsFitment.negativeRefused) {
      problems.push(
        `Fitment checker: a vehicle the part is not listed for was not refused — "${partsFitment.negativeAnswer}"`,
      )
    }
  }

  step('parts responsive')
  // --- Parts pages at phone width ------------------------------------------
  const partsResponsive = []
  for (const width of [360, 390, 768, 1280]) {
    await send(session, 'Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    })

    for (const path of ['/parts', '/parts/meridian-ceramic-brake-pads-front', '/cart']) {
      await send(session, 'Page.navigate', { url: `${BASE}${path}` })
      await sleep(1400)
      await waitForMount(session)

      const row = await evaluate(
        session,
        `(() => {
          const overflowX = document.documentElement.scrollWidth > window.innerWidth + 1
          return {
            width: window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            overflowX,
            offenders: [...document.querySelectorAll('main *')]
              .map((el) => ({ el, r: el.getBoundingClientRect() }))
              .filter(({ r }) => r.width > 0 && r.right > window.innerWidth + 1)
              .slice(0, 4)
              .map(({ el, r }) =>
                el.tagName.toLowerCase() +
                (el.className ? '.' + String(el.className).split(' ').slice(0, 3).join('.') : '') +
                ' [right=' + Math.round(r.right) + ' w=' + Math.round(r.width) + ']'
              ),
          }
        })()`,
      )
      partsResponsive.push({ path, ...row })

      if (row.overflowX) {
        problems.push(
          `Parts: horizontal overflow on ${path} at ${width}px (${row.scrollWidth}px) — ${row.offenders.join('; ')}`,
        )
      }
    }
  }

  step('mobile drawer')
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
      console.log(`${name.padEnd(36)} ${JSON.stringify(rest)}`)
    }
    console.log(`sold vehicle            ${JSON.stringify(detail.sold)}`)

    const byStep = Object.fromEntries(detail.steps.map((s) => [s.step, s]))
    const galleryNext = byStep['gallery next']
    const galleryThumb = byStep['gallery thumbnail']
    const calculator = byStep['payment calculator']
    const modalOpen = byStep['enquiry modal open']
    const emptySubmit = byStep['enquiry empty submit']
    const validSubmit = byStep['enquiry valid submit']
    const driveEmpty = byStep['test drive: empty submit']
    const closedDays = byStep['test drive: closed days']
    const driveSlots = byStep['test drive: slots']
    const driveStrip = byStep['test drive: day strip']
    const dayChange = byStep['test drive: day change clears time']
    const driveBooked = byStep['test drive: booked']

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
    // The closed-day rule now lives in the control, not in a message: a Sunday
    // is a disabled chip, so the assertion is that the chip exists and cannot be
    // selected — not that a Sunday was typed in and then refused.
    expect(!!driveEmpty?.alert, 'no error summary was shown for an empty test drive')
    expect(closedDays?.closedChips > 0, 'no closed day was offered as a disabled chip')
    expect(
      closedDays?.closedLabels?.every((label) => /— closed$/.test(label ?? '')),
      `a closed chip is not labelled as closed: ${JSON.stringify(closedDays?.closedLabels)}`,
    )
    expect(closedDays?.closedChipIgnored, 'clicking a closed day moved the picker onto it')
    expect(
      closedDays?.openedOn && !/— closed$/.test(closedDays.openedOn),
      `the test-drive picker did not open on a bookable day: ${closedDays?.openedOn}`,
    )
    expect(driveSlots?.slots > 0, 'the test-drive picker offered no times at all')
    expect(driveSlots?.free > 0, 'the test-drive picker offered no free time')
    expect(driveStrip?.insideDialog, 'the test-drive day strip overflows the dialog')
    expect(driveStrip?.scrolls, 'the test-drive day strip is not scrollable')
    expect(driveStrip?.holdsEveryDay, 'a day chip is unreachable in the test-drive dialog')
    expect(dayChange?.registered, 'clicking a free time did not select it')
    expect(dayChange?.cleared, 'changing the day kept a time that belongs to the old day')
    expect(driveBooked?.booked, 'a fully filled test drive did not reach the confirmation')
    expect(detail.sold?.mentionsSold, 'the sold vehicle does not say it has sold')
    expect(detail.sold?.hasBrowseCta, 'the sold vehicle offers no way on to other inventory')
    expect(!detail.sold?.hasBookCta, 'the sold vehicle still offers a test drive')
  }

  console.log('\n================ SERVICE CATALOGUE ================')
  if (!services) {
    console.log('skipped (--responsive-only)')
  } else if (!services.ok) {
    problems.push(`Service catalogue aborted: ${services.reason}`)
    console.log(`FAILED: ${services.reason}`)
  } else {
    console.log(
      `listing   catalogue=${services.catalogueSize} cards=${services.cards} ` +
        `oneLinkPerCard=${services.oneLinkPerCard}`,
    )
    console.log(`          prices=${JSON.stringify(services.prices)}`)
    if (services.dataError) console.log(`          service layer error: ${services.dataError}`)

    const svc = services.detail
    console.log(
      `detail    h1=${JSON.stringify(svc?.h1)} price=${svc?.price} ` +
        `bookingLinks=${JSON.stringify(svc?.bookingLinkLabels)}`,
    )
    console.log(`          headings=${JSON.stringify(svc?.headings)}`)
    console.log(
      `          related=${svc?.relatedCards}/${svc?.relatedExpected} ` +
        `excludesItself=${svc?.excludesItself}`,
    )

    const expect = (condition, message) => {
      if (!condition) problems.push(`Services: ${message}`)
    }

    expect(services.mounted, 'the service grid never rendered any cards')
    expect(!services.dataError, `the service layer threw: ${services.dataError}`)
    expect(
      services.cards === services.catalogueSize,
      `expected ${services.catalogueSize} service cards, found ${services.cards}`,
    )
    expect(services.allResolve, 'a service card points at a slug the catalogue does not hold')
    expect(services.allListed, 'a service in the catalogue has no card on the listing')
    expect(services.oneLinkPerCard, 'a service card has more than one link')
    expect(services.pricesMatch, 'a card shows a price the catalogue does not hold')

    expect(svc?.h1 === 'Brake Repair & Replacement', `unexpected detail heading: ${svc?.h1}`)
    expect(svc?.hasDescription, 'the service description is missing from the detail page')
    expect(svc?.hasEveryFeature, "not every 'what's included' item rendered")
    expect(svc?.hasEverySymptom, "not every 'signs you need this' item rendered")
    expect(svc?.price, 'the starting price is missing from the detail page')
    expect(
      svc?.bookingLinkCount >= 2,
      `expected the booking link in the header and the panel, found ${svc?.bookingLinkCount}`,
    )
    expect(
      svc?.bookingLinksCarrySlug,
      `a Book this service link does not carry the slug: ${JSON.stringify(svc?.bookingLinkLabels)}`,
    )
    expect(
      svc?.everyScopedLinkCarriesSlug,
      `a service-scoped booking link is missing the slug: ${JSON.stringify(svc?.bookingLinkLabels)}`,
    )
    expect(
      svc?.relatedCards === svc?.relatedExpected && svc?.relatedExpected === 3,
      `expected 3 related services, found ${svc?.relatedCards}`,
    )
    expect(svc?.relatedResolve, 'a related service card points at the wrong slug')
    expect(svc?.excludesItself, 'the detail page listed itself under related services')
  }

  console.log('\n================ SERVICE BOOKING ================')
  if (!booking) {
    console.log('skipped (--responsive-only)')
  } else if (!booking.ok) {
    problems.push(`Booking aborted: ${booking.reason}`)
    console.log(`FAILED: ${booking.reason}`)
  } else {
    console.log(
      `preselected=${JSON.stringify(booking.preselected)} options=${booking.serviceOptions} ` +
        `days=${booking.dayChips} closed=${booking.closedChips}/${booking.closedExpected}`,
    )
    console.log(`open day  ${JSON.stringify(booking.openDay)}`)
    console.log(`full day  ${JSON.stringify(booking.fullDay)}`)
    console.log(`empty     ${JSON.stringify(booking.emptySubmit)}`)
    console.log(`brake     ${JSON.stringify(booking.brake)}`)
    console.log(`oil       ${JSON.stringify(booking.oil)}`)
    console.log(`full      ${JSON.stringify(booking.fullState)}`)
    console.log(
      `booked    ${booking.booked} slot=${JSON.stringify(booking.bookingSlot)} ` +
        `confirmation=${JSON.stringify(booking.confirmation)}`,
    )

    const expect = (condition, message) => {
      if (!condition) problems.push(`Booking: ${message}`)
    }

    expect(
      booking.preselected === 'brake-service',
      `?service= did not prefill the select: ${booking.preselected}`,
    )
    expect(
      booking.serviceOptions === 9,
      `expected 8 services plus the placeholder option, found ${booking.serviceOptions}`,
    )
    expect(
      booking.closedChips === booking.closedExpected && booking.closedExpected > 0,
      `expected ${booking.closedExpected} closed day chips, found ${booking.closedChips}`,
    )
    expect(!!booking.openDay, 'no bookable day in the two-week window')
    expect(
      booking.brake?.day === booking.openDay,
      `the picker settled on ${booking.brake?.day}, not the bookable day ${booking.openDay}`,
    )

    // The error summary is the only thing that tells a customer scrolled to the
    // bottom why the button did nothing.
    expect(!!booking.emptySubmit?.alert, 'no error summary was shown for an empty booking')
    expect(booking.emptySubmit?.invalidFields >= 3, 'an empty booking marked too few fields invalid')
    expect(booking.emptySubmit?.nameError, 'the empty booking did not ask for a name')
    expect(booking.emptySubmit?.vehicleError, 'the empty booking did not ask for the vehicle')
    expect(booking.emptySubmit?.timeError, 'the empty booking did not ask for a time')
    expect(
      !booking.emptySubmit?.serviceError,
      'the form asked for a service even though ?service= prefilled one',
    )

    // Three hours cannot start in the last two slots of the day; one hour can.
    // That difference is the whole reason the slot list is filtered on job
    // length, so it is asserted rather than assumed.
    expect(
      booking.brake?.reasons?.['Too late for this job'] === 2,
      `a three-hour job should rule out the last two slots: ${JSON.stringify(booking.brake?.reasons)}`,
    )
    expect(booking.brake?.chosen, 'no free brake slot could be selected')
    expect(
      booking.oil?.reasons?.['Too late for this job'] === undefined,
      `a one-hour job should not rule any slot out: ${JSON.stringify(booking.oil?.reasons)}`,
    )
    expect(booking.oil?.timeCleared, 'changing the service kept a time chosen for the old job')
    expect(booking.oil?.dayKept, 'changing the service also moved the day')

    if (booking.fullDay) {
      expect(
        booking.fullState?.day === booking.fullDay,
        `the picker did not move onto the full day ${booking.fullDay}`,
      )
      expect(booking.fullState?.free === 0, 'a fully booked day still offered a free time')
      expect(booking.fullState?.slots > 0, 'a fully booked day rendered no times at all')
      expect(
        /has gone/i.test(booking.fullState?.message ?? ''),
        'a fully booked day did not explain why nothing was bookable',
      )
    }

    expect(booking.booked, 'a fully filled booking did not reach the confirmation')
    expect(
      /appointment is booked/i.test(booking.confirmation ?? ''),
      `unexpected confirmation: ${booking.confirmation}`,
    )
  }

  console.log('\n================ PHASE 5 RESPONSIVE ================')
  for (const row of partsResponsive) {
    console.log(
      `${String(row.width).padEnd(6)} ${row.path.padEnd(44)} overflowX=${row.overflowX}`,
    )
    row.offenders?.forEach((o) => console.log(`         ↳ ${o}`))
  }

  console.log('\n================ PARTS CATALOGUE ================')
  if (!partsCatalogue.ok) {
    console.log(`FAILED: ${partsCatalogue.reason}`)
  } else {
    console.log(
      `initial   count=${partsCatalogue.initial.count} cards=${partsCatalogue.initial.cards}`,
    )
    for (const step of partsCatalogue.steps) {
      const { step: name, ...rest } = step
      console.log(`${name.padEnd(24)} ${JSON.stringify(rest)}`)
    }

    const byStep = Object.fromEntries(partsCatalogue.steps.map((s) => [s.step, s]))
    const expect = (condition, message) => {
      if (!condition) problems.push(`Parts catalogue: ${message}`)
    }
    expect(
      byStep['filter category=Brakes']?.allBrakes,
      'a part outside the Brakes category survived the category filter',
    )
    expect(
      byStep['filter category=Brakes']?.narrowed,
      'filtering by category did not narrow the results',
    )
    expect(byStep['search "rotor"']?.allRotor, 'a card survived that does not match the search')
    expect(byStep['clear all']?.restored, 'Clear all did not restore the full catalogue')
  }

  console.log('\n================ PARTS CATEGORY LINKS ================')
  for (const row of partsCategoryLinks) {
    console.log(
      `?category=${row.category.padEnd(14)} count=${String(row.count).padEnd(4)} ` +
        `cards=${String(row.cards).padEnd(3)} allMatch=${row.allMatch}`,
    )
  }

  console.log('\n================ PARTS CART ================')
  if (!partsCart.ok) {
    console.log(`FAILED: ${partsCart.reason}`)
  } else {
    for (const step of partsCart.steps) {
      const { step: name, ...rest } = step
      console.log(`${name.padEnd(16)} ${JSON.stringify(rest)}`)
    }
    console.log(
      `cart page       ${JSON.stringify({
        empty: partsCheckout.empty,
        lineItems: partsCheckout.lineItems,
        firstItem: partsCheckout.firstItem,
      })}`,
    )
    console.log(`checkout        ${JSON.stringify(partsCheckout.submitted)}`)

    if (!partsCheckout.submitted?.opened) {
      problems.push(`Parts cart: the checkout dialog did not open — ${partsCheckout.submitted?.reason}`)
    } else if (!partsCheckout.submitted.submitted) {
      problems.push(
        `Parts cart: the order was not confirmed — ${partsCheckout.submitted.reason ?? 'no confirmation appeared'}`,
      )
    }
  }

  console.log('\n================ FITMENT CHECKER ================')
  console.log(JSON.stringify(partsFitment, null, 2))

  console.log('\n================ FOOTER LINKS ================')
  if (footerLinks.length === 0) {
    console.log('skipped (--responsive-only)')
  } else {
    console.log(`${footerLinks.length} distinct internal footer links, all resolved`)
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

  console.log('\n================ PHASE 4 RESPONSIVE ================')
  for (const row of phase4Responsive) {
    console.log(
      `${String(row.width).padEnd(6)} ${row.path.padEnd(28)} overflowX=${String(row.overflowX).padEnd(5)} ` +
        `chips=${String(row.chips).padEnd(3)} strip=${String(row.stripWidth).padEnd(4)} ` +
        `inClipBox=${String(row.stripContained).padEnd(5)} scrolls=${row.stripScrolls}`,
    )
  }

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
  // The session socket and the open tab keep the event loop alive, so a failed
  // run used to sit there forever after printing this — which reads as "still
  // running" to anyone watching, and hides the failure. The graceful close at
  // the end of main() only happens on the success path, so a failure exits
  // directly. A libuv assertion on the way out is acceptable here: the run is
  // already red.
  process.exit(1)
})
