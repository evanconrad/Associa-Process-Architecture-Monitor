/* Associa Process Architecture — Workflow Monitor */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let state = { processes: null, sessions: null, decisions: null };
let view = 'overview';
let sort = { key: 'stage', dir: -1 };
let sel = null;

/* ---------- persistence ----------
   The preview iframe runs on an opaque origin, so browser storage is unavailable.
   State is kept in memory for the session; use Export JSON to persist a snapshot. */
let flashT;
function flash() { const h = $('#saveHint'); h.classList.add('on'); clearTimeout(flashT); flashT = setTimeout(() => h.classList.remove('on'), 1200); }
let edits = 0;
function save() {
  edits++;
  $('#lastsave').textContent = edits + (edits === 1 ? ' unsaved edit' : ' unsaved edits') + ' — export to keep';
  flash();
}

state.processes = JSON.parse(JSON.stringify(PROCESSES));
state.sessions = JSON.parse(JSON.stringify(SESSIONS));
state.decisions = JSON.parse(JSON.stringify(DECISIONS));

/* ---------- helpers ---------- */
const vsOf = id => VALUE_STREAMS.find(v => v.id === id) || VALUE_STREAMS[VALUE_STREAMS.length - 1];
const stageOf = n => STAGES.find(s => s.id === n) || STAGES[0];
function readiness(p) { const r = p.rubric, d = r.PC + r.AC + r.FB; return d ? Math.round((r.PC + r.AC) / d * 100) : null; }
function coverage(p) { return Object.values(p.branches || {}).filter(Boolean).length; }
function vsTagClass(id) { return 'tag vs' + (id || 0); }
function flags(p) {
  const f = [];
  if (!p.traceable) f.push('Not traceable to evidence');
  if (!p.systemsMapped) f.push('No system mapping');
  if (p.vs === 0) f.push('Unassigned value stream');
  if (p.rubric.FB >= 2 && p.rubric.FB >= p.rubric.PC) f.push('Gap-heavy (FB ≥ PC)');
  if (coverage(p) <= 2 && p.stage >= 5) f.push('Thin branch coverage for stage');
  if (p.stage >= 6 && !p.controls) f.push('Proposed without controls');
  return f;
}

/* ---------- nav ---------- */
const TITLES = {
  overview: ['Control room', 'Company standard to repeatable branch onboarding — live health'],
  atlas: ['Stage atlas', 'The eight-stage onboarding operating model'],
  gaps: ['Gap register', 'True gaps vs. legitimate branch-specific requirements'],
  register: ['Process register', 'Define, monitor, and audit every process record'],
  pipeline: ['Stage board', 'Move processes through the eight onboarding stages'],
  streams: ['Value streams', 'Working taxonomy — pending business validation'],
  evidence: ['Evidence intake', 'Existing branch discovery feeding the process library'],
  matrix: ['Variance matrix', 'Common vs. variant vs. unique practice by branch group'],
  decisions: ['Open decisions', 'Every unresolved decision blocking an Associa standard'],
  rubric: ['Rubric readiness', 'Classification math behind conversion readiness']
};
function go(v) {
  view = v;
  $$('#nav button').forEach(b => b.setAttribute('aria-current', String(b.dataset.view === v)));
  $$('.view').forEach(s => s.classList.toggle('on', s.id === 'v-' + v));
  $('#viewTitle').textContent = TITLES[v][0];
  $('#viewSub').textContent = TITLES[v][1];
  $('#main').scrollTop = 0;
  $('#sidebar').classList.remove('on');
  render();
}
$('#nav').addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(b.dataset.view); });
$('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('on'));
$('#themeBtn').addEventListener('click', () => {
  const r = document.documentElement;
  r.dataset.theme = r.dataset.theme === 'dark' ? 'light' : 'dark';
});
if (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.dataset.theme = 'dark';

/* ---------- render root ---------- */
function render() {
  counts();
  if (view === 'overview') renderOverview();
  if (view === 'register') renderRegister();
  if (view === 'pipeline') renderBoard();
  if (view === 'streams') renderStreams();
  if (view === 'evidence') renderEvidence();
  if (view === 'matrix') renderMatrix();
  if (view === 'decisions') renderDecisions();
  if (view === 'rubric') renderRubric();
  if (view === 'atlas') renderAtlas();
  if (view === 'gaps') renderGaps();
}
function counts() {
  $('#ct-reg').textContent = state.processes.length;
  $('#ct-pipe').textContent = state.processes.filter(p => p.stage < STAGES.length).length;
  $('#ct-vs').textContent = VALUE_STREAMS.length - 1;
  $('#ct-ev').textContent = state.sessions.filter(s => s.status !== 'Analyzed').length;
  $('#ct-dec').textContent = state.decisions.filter(d => d.status === 'Open').length;
  $('#ct-gap').textContent = allGaps().length;
}

/* ---------- overview ---------- */
function renderOverview() {
  const P = state.processes;
  const validated = P.filter(p => p.stage === 8).length;
  const proposed = P.filter(p => p.stage >= 7).length;
  const placed = P.filter(p => p.stage >= 6).length;
  const totals = P.reduce((a, p) => { a.PC += p.rubric.PC; a.AC += p.rubric.AC; a.FB += p.rubric.FB; a.NA += p.rubric.NA; return a; }, { PC: 0, AC: 0, FB: 0, NA: 0 });
  const den = totals.PC + totals.AC + totals.FB;
  const ready = den ? Math.round((totals.PC + totals.AC) / den * 100) : 0;
  const risky = P.filter(p => flags(p).length).length;
  const analyzed = state.sessions.filter(s => s.status === 'Analyzed').length;
  const openDec = state.decisions.filter(d => d.status === 'Open').length;

  $('#kpis').innerHTML = [
    ['Processes tracked', P.length, `${placed} placed in a stream`],
    ['Standards proposed', proposed, `${validated} business validated`, validated ? 'ok' : 'warn'],
    ['Conversion readiness', ready + '%', `${totals.FB} dimensions in backlog`, ready >= 70 ? 'ok' : 'warn'],
    ['Records needing work', risky, risky ? 'traceability or system gaps' : 'all clean', risky ? 'warn' : 'ok'],
    ['Evidence analyzed', `${analyzed}/${state.sessions.length}`, `${state.sessions.filter(s => s.status === 'Scheduled').length} sessions still ahead`],
    ['Open decisions', openDec, openDec ? 'blocking standards' : 'none blocking', openDec ? 'warn' : 'ok']
  ].map(([k, v, d, cls]) => `<div class="kpi"><span class="k">${esc(k)}</span><b>${esc(v)}</b><span class="d ${cls || ''}">${esc(d)}</span></div>`).join('');

  $('#funnel').innerHTML = STAGES.map(s => {
    const n = P.filter(p => p.stage === s.id).length;
    const at = P.filter(p => p.stage >= s.id).length;
    return `<button class="fstage" data-fstage="${s.id}" style="text-align:left;font:inherit;color:inherit;cursor:pointer">
      <div class="n">${at}</div>
      <div class="t"><b>${esc(s.short)}</b><br>${esc(s.desc)}<br>${n} resting here</div>
      <div class="bar" style="background:${s.color};width:${Math.max(12, at / P.length * 100)}%"></div>
    </button>`;
  }).join('');
  $$('#funnel [data-fstage]').forEach(b => b.addEventListener('click', () => { $('#fstage').value = b.dataset.fstage; go('register'); }));

  const alerts = [];
  P.forEach(p => flags(p).forEach(f => alerts.push({ p, f, sev: f.includes('Unassigned') || f.includes('without controls') ? 'risk' : 'warn' })));
  state.decisions.filter(d => d.status === 'Open' && d.due < '2026-09-12').forEach(d => alerts.push({ d, f: 'Decision due ' + d.due, sev: 'risk' }));
  state.sessions.filter(s => s.status === 'Awaiting transcript').forEach(s => alerts.push({ s, f: 'Transcript overdue', sev: 'warn' }));
  alerts.sort((a, b) => (a.sev === 'risk' ? -1 : 1) - (b.sev === 'risk' ? -1 : 1));
  $('#alertCount').textContent = alerts.length + ' items';
  $('#alerts').innerHTML = alerts.slice(0, 9).map(a => {
    const label = a.p ? `${a.p.id} · ${a.p.name}` : a.d ? `${a.d.id} · ${a.d.title}` : `${a.s.code} · ${a.s.branch}`;
    const col = a.sev === 'risk' ? 'var(--accent)' : 'var(--gold)';
    return `<div class="alert"${a.p ? ` data-open="${a.p.id}" style="cursor:pointer"` : ''}><i style="background:${col}"></i><div><div class="t">${esc(a.f)}</div><div class="s"><b>${esc(label)}</b></div></div></div>`;
  }).join('') || '<div class="empty">Nothing needs attention.</div>';
  $$('#alerts [data-open]').forEach(el => el.addEventListener('click', () => open(el.dataset.open)));

  $('#vsCoverage').innerHTML = VALUE_STREAMS.map(v => {
    const rows = P.filter(p => p.vs === v.id);
    if (!rows.length && v.id === 0) return '';
    const pl = rows.filter(p => p.stage >= 6).length, pr = rows.filter(p => p.stage >= 7).length, va = rows.filter(p => p.stage === 8).length;
    const t = Math.max(rows.length, 1);
    return `<div class="barrow"><span class="lb"><span class="${vsTagClass(v.id)}">${esc(v.code)}</span> ${esc(v.name)}</span>
      <span class="track">
        <i style="width:${va / t * 100}%;background:var(--green)"></i>
        <i style="width:${(pr - va) / t * 100}%;background:var(--purple)"></i>
        <i style="width:${(pl - pr) / t * 100}%;background:var(--teal)"></i>
        <i style="width:${(rows.length - pl) / t * 100}%;background:var(--border-2)"></i>
      </span><span class="vl">${rows.length}</span></div>`;
  }).join('') + `<p style="font-size:var(--text-xs);color:var(--ink-3);margin-top:.75rem">
    <span style="color:var(--green)">■</span> validated
    <span style="color:var(--purple)">■</span> proposed
    <span style="color:var(--teal)">■</span> placed
    <span style="color:var(--ink-3)">■</span> earlier stage</p>`;

  const byStatus = SESSION_STATUS.map(s => [s, state.sessions.filter(x => x.status === s).length]);
  $('#evSummary').innerHTML = byStatus.map(([s, n]) => `<div class="itemrow"><div><div class="t">${esc(s)}</div><div class="s">${Math.round(n / state.sessions.length * 100)}% of all sessions</div></div><b class="num" style="font-size:var(--text-lg)">${n}</b></div>`).join('');

  $('#readiness').innerHTML = domainRows();

  $('#decSummary').innerHTML = state.decisions.filter(d => d.status === 'Open').slice(0, 6).map(d =>
    `<div class="itemrow"><div><div class="t">${esc(d.title)}</div><div class="s">${esc(d.owner)} · due ${esc(d.due)}</div></div><span class="tag ${d.due < '2026-09-12' ? 'risk' : 'warn'}">${esc(d.type)}</span></div>`
  ).join('') || '<div class="empty">No open decisions.</div>';
}

function domainRows() {
  return RUBRIC_DOMAINS.map(d => {
    const rows = state.processes.filter(p => (p.domain || '').startsWith(d.code));
    const t = rows.reduce((a, p) => { a.PC += p.rubric.PC; a.AC += p.rubric.AC; a.FB += p.rubric.FB; return a; }, { PC: 0, AC: 0, FB: 0 });
    const den = t.PC + t.AC + t.FB;
    const pct = den ? Math.round((t.PC + t.AC) / den * 100) : 0;
    const col = pct >= 75 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--accent)';
    return `<div class="barrow"><span class="lb"><b>${esc(d.code)}</b> ${esc(d.name)} · ${d.dims} dims</span>
      <span class="track"><i style="width:${den ? pct : 0}%;background:${col}"></i></span>
      <span class="vl">${den ? pct + '%' : '—'}</span></div>`;
  }).join('');
}

/* ---------- register ---------- */
function fillSelect(el, opts, all) {
  el.innerHTML = `<option value="">${all}</option>` + opts.map(o => `<option value="${esc(o[0])}">${esc(o[1])}</option>`).join('');
}
fillSelect($('#fvs'), VALUE_STREAMS.map(v => [v.id, v.code + ' · ' + v.name]), 'All value streams');
fillSelect($('#fstage'), STAGES.map(s => [s.id, s.id + '. ' + s.name]), 'All stages');
fillSelect($('#fowner'), OWNERS.map(o => [o, o]), 'All owners');
fillSelect($('#pvs'), VALUE_STREAMS.map(v => [v.id, v.code + ' · ' + v.name]), 'All value streams');
fillSelect($('#mvs'), VALUE_STREAMS.filter(v => v.id).map(v => [v.id, v.code + ' · ' + v.name]), 'All value streams');
fillSelect($('#ebranch'), BRANCHES.map(b => [b, b]), 'All branch groups');
fillSelect($('#estatus'), SESSION_STATUS.map(s => [s, s]), 'All statuses');
['#q', '#fvs', '#fstage', '#fowner', '#fflag'].forEach(s => $(s).addEventListener('input', renderRegister));
$('#clearF').addEventListener('click', () => { ['#q', '#fvs', '#fstage', '#fowner', '#fflag'].forEach(s => $(s).value = ''); renderRegister(); });
['#pvs'].forEach(s => $(s).addEventListener('input', renderBoard));
['#ebranch', '#estatus'].forEach(s => $(s).addEventListener('input', renderEvidence));
$('#mvs').addEventListener('input', renderMatrix);

function filtered() {
  const q = $('#q').value.trim().toLowerCase();
  const fv = $('#fvs').value, fs = $('#fstage').value, fo = $('#fowner').value, ff = $('#fflag').value;
  return state.processes.filter(p => {
    if (fv !== '' && String(p.vs) !== fv) return false;
    if (fs !== '' && String(p.stage) !== fs) return false;
    if (fo && p.owner !== fo) return false;
    if (ff === 'untraced' && p.traceable) return false;
    if (ff === 'nosys' && p.systemsMapped) return false;
    if (ff === 'fb' && !(p.rubric.FB >= 2 && p.rubric.FB >= p.rubric.PC)) return false;
    if (ff === 'unassigned' && p.vs !== 0) return false;
    if (q) {
      const hay = [p.id, p.name, p.capability, p.domain, p.l2, p.systems, p.owner, (p.evidence || []).join(' '), (p.steps || []).map(s => s.n).join(' ')].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
function sortRows(rows) {
  const k = sort.key;
  const val = p => k === 'readiness' ? (readiness(p) ?? -1)
    : k === 'mix' ? p.rubric.FB
    : k === 'branches' ? coverage(p)
    : k === 'vs' ? p.vs
    : (p[k] ?? '');
  return rows.slice().sort((a, b) => {
    const x = val(a), y = val(b);
    return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))) * sort.dir;
  });
}
function mixBar(r) {
  const t = r.PC + r.AC + r.FB + r.NA || 1;
  return `<span class="mixbar">
    <i style="width:${r.PC / t * 100}%;background:var(--blue)"></i>
    <i style="width:${r.AC / t * 100}%;background:var(--teal)"></i>
    <i style="width:${r.FB / t * 100}%;background:var(--accent)"></i>
    <i style="width:${r.NA / t * 100}%;background:var(--border-2)"></i>
  </span>`;
}
function stagePill(p) {
  return `<span class="stagepill"><span class="sq">${STAGES.map(s => `<i class="${p.stage > s.id ? 'done' : p.stage === s.id ? 'on' : ''}"></i>`).join('')}</span>${esc(stageOf(p.stage).short)}</span>`;
}
function renderRegister() {
  const rows = sortRows(filtered());
  $('#regCount').textContent = `${rows.length} of ${state.processes.length} processes`;
  $$('#regTable thead th').forEach(th => { th.classList.toggle('sorted', th.dataset.sort === sort.key); th.classList.toggle('asc', sort.dir === 1); });
  $('#regBody').innerHTML = rows.map(p => {
    const r = readiness(p), fl = flags(p);
    return `<tr data-open="${p.id}">
      <td><div class="pname">${esc(p.name)}</div><div class="pmeta">${esc(p.id)} · ${esc(p.capability)}${fl.length ? ` · <span style="color:var(--accent)">${fl.length} flag${fl.length > 1 ? 's' : ''}</span>` : ''}</div></td>
      <td><span class="${vsTagClass(p.vs)}">${esc(vsOf(p.vs).code)}</span><div class="pmeta">${esc(p.l2)}</div></td>
      <td>${stagePill(p)}</td>
      <td class="n">${r == null ? '—' : `<span class="tag ${r >= 75 ? 'ok' : r >= 50 ? 'warn' : 'risk'}">${r}%</span>`}</td>
      <td class="n">${mixBar(p.rubric)}<div class="pmeta">${p.rubric.PC}/${p.rubric.AC}/${p.rubric.FB}/${p.rubric.NA}</div></td>
      <td class="n">${coverage(p)} / ${BRANCHES.length}</td>
      <td>${esc(p.owner.split('·')[0])}<div class="pmeta">${esc(p.owner.split('·')[1] || '')}</div></td>
      <td class="n">${esc(p.updated)}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="8"><div class="empty">No processes match these filters.</div></td></tr>';
  bindOpen('#regBody');
}
$$('#regTable thead th').forEach(th => th.addEventListener('click', () => {
  if (!th.dataset.sort) return;
  if (sort.key === th.dataset.sort) sort.dir *= -1; else { sort.key = th.dataset.sort; sort.dir = -1; }
  renderRegister();
}));
function bindOpen(scope) { $$(scope + ' [data-open]').forEach(el => el.addEventListener('click', () => open(el.dataset.open))); }

/* ---------- pipeline board ---------- */
function renderBoard() {
  const fv = $('#pvs').value;
  const rows = state.processes.filter(p => fv === '' || String(p.vs) === fv);
  $('#board').innerHTML = STAGES.map(s => {
    const items = rows.filter(p => p.stage === s.id);
    return `<div class="col" data-stage="${s.id}" style="--sc:${s.color}">
      <h4>${esc(s.short)}<span>${items.length}</span></h4>
      <div class="cards">${items.map(p => `<div class="pcard b${p.vs}" draggable="true" data-id="${p.id}">
        <b>${esc(p.name)}</b>
        <div class="m"><span class="${vsTagClass(p.vs)}">${esc(vsOf(p.vs).code)}</span>${readiness(p) == null ? '' : `<span>${readiness(p)}% ready</span>`}<span>${coverage(p)}/${BRANCHES.length} branches</span></div>
      </div>`).join('') || '<div class="empty" style="padding:1rem;font-size:var(--text-xs)">Empty</div>'}</div>
    </div>`;
  }).join('');
  $$('.pcard').forEach(c => {
    c.addEventListener('click', () => open(c.dataset.id));
    c.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', c.dataset.id); c.classList.add('dragging'); });
    c.addEventListener('dragend', () => c.classList.remove('dragging'));
  });
  $$('.col').forEach(col => {
    col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('over'); });
    col.addEventListener('dragleave', () => col.classList.remove('over'));
    col.addEventListener('drop', e => {
      e.preventDefault(); col.classList.remove('over');
      const p = state.processes.find(x => x.id === e.dataTransfer.getData('text/plain'));
      if (p) { p.stage = +col.dataset.stage; p.updated = today(); save(); render(); }
    });
  });
}
const today = () => new Date().toISOString().slice(0, 10);

/* ---------- streams ---------- */
function renderStreams() {
  $('#vsCards').innerHTML = VALUE_STREAMS.map(v => {
    const rows = state.processes.filter(p => p.vs === v.id);
    const t = rows.reduce((a, p) => { a.PC += p.rubric.PC; a.AC += p.rubric.AC; a.FB += p.rubric.FB; return a; }, { PC: 0, AC: 0, FB: 0 });
    const den = t.PC + t.AC + t.FB, pct = den ? Math.round((t.PC + t.AC) / den * 100) : null;
    return `<div class="panel">
      <div class="ph"><span class="${vsTagClass(v.id)}">${esc(v.code)}</span><h3>${esc(v.name)}</h3><span class="hint" style="margin-left:auto"><span class="tag ${v.status === 'Working' ? 'warn' : 'neutral'}">${esc(v.status)}</span></span></div>
      <div class="pb">
        <p style="font-size:var(--text-sm);color:var(--ink-2)">${esc(v.scope)}</p>
        <div class="barrow" style="grid-template-columns:150px 1fr 64px;margin-top:.5rem">
          <span class="lb">Readiness</span><span class="track"><i style="width:${pct || 0}%;background:${(pct || 0) >= 75 ? 'var(--green)' : 'var(--gold)'}"></i></span><span class="vl">${pct == null ? '—' : pct + '%'}</span>
        </div>
        <div class="barrow" style="grid-template-columns:150px 1fr 64px">
          <span class="lb">Validated processes</span><span class="track"><i style="width:${rows.length ? rows.filter(p => p.stage === 8).length / rows.length * 100 : 0}%;background:var(--green)"></i></span><span class="vl">${rows.filter(p => p.stage === 8).length}/${rows.length}</span>
        </div>
        <div style="margin-top:.75rem">${rows.map(p => `<div class="itemrow" data-open="${p.id}" style="cursor:pointer"><div><div class="t">${esc(p.name)}</div><div class="s">${esc(p.l2)} · ${esc(p.capability)}</div></div><div style="text-align:right">${stagePill(p)}${flags(p).length ? `<div class="s" style="color:var(--accent)">${flags(p).length} flag${flags(p).length > 1 ? 's' : ''}</div>` : ''}</div></div>`).join('') || '<div class="empty" style="padding:1rem">No processes placed here yet.</div>'}</div>
      </div>
    </div>`;
  }).join('');
  bindOpen('#vsCards');
}

/* ---------- evidence ---------- */
function renderEvidence() {
  const fb = $('#ebranch').value, fs = $('#estatus').value;
  const rows = state.sessions.filter(s => (!fb || s.branch === fb) && (!fs || s.status === fs));
  $('#evCount').textContent = `${rows.length} of ${state.sessions.length} sessions`;
  $('#evBody').innerHTML = rows.map(s => {
    const linked = state.processes.filter(p => (p.evidence || []).some(e => e.startsWith(s.code)));
    const cls = s.status === 'Analyzed' ? 'ok' : s.status === 'Awaiting transcript' ? 'risk' : s.status === 'Transcript received' ? 'warn' : 'neutral';
    return `<tr>
      <td class="n">${esc(s.date)}</td>
      <td><b>${esc(s.code)}</b>${s.flagged ? ' <span class="tag risk">priority</span>' : ''}</td>
      <td>${esc(s.branch)}</td>
      <td><span class="tag ${cls}">${esc(s.status)}</span></td>
      <td>${linked.length ? linked.map(p => `<span class="tag ${vsTagClass(p.vs)}" data-open="${p.id}" style="cursor:pointer">${esc(p.name)}</span>`).join(' ') : '<span style="color:var(--ink-3)">none</span>'}</td>
      <td><select class="selmini" data-sess="${esc(s.code)}">${SESSION_STATUS.map(x => `<option${x === s.status ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></td>
    </tr>`;
  }).join('') || '<tr><td colspan="6"><div class="empty">No sessions match.</div></td></tr>';
  bindOpen('#evBody');
  $$('[data-sess]').forEach(sel2 => sel2.addEventListener('change', () => {
    const s = state.sessions.find(x => x.code === sel2.dataset.sess);
    s.status = sel2.value; save(); $('#importBtn').addEventListener('click', () => $('#importFile').click());
$('#importFile').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result);
      if (d.processes) state.processes = d.processes;
      if (d.sessions) state.sessions = d.sessions;
      if (d.decisions) state.decisions = d.decisions;
      edits = 0; $('#lastsave').textContent = 'Snapshot loaded from ' + f.name;
      render();
    } catch (err) { $('#lastsave').textContent = 'Could not read that file'; }
  };
  rd.readAsText(f);
  e.target.value = '';
});

render();
  }));
  $('#branchBars').innerHTML = BRANCHES.map(b => {
    const all = state.sessions.filter(s => s.branch === b);
    const an = all.filter(s => s.status === 'Analyzed').length;
    const rec = all.filter(s => s.status === 'Transcript received').length;
    return `<div class="barrow" style="grid-template-columns:70px 1fr 64px"><span class="lb"><b>${esc(b)}</b></span>
      <span class="track"><i style="width:${an / all.length * 100}%;background:var(--green)"></i><i style="width:${rec / all.length * 100}%;background:var(--gold)"></i></span>
      <span class="vl">${an}/${all.length}</span></div>`;
  }).join('') + '<p style="font-size:var(--text-xs);color:var(--ink-3);margin-top:.75rem"><span style="color:var(--green)">■</span> analyzed <span style="color:var(--gold)">■</span> transcript received</p>';
}

/* ---------- matrix ---------- */
function renderMatrix() {
  const fv = $('#mvs').value;
  const rows = state.processes.filter(p => p.vs !== 0 && (fv === '' || String(p.vs) === fv));
  const label = { common: 'C', variant: 'V', unique: 'U', missing: 'M', '': '—' };
  $('#matrixTable').innerHTML = `<thead><tr><th style="min-width:240px">Process</th>${BRANCHES.map(b => `<th style="text-align:center">${esc(b)}</th>`).join('')}<th style="text-align:center">Coverage</th></tr></thead>
  <tbody>${rows.map(p => `<tr>
    <td><div class="pname" data-open="${p.id}" style="cursor:pointer">${esc(p.name)}</div><div class="pmeta"><span class="${vsTagClass(p.vs)}">${esc(vsOf(p.vs).code)}</span> ${esc(p.capability)}</div></td>
    ${BRANCHES.map(b => { const v = p.branches[b] || ''; return `<td class="cell ${v || 'none'}" data-p="${p.id}" data-b="${b}">${label[v]}</td>`; }).join('')}
    <td class="n" style="text-align:center">${coverage(p)}/${BRANCHES.length}</td></tr>`).join('')}</tbody>`;
  bindOpen('#matrixTable');
  $$('#matrixTable .cell').forEach(td => td.addEventListener('click', () => {
    const p = state.processes.find(x => x.id === td.dataset.p);
    const cur = p.branches[td.dataset.b] || '';
    p.branches[td.dataset.b] = VARIANCE[(VARIANCE.indexOf(cur) + 1) % VARIANCE.length];
    p.updated = today(); save(); renderMatrix(); counts();
  }));
}

/* ---------- decisions ---------- */
function renderDecisions() {
  $('#decBody').innerHTML = state.decisions.map(d => `<tr>
    <td class="n">${esc(d.id)}</td>
    <td><div class="pname ${d.status === 'Resolved' ? 'strike' : ''}">${esc(d.title)}</div><div class="pmeta">${esc(d.detail || '')}</div></td>
    <td><span class="tag neutral">${esc(d.type)}</span></td>
    <td>${esc(d.owner)}</td>
    <td class="n">${esc(d.due || '—')}</td>
    <td><span class="tag ${d.status === 'Open' ? (d.due < '2026-09-12' ? 'risk' : 'warn') : 'ok'}">${esc(d.status)}</span></td>
    <td><button class="btn" data-dec="${esc(d.id)}">${d.status === 'Open' ? 'Resolve' : 'Reopen'}</button></td>
  </tr>`).join('');
  $$('[data-dec]').forEach(b => b.addEventListener('click', () => {
    const d = state.decisions.find(x => x.id === b.dataset.dec);
    d.status = d.status === 'Open' ? 'Resolved' : 'Open'; save(); $('#importBtn').addEventListener('click', () => $('#importFile').click());
$('#importFile').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result);
      if (d.processes) state.processes = d.processes;
      if (d.sessions) state.sessions = d.sessions;
      if (d.decisions) state.decisions = d.decisions;
      edits = 0; $('#lastsave').textContent = 'Snapshot loaded from ' + f.name;
      render();
    } catch (err) { $('#lastsave').textContent = 'Could not read that file'; }
  };
  rd.readAsText(f);
  e.target.value = '';
});

render();
  }));
}
$('#dAdd').addEventListener('click', () => {
  const t = $('#dTitle').value.trim(); if (!t) return;
  state.decisions.push({ id: 'D-' + String(state.decisions.length + 1).padStart(2, '0'), title: t, detail: '', owner: $('#dOwner').value.trim() || 'Unassigned', type: $('#dType').value, due: $('#dDue').value || '', status: 'Open' });
  $('#dTitle').value = ''; $('#dOwner').value = ''; $('#dDue').value = '';
  save(); $('#importBtn').addEventListener('click', () => $('#importFile').click());
$('#importFile').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result);
      if (d.processes) state.processes = d.processes;
      if (d.sessions) state.sessions = d.sessions;
      if (d.decisions) state.decisions = d.decisions;
      edits = 0; $('#lastsave').textContent = 'Snapshot loaded from ' + f.name;
      render();
    } catch (err) { $('#lastsave').textContent = 'Could not read that file'; }
  };
  rd.readAsText(f);
  e.target.value = '';
});

render();
});

/* ---------- rubric ---------- */
function renderRubric() {
  $('#rubDomains').innerHTML = domainRows();
  const t = state.processes.reduce((a, p) => { a.PC += p.rubric.PC; a.AC += p.rubric.AC; a.FB += p.rubric.FB; a.NA += p.rubric.NA; return a; }, { PC: 0, AC: 0, FB: 0, NA: 0 });
  const tot = t.PC + t.AC + t.FB + t.NA || 1;
  const meta = { PC: ['Process change', 'var(--blue)'], AC: ['Add / configure', 'var(--teal)'], FB: ['Feature backlog', 'var(--accent)'], NA: ['Not applicable', 'var(--border-2)'] };
  $('#rubTotals').innerHTML = Object.keys(meta).map(k => `<div class="barrow" style="grid-template-columns:190px 1fr 74px">
    <span class="lb"><b>${k}</b> ${esc(meta[k][0])}</span>
    <span class="track"><i style="width:${t[k] / tot * 100}%;background:${meta[k][1]}"></i></span>
    <span class="vl">${t[k]} · ${Math.round(t[k] / tot * 100)}%</span></div>`).join('')
    + `<p style="font-size:var(--text-sm);color:var(--ink-2);margin-top:1rem">Readiness = (PC + AC) / (PC + AC + FB) = <b>${Math.round((t.PC + t.AC) / (t.PC + t.AC + t.FB) * 100)}%</b> across ${tot} classified dimensions.</p>`;
  $('#rubRouting').innerHTML = [
    ['PC', 'Process Change', 'Community Management — branch adopts the Associa standard practice.'],
    ['AC', 'Add / Configure', 'Implementation — configurable in the target platform, no build required.'],
    ['FB', 'Feature Backlog', 'TownSq Product — prioritized P0–P3; a genuine capability gap.'],
    ['NA', 'Not Applicable', 'Out of scope for this branch or community type.']
  ].map(([c, n, d]) => `<div class="itemrow"><div><div class="t">${esc(c)} · ${esc(n)}</div><div class="s">${esc(d)}</div></div><b class="num" style="font-size:var(--text-lg)">${state.processes.reduce((a, p) => a + p.rubric[c], 0)}</b></div>`).join('');
}

/* ---------- drawer (define / edit) ---------- */
const drawer = $('#drawer'), scrim = $('#scrim');
function open(id) {
  sel = state.processes.find(p => p.id === id);
  if (!sel) return;
  drawer.classList.add('on'); scrim.classList.add('on'); drawer.setAttribute('aria-hidden', 'false');
  renderDrawer();
}
function close() { drawer.classList.remove('on'); scrim.classList.remove('on'); drawer.setAttribute('aria-hidden', 'true'); sel = null; render(); }
scrim.addEventListener('click', close);
$('#dClose').addEventListener('click', close);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('on')) close(); });

function renderDrawer() {
  const p = sel;
  $('#dName').textContent = p.name;
  const r = readiness(p);
  $('#dMeta').innerHTML = `<span class="${vsTagClass(p.vs)}">${esc(vsOf(p.vs).code)}</span>
    <span>${esc(p.id)}</span><span>·</span><span>${esc(p.domain)}</span><span>·</span><span>${esc(p.capability)}</span>
    ${r == null ? '' : `<span class="tag ${r >= 75 ? 'ok' : r >= 50 ? 'warn' : 'risk'}">${r}% ready</span>`}
    <span class="tag neutral">${esc(stageOf(p.stage).name)}</span>`;

  const fl = flags(p);
  $('#dBody').innerHTML = `
  ${fl.length ? `<div class="panel" style="border-color:var(--accent)"><div class="pb">${fl.map(f => `<div class="alert"><i style="background:var(--accent)"></i><div class="t">${esc(f)}</div></div>`).join('')}</div></div>` : ''}

  <fieldset class="fieldset"><legend>Definition</legend>
    <div class="f2">
      <div class="field"><label>Process name</label><input data-f="name" value="${esc(p.name)}" /></div>
      <div class="field"><label>Process family (L2)</label><input data-f="l2" value="${esc(p.l2)}" /></div>
    </div>
    <div class="field"><label>Trigger</label><input data-f="trigger" value="${esc(p.trigger)}" placeholder="What starts this process?" /></div>
    <div class="field"><label>Business outcome</label><input data-f="outcome" value="${esc(p.outcome)}" placeholder="What must be true when it ends?" /></div>
    <div class="f2">
      <div class="field"><label>Roles</label><input data-f="roles" value="${esc(p.roles)}" /></div>
      <div class="field"><label>Systems</label><input data-f="systems" value="${esc(p.systems)}" /></div>
    </div>
    <div class="f2">
      <div class="field"><label>Controls</label><textarea data-f="controls">${esc(p.controls)}</textarea></div>
      <div class="field"><label>Exceptions</label><textarea data-f="exceptions">${esc(p.exceptions)}</textarea></div>
    </div>
  </fieldset>

  <fieldset class="fieldset"><legend>Placement &amp; ownership</legend>
    <div class="f3">
      <div class="field"><label>Value stream</label><select data-f="vs">${VALUE_STREAMS.map(v => `<option value="${v.id}"${v.id === p.vs ? ' selected' : ''}>${esc(v.code)} · ${esc(v.name)}</option>`).join('')}</select></div>
      <div class="field"><label>Workflow stage</label><select data-f="stage">${STAGES.map(s => `<option value="${s.id}"${s.id === p.stage ? ' selected' : ''}>${s.id}. ${esc(s.name)}</option>`).join('')}</select></div>
      <div class="field"><label>Owner</label><select data-f="owner">${OWNERS.map(o => `<option${o === p.owner ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></div>
    </div>
    <div class="f3">
      <div class="field"><label>Rubric domain</label><input data-f="domain" value="${esc(p.domain)}" /></div>
      <div class="field"><label>Rubric capability</label><input data-f="capability" value="${esc(p.capability)}" /></div>
      <div class="field"><label>Execution mode</label><select data-f="execution">${EXECUTION.map(x => `<option${x === p.execution ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
    </div>
    <div class="f2">
      <div class="field"><label>Traceable to evidence</label><select data-f="traceable"><option value="true"${p.traceable ? ' selected' : ''}>Yes</option><option value="false"${!p.traceable ? ' selected' : ''}>No</option></select></div>
      <div class="field"><label>System support mapped</label><select data-f="systemsMapped"><option value="true"${p.systemsMapped ? ' selected' : ''}>Yes</option><option value="false"${!p.systemsMapped ? ' selected' : ''}>No</option></select></div>
    </div>
  </fieldset>

  <fieldset class="fieldset"><legend>Process steps · ${p.steps.length}</legend>
    <div class="steplist" id="steps">
      ${p.steps.map((s, i) => `<div class="steprow">
        <span class="idx">${i + 1}</span>
        <input data-s="${i}" data-sf="n" value="${esc(s.n)}" placeholder="Step" />
        <input data-s="${i}" data-sf="cap" value="${esc(s.cap)}" placeholder="Capability" />
        <select data-s="${i}" data-sf="exec">${EXECUTION.map(x => `<option${x === s.exec ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>
        <button class="x" data-del="${i}" aria-label="Remove step">✕</button>
      </div>`).join('') || '<div class="empty" style="padding:.75rem">No steps defined. Add the steps that make a difference — not every click.</div>'}
    </div>
    <button class="btn" id="addStep" style="margin-top:.75rem">+ Add step</button>
  </fieldset>

  <fieldset class="fieldset"><legend>Rubric classification</legend>
    <div class="f2">
      <div class="field"><label>PC · process change</label><input type="number" min="0" data-r="PC" value="${p.rubric.PC}" /></div>
      <div class="field"><label>AC · add / configure</label><input type="number" min="0" data-r="AC" value="${p.rubric.AC}" /></div>
    </div>
    <div class="f2">
      <div class="field"><label>FB · feature backlog</label><input type="number" min="0" data-r="FB" value="${p.rubric.FB}" /></div>
      <div class="field"><label>NA · not applicable</label><input type="number" min="0" data-r="NA" value="${p.rubric.NA}" /></div>
    </div>
    <div class="barrow" style="grid-template-columns:150px 1fr 64px"><span class="lb">Readiness</span><span class="track"><i style="width:${r || 0}%;background:${(r || 0) >= 75 ? 'var(--green)' : 'var(--gold)'}"></i></span><span class="vl">${r == null ? '—' : r + '%'}</span></div>
  </fieldset>

  <fieldset class="fieldset"><legend>Branch variance</legend>
    <div class="f3">${BRANCHES.map(b => `<div class="field"><label>${esc(b)}</label>
      <select data-b="${b}">${VARIANCE.map(v => `<option value="${v}"${(p.branches[b] || '') === v ? ' selected' : ''}>${v ? v[0].toUpperCase() + v.slice(1) : 'No evidence'}</option>`).join('')}</select></div>`).join('')}</div>
  </fieldset>

  <fieldset class="fieldset"><legend>Gaps &amp; local requirements · ${(p.gaps||[]).length}</legend>
    <div class="steplist">
      ${(p.gaps || []).map((g, i) => `<div class="gaprow">
        <input data-g="${i}" data-gf="what" value="${esc(g.what)}" placeholder="Describe the gap" />
        <select data-g="${i}" data-gf="type">${GAP_TYPES.map(t => `<option${t === g.type ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>
        <select data-g="${i}" data-gf="impact">${['High','Medium','Low'].map(t => `<option${t === g.impact ? ' selected' : ''}>${t}</option>`).join('')}</select>
        <select data-g="${i}" data-gf="priority">${PRIORITIES.map(t => `<option${t === g.priority ? ' selected' : ''}>${t}</option>`).join('')}</select>
        <select data-g="${i}" data-gf="owner"><option value="">Unowned</option>${GAP_OWNERS.map(o => `<option${o === g.owner ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>
        <input type="date" data-g="${i}" data-gf="target" value="${esc(g.target || '')}" />
        <button class="x" data-gdel="${i}" aria-label="Remove gap">✕</button>
      </div>`).join('') || '<div class="empty" style="padding:.75rem">No gaps logged. Separate true gaps from legitimate branch-specific requirements.</div>'}
    </div>
    <button class="btn" id="addGap" style="margin-top:.75rem">+ Log a gap</button>
  </fieldset>

  <fieldset class="fieldset"><legend>Evidence &amp; notes</legend>
    <div class="field"><label>Evidence sources</label><input data-f="evidenceStr" value="${esc((p.evidence || []).join(', '))}" placeholder="CMA1 transcript, AP procedure doc…" /></div>
    <div class="field"><label>Analyst notes</label><textarea data-f="notes">${esc(p.notes)}</textarea></div>
  </fieldset>`;

  // bindings
  $$('#dBody [data-f]').forEach(el => el.addEventListener('change', () => {
    const f = el.dataset.f;
    if (f === 'vs' || f === 'stage') sel[f] = +el.value;
    else if (f === 'traceable' || f === 'systemsMapped') sel[f] = el.value === 'true';
    else if (f === 'evidenceStr') sel.evidence = el.value.split(',').map(s => s.trim()).filter(Boolean);
    else sel[f] = el.value;
    sel.updated = today(); save(); renderDrawer();
  }));
  $$('#dBody [data-r]').forEach(el => el.addEventListener('change', () => { sel.rubric[el.dataset.r] = Math.max(0, +el.value || 0); sel.updated = today(); save(); renderDrawer(); }));
  $$('#dBody [data-b]').forEach(el => el.addEventListener('change', () => { sel.branches[el.dataset.b] = el.value; sel.updated = today(); save(); flash(); }));
  $$('#dBody [data-s]').forEach(el => el.addEventListener('change', () => { sel.steps[+el.dataset.s][el.dataset.sf] = el.value; sel.updated = today(); save(); flash(); }));
  $$('#dBody [data-del]').forEach(el => el.addEventListener('click', () => { sel.steps.splice(+el.dataset.del, 1); sel.updated = today(); save(); renderDrawer(); }));
  $('#addStep').addEventListener('click', () => { sel.steps.push({ n: '', cap: '', exec: 'Unknown' }); save(); renderDrawer(); });
  $$('#dBody [data-g]').forEach(el => el.addEventListener('change', () => { sel.gaps[+el.dataset.g][el.dataset.gf] = el.value; sel.updated = today(); save(); flash(); }));
  $$('#dBody [data-gdel]').forEach(el => el.addEventListener('click', () => { sel.gaps.splice(+el.dataset.gdel, 1); sel.updated = today(); save(); renderDrawer(); }));
  $('#addGap').addEventListener('click', () => { (sel.gaps = sel.gaps || []).push({ what: '', type: 'Process', impact: 'Medium', priority: 'P2', owner: '', target: '' }); save(); renderDrawer(); });
}
$('#dFwd').addEventListener('click', () => { if (sel && sel.stage < 8) { sel.stage++; sel.updated = today(); save(); renderDrawer(); } });
$('#dBack').addEventListener('click', () => { if (sel && sel.stage > 1) { sel.stage--; sel.updated = today(); save(); renderDrawer(); } });
$('#dDelete').addEventListener('click', () => {
  if (!sel) return;
  state.processes = state.processes.filter(p => p.id !== sel.id);
  save(); close();
});

/* ---------- new process ---------- */
$('#newBtn').addEventListener('click', () => {
  const n = state.processes.length + 1;
  const p = {
    id: 'P-' + String(n).padStart(2, '0') + (state.processes.some(x => x.id === 'P-' + String(n).padStart(2, '0')) ? 'a' : ''),
    name: 'New process', vs: 0, l2: 'Unassigned', capability: 'Unmapped', domain: 'Unmapped',
    owner: OWNERS[0], stage: 1, trigger: '', outcome: '', roles: '', controls: '', exceptions: '', systems: '', notes: '',
    execution: 'Unknown', steps: [], evidence: [], rubric: { PC: 0, AC: 0, FB: 0, NA: 0 }, branches: {},
    systemsMapped: false, traceable: false, vsTag: 'Unassigned', gaps: [], updated: today()
  };
  state.processes.push(p); save(); go('register'); open(p.id);
});

/* ---------- export ---------- */
$('#exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), valueStreams: VALUE_STREAMS, stages: STAGES, ...state }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'associa-process-architecture.json';
  a.click(); URL.revokeObjectURL(a.href);
});

$('#importBtn').addEventListener('click', () => $('#importFile').click());
$('#importFile').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result);
      if (d.processes) state.processes = d.processes;
      if (d.sessions) state.sessions = d.sessions;
      if (d.decisions) state.decisions = d.decisions;
      edits = 0; $('#lastsave').textContent = 'Snapshot loaded from ' + f.name;
      render();
    } catch (err) { $('#lastsave').textContent = 'Could not read that file'; }
  };
  rd.readAsText(f);
  e.target.value = '';
});

render();


/* ================= STAGE ATLAS ================= */
function renderAtlas() {
  const P = state.processes;
  $('#strip').innerHTML = STAGES.map((s, i) => `
    <button class="scard${guide.i === i && guide.on ? ' lit' : ''}" data-stage="${s.id}" style="--sc:${s.color}">
      <span class="num" style="background:${s.color}">${s.id}</span>
      <b>${esc(s.name)}</b>
      <span class="sd">${esc(s.sub)}</span>
      <span class="sn">${P.filter(p => p.stage === s.id).length} process${P.filter(p => p.stage === s.id).length === 1 ? '' : 'es'}</span>
    </button>${i < STAGES.length - 1 ? '<span class="arw">→</span>' : ''}`).join('');
  $$('#strip .scard').forEach(b => b.addEventListener('click', () => {
    const el = $('#stage-' + b.dataset.stage);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('pulse'); setTimeout(() => el.classList.remove('pulse'), 1200); }
  }));

  $('#stagegrid').innerHTML = STAGES.map(s => {
    const inStage = P.filter(p => p.stage === s.id);
    const gaps = inStage.reduce((n, p) => n + (p.gaps || []).length, 0);
    return `<article class="stagecard" id="stage-${s.id}" style="--sc:${s.color}">
      <header><span class="num" style="background:${s.color}">${s.id}</span>
        <div><h3>${esc(s.name)}</h3><p>${esc(s.sub)}</p></div></header>
      <div class="sbox"><span class="lb">Process definition</span><p>${esc(s.def)}</p></div>
      <div class="sbox"><span class="lb">Key outputs</span><p>${esc(s.out)}</p></div>
      <div class="sfoot">
        <span class="stat"><b>${inStage.length}</b> process${inStage.length === 1 ? '' : 'es'} here</span>
        <span class="stat"><b>${gaps}</b> open gap${gaps === 1 ? '' : 's'}</span>
        <button class="linkbtn" data-jump="${s.id}">Open in register →</button>
      </div>
      ${inStage.length ? `<div class="schips">${inStage.map(p => `<button class="chip" data-open="${p.id}">${esc(p.id)} · ${esc(p.name)}</button>`).join('')}</div>` : ''}
    </article>`;
  }).join('');
  $$('#stagegrid [data-jump]').forEach(b => b.addEventListener('click', () => { $('#fstage').value = b.dataset.jump; go('register'); }));
  $$('#stagegrid [data-open]').forEach(b => b.addEventListener('click', () => open(b.dataset.open)));
}

/* guided walkthrough */
const guide = { on: false, i: 0, t: null, playing: true };
function guideRender() {
  $('#guidebar').hidden = !guide.on;
  $('#guideExit').hidden = !guide.on;
  $('#guideBtn').hidden = guide.on;
  if (!guide.on) { renderAtlas(); return; }
  const s = STAGES[guide.i];
  $('#gCount').textContent = (guide.i + 1) + '/' + STAGES.length;
  $('#gCount').style.background = s.color;
  $('#gName').textContent = s.name;
  $('#gSub').textContent = s.sub;
  $('#gPause').textContent = guide.playing ? '❚❚ Pause' : '▶ Play';
  renderAtlas();
  const el = $('#stage-' + s.id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function guideTick() {
  clearInterval(guide.t);
  if (guide.on && guide.playing) guide.t = setInterval(() => { guide.i = (guide.i + 1) % STAGES.length; guideRender(); }, 6000);
}
$('#guideBtn').addEventListener('click', () => { guide.on = true; guide.i = 0; guide.playing = true; guideRender(); guideTick(); });
$('#guideExit').addEventListener('click', () => { guide.on = false; clearInterval(guide.t); guideRender(); });
$('#gNext').addEventListener('click', () => { guide.i = (guide.i + 1) % STAGES.length; guideRender(); guideTick(); });
$('#gPrev').addEventListener('click', () => { guide.i = (guide.i - 1 + STAGES.length) % STAGES.length; guideRender(); guideTick(); });
$('#gPause').addEventListener('click', () => { guide.playing = !guide.playing; guideRender(); guideTick(); });

/* ================= GAP REGISTER ================= */
function allGaps() {
  const out = [];
  state.processes.forEach(p => (p.gaps || []).forEach((g, idx) => out.push({ ...g, pid: p.id, pname: p.name, vs: p.vs, stage: p.stage, idx })));
  return out;
}
fillSelect($('#gType'), GAP_TYPES.map(t => [t, t]), 'All gap types');
fillSelect($('#gPrio'), PRIORITIES.map(t => [t, t]), 'All priorities');
fillSelect($('#gvs'), VALUE_STREAMS.filter(v => v.id).map(v => [v.id, v.code + ' · ' + v.name]), 'All value streams');
['#gType', '#gPrio', '#gvs', '#gOwn'].forEach(sel => $(sel).addEventListener('change', renderGaps));

function renderGaps() {
  let rows = allGaps();
  const ty = $('#gType').value, pr = $('#gPrio').value, vs = $('#gvs').value, ow = $('#gOwn').value;
  const total = rows.length;
  const trueGaps = rows.filter(g => g.type !== 'Local requirement').length;
  const p0 = rows.filter(g => g.priority === 'P0').length;
  const unowned = rows.filter(g => !g.owner).length;
  $('#gapKpis').innerHTML = [
    ['Gaps logged', total, 'across ' + state.processes.filter(p => (p.gaps || []).length).length + ' processes', ''],
    ['True gaps', trueGaps, (total - trueGaps) + ' are legitimate local requirements', 'ok'],
    ['P0 priority', p0, 'blocking the transition plan', 'bad'],
    ['Unowned', unowned, 'need an accountable owner', unowned ? 'bad' : 'ok']
  ].map(([l, v, s, c]) => `<div class="kpi"><span class="k">${l}</span><b>${v}</b><span class="s ${c}">${s}</span></div>`).join('');

  if (ty) rows = rows.filter(g => g.type === ty);
  if (pr) rows = rows.filter(g => g.priority === pr);
  if (vs) rows = rows.filter(g => String(g.vs) === vs);
  if (ow === 'unowned') rows = rows.filter(g => !g.owner);
  if (ow === 'notarget') rows = rows.filter(g => !g.target);
  rows.sort((a, b) => a.priority.localeCompare(b.priority) || a.pid.localeCompare(b.pid));

  $('#gapCount').textContent = rows.length + ' of ' + total + ' gaps';
  const vsOf = id => VALUE_STREAMS.find(v => v.id === id) || VALUE_STREAMS[0];
  $('#gapBody').innerHTML = rows.map(g => `<tr>
    <td><div class="pn">${esc(g.what)}</div><div class="ps">${esc(stageOf(g.stage).name)}</div></td>
    <td><button class="linkbtn" data-open="${g.pid}">${esc(g.pid)} · ${esc(g.pname)}</button></td>
    <td><span class="vspill v${g.vs}">${esc(vsOf(g.vs).code)}</span></td>
    <td><span class="tag ${g.type === 'Local requirement' ? 'neutral' : ''}">${esc(g.type)}</span></td>
    <td>${esc(g.impact)}</td>
    <td><span class="prio p${g.priority}">${esc(g.priority)}</span></td>
    <td>${g.owner ? esc(g.owner) : '<span class="muted">unowned</span>'}</td>
    <td class="n">${g.target ? esc(g.target) : '<span class="muted">—</span>'}</td>
  </tr>`).join('') || '<tr><td colspan="8"><div class="empty">No gaps match these filters.</div></td></tr>';
  $$('#gapBody [data-open]').forEach(b => b.addEventListener('click', () => open(b.dataset.open)));
}
