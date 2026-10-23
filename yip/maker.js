// Year in Pixels maker: the app's 12 x 31 grid, painted with the rows of a color key.
// Everything lives in localStorage under one key; nothing leaves the browser.
(() => {
  const T = JSON.parse(document.getElementById('t').textContent)
  const STORE = 'chroma-yip-v1'
  const PALETTE = ['#E9C46A', '#81B29A', '#A9B8C2', '#5B8DB8', '#3D5A80', '#E07A5F', '#C06C84', '#7E8F5A', '#F2BF94', '#6C5B7B', '#9DB4AB', '#8D99AE']
  const MAX_KEY = 12
  const $ = (id) => document.getElementById(id)
  const grid = $('grid'), keyList = $('key'), strip = $('strip'), status = $('status'), live = $('live')
  const now = new Date()
  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate())

  // From October on, people come to start next year.
  const firstYear = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear()
  let state = load()
  let canSave = true
  let brush = state.key[0] ? state.key[0].id : 'erase'
  let history = []
  let focusIso = null

  function defaults() {
    return { v: 1, year: firstYear, key: T.defaults.map((label, i) => ({ id: 'k' + i, color: PALETTE[i], label })), days: {} }
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE))
      if (s && s.v === 1 && Array.isArray(s.key) && s.days) return s
    } catch (e) {}
    return defaults()
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)) } catch (e) {
      if (canSave) { canSave = false; $('saved').textContent = T.noStorage }
    }
  }

  function iso(y, m, d) { return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0') }
  const daysIn = (y, m) => new Date(y, m + 1, 0).getDate()
  const fmtLong = new Intl.DateTimeFormat(T.lang, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const fmtDay = new Intl.DateTimeFormat(T.lang, { month: 'long', day: 'numeric' })
  const fmtMonth = new Intl.DateTimeFormat(T.lang, { month: 'long' })
  const fmtInitial = new Intl.DateTimeFormat(T.lang, { month: 'narrow' })
  const dateOf = (s) => new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10))
  const keyOf = (id) => state.key.find((k) => k.id === id)
  const nameOf = (k) => (k.label || '').trim() || T.untitled
  const plural = (n) => n + ' ' + (n === 1 ? T.days[0] : T.days[1])

  // Relative luminance contrast against the empty cell, as the app does: below 1.3 the day gets an edge.
  function lum(hex) {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  }
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
  const cardColor = () => (matchMedia('(prefers-color-scheme: dark)').matches ? '#1A1A1A' : '#FFFFFF')

  // --- Grid -----------------------------------------------------------------------------------
  function buildGrid() {
    const y = state.year
    const out = ['<span aria-hidden="true"></span>']
    for (let d = 1; d <= 31; d++) out.push(`<span class="n" aria-hidden="true">${[1, 10, 20, 30].includes(d) ? d : ''}</span>`)
    for (let m = 0; m < 12; m++) {
      const first = new Date(y, m, 1)
      out.push(`<h3><span aria-hidden="true">${fmtInitial.format(first).toUpperCase()}</span><span class="sr">${fmtMonth.format(first)}</span></h3>`)
      for (let d = 1; d <= 31; d++) {
        if (d > daysIn(y, m)) { out.push('<span aria-hidden="true"></span>'); continue }
        const s = iso(y, m, d)
        out.push(`<button type="button" class="d${s > todayIso ? ' future' : ''}${s === todayIso ? ' today' : ''}" data-d="${s}" tabindex="-1"></button>`)
      }
    }
    grid.innerHTML = out.join('')
    grid.querySelectorAll('.d').forEach(paintCell)
    const start = grid.querySelector(`[data-d="${todayIso}"]`) || grid.querySelector('.d')
    start.tabIndex = 0
    focusIso = start.dataset.d
    $('year').textContent = y
    $('prev').disabled = y <= 2000
    $('next').disabled = y >= 2100
  }

  function paintCell(el) {
    const k = keyOf(state.days[el.dataset.d])
    const label = fmtDay.format(dateOf(el.dataset.d)) + ': ' + (k ? nameOf(k) : T.empty)
    el.setAttribute('aria-label', label)
    if (k) {
      el.style.setProperty('--c', k.color)
      el.classList.toggle('edge', contrast(k.color, cardColor()) < 1.3)
    } else {
      el.removeAttribute('style')
      el.classList.remove('edge')
    }
  }
  const cell = (s) => grid.querySelector(`[data-d="${s}"]`)
  function repaintAll() { grid.querySelectorAll('.d').forEach(paintCell) }

  function apply(changes) {
    // changes: [[iso, newId|null]]; returns the undo record.
    const undo = []
    for (const [s, id] of changes) {
      const prev = state.days[s] || null
      if (prev === id) continue
      undo.push([s, prev])
      if (id) state.days[s] = id; else delete state.days[s]
      const el = cell(s)
      if (el) paintCell(el)
    }
    if (undo.length) { save(); renderCounts() }
    return undo
  }
  function commit(undo) {
    if (!undo.length) return
    history.push(undo)
    if (history.length > 200) history.shift()
    $('undo').disabled = false
  }
  function undoLast() {
    const u = history.pop()
    if (!u) return
    const y = u[0][0].slice(0, 4)
    if (+y !== state.year) { state.year = +y; buildGrid() }
    apply(u)
    $('undo').disabled = !history.length
    say(T.undo)
  }

  // A tap paints with the brush, or clears a day that already has the brush's color.
  function targetFor(s) {
    if (brush === 'erase') return null
    return state.days[s] === brush ? null : brush
  }
  function say(text) { live.textContent = ''; requestAnimationFrame(() => { live.textContent = text }) }
  function describe(s) {
    const k = keyOf(state.days[s])
    return fmtLong.format(dateOf(s)) + (k ? ': ' + nameOf(k) : '')
  }

  let drag = null
  let skipClick = null
  grid.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.d')
    if (!el || e.pointerType === 'touch' || e.button !== 0) return
    const id = targetFor(el.dataset.d)
    drag = { id, undo: apply([[el.dataset.d, id]]), pointer: e.pointerId }
    skipClick = el.dataset.d
    grid.setPointerCapture(e.pointerId)
    e.preventDefault()
    el.focus({ preventScroll: true })
  })
  grid.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.pointer) return
    const el = document.elementFromPoint(e.clientX, e.clientY)
    const d = el && el.closest && el.closest('.d')
    if (d) drag.undo.push(...apply([[d.dataset.d, drag.id]]))
  })
  const endDrag = () => { if (drag) { commit(drag.undo); drag = null } }
  grid.addEventListener('pointerup', endDrag)
  grid.addEventListener('pointercancel', endDrag)
  grid.addEventListener('click', (e) => {
    const el = e.target.closest('.d')
    if (!el) return
    // A mouse already painted on pointerdown; touch and keyboard paint here.
    if (skipClick === el.dataset.d) { skipClick = null; return }
    skipClick = null
    const id = targetFor(el.dataset.d)
    commit(apply([[el.dataset.d, id]]))
    setFocus(el.dataset.d, false)
    say(describe(el.dataset.d) || T.empty)
  })
  grid.addEventListener('pointerover', (e) => {
    const el = e.target.closest('.d')
    if (el) status.textContent = describe(el.dataset.d)
  })
  grid.addEventListener('focusin', (e) => {
    const el = e.target.closest('.d')
    if (el) status.textContent = describe(el.dataset.d)
  })

  function setFocus(s, move = true) {
    const old = cell(focusIso)
    if (old) old.tabIndex = -1
    const el = cell(s)
    el.tabIndex = 0
    focusIso = s
    if (move) el.focus()
  }
  grid.addEventListener('keydown', (e) => {
    const el = e.target.closest('.d')
    if (!el) return
    const d = dateOf(el.dataset.d)
    let m = d.getMonth(), day = d.getDate()
    if (e.key === 'ArrowDown') day = Math.min(day + 1, daysIn(state.year, m))
    else if (e.key === 'ArrowUp') day = Math.max(day - 1, 1)
    else if (e.key === 'ArrowRight') { m = Math.min(m + 1, 11); day = Math.min(day, daysIn(state.year, m)) }
    else if (e.key === 'ArrowLeft') { m = Math.max(m - 1, 0); day = Math.min(day, daysIn(state.year, m)) }
    else if (e.key === 'Home') day = 1
    else if (e.key === 'End') day = daysIn(state.year, m)
    else return
    e.preventDefault()
    setFocus(iso(state.year, m, day))
  })

  // --- Key ------------------------------------------------------------------------------------
  const IC = {
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.5a8.5 8.5 0 1 1 8.5-8.5c0 2.4-1.6 3.4-3.4 3.4h-1.9a1.8 1.8 0 0 0-1.3 3.1 1.2 1.2 0 0 1-.9 2Z"/><circle cx="7.8" cy="11" r="1"/><circle cx="11" cy="7.4" r="1"/><circle cx="15.4" cy="8.4" r="1"/></svg>',
    remove: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg>',
  }
  const counts = () => {
    const c = {}
    const prefix = state.year + '-'
    for (const s in state.days) if (s.startsWith(prefix)) c[state.days[s]] = (c[state.days[s]] || 0) + 1
    return c
  }
  const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

  function renderKey() {
    const rows = state.key.map((k, i) => `<li data-id="${k.id}">
<label class="pick"><input type="radio" name="brush" id="b-${k.id}" value="${k.id}"${brush === k.id ? ' checked' : ''}><span class="sw" style="--c:${k.color}"></span><span class="num" aria-hidden="true">${i < 9 ? i + 1 : ''}</span><span class="sr">${escHtml(nameOf(k))}</span></label>
<input class="lab" type="text" value="${escHtml(k.label)}" maxlength="40" placeholder="${escHtml(T.placeholder)}" aria-label="${escHtml(T.key)} ${i + 1}">
<span class="count" data-count></span>
<label class="edit" title="${escHtml(T.change)}">${IC.edit}<input type="color" value="${k.color}" aria-label="${escHtml(T.change)}: ${escHtml(nameOf(k))}"></label>
<button class="rm" type="button" aria-label="${escHtml(T.remove)}: ${escHtml(nameOf(k))}" title="${escHtml(T.remove)}">${IC.remove}</button>
</li>`)
    rows.push(`<li class="eraser" data-id="erase"><label class="pick"><input type="radio" name="brush" id="b-erase" value="erase"${brush === 'erase' ? ' checked' : ''}><span class="sw erase"></span><span class="num" aria-hidden="true"></span></label><span>${escHtml(T.eraser)}</span></li>`)
    keyList.innerHTML = rows.join('')
    $('add').disabled = state.key.length >= MAX_KEY
    renderStrip()
    renderCounts()
  }
  function renderStrip() {
    strip.innerHTML = state.key.map((k) => `<label for="b-${k.id}" class="${brush === k.id ? 'on' : ''}"><span class="sw" style="--c:${k.color}"></span><span>${escHtml(nameOf(k))}</span></label>`).join('') +
      `<label for="b-erase" class="${brush === 'erase' ? 'on' : ''}"><span class="sw erase"></span><span>${escHtml(T.eraser)}</span></label>`
  }
  function renderCounts() {
    const c = counts()
    keyList.querySelectorAll('li[data-id]').forEach((li) => {
      const n = c[li.dataset.id] || 0
      const el = li.querySelector('[data-count]')
      if (el) el.textContent = n ? n : ''
      if (el) el.setAttribute('aria-label', plural(n))
    })
  }
  function setBrush(id) {
    brush = id
    const r = $('b-' + id)
    if (r) r.checked = true
    renderStrip()
  }

  keyList.addEventListener('change', (e) => {
    const li = e.target.closest('li')
    if (e.target.name === 'brush') { setBrush(e.target.value); return }
    if (e.target.type === 'color') {
      const k = keyOf(li.dataset.id)
      k.color = e.target.value.toUpperCase()
      li.querySelector('.sw').style.setProperty('--c', k.color)
      save(); renderStrip(); repaintAll()
    }
  })
  keyList.addEventListener('input', (e) => {
    if (!e.target.classList.contains('lab')) return
    const li = e.target.closest('li')
    keyOf(li.dataset.id).label = e.target.value
    li.querySelector('.pick .sr').textContent = nameOf(keyOf(li.dataset.id))
    save(); renderStrip()
  })
  keyList.addEventListener('focusout', (e) => {
    if (e.target.classList.contains('lab')) repaintAll()
  })
  keyList.addEventListener('click', (e) => {
    const rm = e.target.closest('.rm')
    if (!rm) return
    const id = rm.closest('li').dataset.id
    const k = keyOf(id)
    const used = Object.keys(state.days).filter((s) => state.days[s] === id)
    if (used.length && !confirm(T.confirmRemove.replace('{name}', nameOf(k)).replace('{n}', used.length))) return
    used.forEach((s) => delete state.days[s])
    state.key = state.key.filter((x) => x.id !== id)
    history = history.map((u) => u.filter(([s, prev]) => prev !== id)).filter((u) => u.length)
    $('undo').disabled = !history.length
    if (brush === id) brush = state.key[0] ? state.key[0].id : 'erase'
    save(); renderKey(); repaintAll()
  })
  $('add').addEventListener('click', () => {
    if (state.key.length >= MAX_KEY) return
    const used = new Set(state.key.map((k) => k.color))
    const color = PALETTE.find((c) => !used.has(c)) || '#888888'
    const id = 'k' + Date.now().toString(36)
    state.key.push({ id, color, label: '' })
    brush = id
    save(); renderKey()
    const input = keyList.querySelector(`li[data-id="${id}"] .lab`)
    if (input) input.focus()
  })

  document.addEventListener('keydown', (e) => {
    const typing = !!(e.target.matches && e.target.matches('input[type="text"]'))
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); undoLast(); return }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return
    const n = parseInt(e.key, 10)
    if (n >= 1 && n <= 9 && state.key[n - 1]) { setBrush(state.key[n - 1].id); say(nameOf(state.key[n - 1])) }
  })

  // --- Toolbar --------------------------------------------------------------------------------
  function goYear(y) { state.year = y; save(); buildGrid(); renderCounts() }
  $('prev').addEventListener('click', () => goYear(state.year - 1))
  $('next').addEventListener('click', () => goYear(state.year + 1))
  $('undo').addEventListener('click', undoLast)
  $('clear').addEventListener('click', () => {
    const prefix = state.year + '-'
    const ch = Object.keys(state.days).filter((s) => s.startsWith(prefix)).map((s) => [s, null])
    if (!ch.length || !confirm(T.confirmClear.replace('{year}', state.year))) return
    commit(apply(ch))
  })

  // --- Export: the year and its key on white, like the app's poster -------------------------------
  $('export').addEventListener('click', () => {
    const y = state.year
    const S = 2
    const W = 1080
    const pad = 72
    const font = (w, px) => `${w} ${px}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`
    const numW = 40
    const colP = (W - pad * 2 - numW) / 12
    const rowP = 26
    const gap = 4
    const gridTop = 250
    const gridH = 20 + 31 * rowP
    const c = counts()
    const used = state.key.filter((k) => c[k.id])
    const keyRows = Math.ceil(used.length / 2)
    const H = gridTop + gridH + (used.length ? 60 + keyRows * 52 : 0) + 120
    const cv = document.createElement('canvas')
    cv.width = W * S; cv.height = H * S
    const g = cv.getContext('2d')
    g.scale(S, S)
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H)
    g.fillStyle = '#111111'; g.textBaseline = 'alphabetic'
    g.font = font(200, 132); g.fillText(String(y), pad - 6, 190)
    g.font = font(500, 26); g.textAlign = 'right'; g.fillText(T.sheetTitle, W - pad, 186)
    g.textAlign = 'center'; g.font = font(600, 16); g.fillStyle = '#5E5E5E'
    for (let m = 0; m < 12; m++) g.fillText(fmtInitial.format(new Date(y, m, 1)).toUpperCase(), pad + numW + m * colP + (colP - gap) / 2, gridTop + 12)
    g.textAlign = 'right'; g.font = font(400, 15)
    for (const d of [1, 10, 20, 30]) g.fillText(String(d), pad + numW - 12, gridTop + 20 + (d - 1) * rowP + rowP / 2 + 2)
    for (let m = 0; m < 12; m++) {
      for (let d = 1; d <= daysIn(y, m); d++) {
        const k = keyOf(state.days[iso(y, m, d)])
        const x = pad + numW + m * colP, yy = gridTop + 20 + (d - 1) * rowP
        g.fillStyle = k ? k.color : '#EEEEEE'
        g.beginPath(); g.roundRect(x, yy, colP - gap, rowP - gap, 4); g.fill()
        if (k && contrast(k.color, '#FFFFFF') < 1.3) { g.strokeStyle = '#D6D6D6'; g.lineWidth = 1; g.stroke() }
      }
    }
    let ky = gridTop + gridH + 60
    g.textAlign = 'left'
    used.forEach((k, i) => {
      const x = pad + (i % 2) * ((W - pad * 2) / 2)
      const yy = ky + Math.floor(i / 2) * 52
      g.fillStyle = k.color; g.beginPath(); g.roundRect(x, yy - 22, 40, 28, 6); g.fill()
      if (contrast(k.color, '#FFFFFF') < 1.3) { g.strokeStyle = '#D6D6D6'; g.stroke() }
      g.fillStyle = '#111111'; g.font = font(500, 22); g.fillText(nameOf(k), x + 56, yy)
      g.fillStyle = '#5E5E5E'; g.font = font(400, 18); g.fillText(plural(c[k.id]), x + 56 + g.measureText(nameOf(k)).width + 14 + 0, yy)
    })
    g.fillStyle = '#5E5E5E'; g.font = font(400, 16)
    g.fillText('Chroma: Color Year in Pixels', pad, H - 48)
    g.textAlign = 'right'; g.fillText('color.baltajmn.dev', W - pad, H - 48)
    cv.toBlob((blob) => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${T.file}-${y}.png`
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(a.href), 4000)
    }, 'image/png')
  })

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', repaintAll)
  buildGrid()
  renderKey()
})()
