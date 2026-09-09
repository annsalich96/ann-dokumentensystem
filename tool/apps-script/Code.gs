/**
 * ann architecture — Dokumenten-System
 * Backend-Layer (Phase 1): Google Apps Script Web App über »Project Management NEW«.
 * Nur LESEND. Liefert JSON für das Stundennachweis-Tool und für KI-Agenten.
 *
 * Deploy: siehe README.md in diesem Ordner.
 */

const CONFIG = {
  SHEET_ID: '14WcYfxy5oFoArQh3dWz2zNeP5lFLMlkyMxunm3b-SHI',   // Project Management NEW
  TZ: 'Europe/Berlin',                                        // Ausgabe-Zeitzone (Mappe steht auf America/LA)
  TABS: {
    timeTracking:        'TimeTracking',          // Tageskopf: Record_ID, Date, User
    timeTrackingRecords: 'TimeTrackingRecords',   // Buchung:   Tracker_ID, Project_ID, Spent Time, ...
    projects:            'Projects',
    services:            'Services',
    tasks:               'Tasks',
    subTasks:            'Sub Tasks',
    users:               'Users',
    companyInfo:         'Company Info'
  }
};

/* ------------------------------------------------------------------ */
/*  Router                                                            */
/* ------------------------------------------------------------------ */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'ping';
  try {
    let data;
    switch (action) {
      case 'ping':           data = { ok: true, ts: new Date().toISOString() }; break;
      case 'getProjects':    data = getProjects(); break;
      case 'getCompanyInfo': data = getCompanyInfo(); break;
      case 'getTimeRecords': data = getTimeRecords({
                               project: e.parameter.project || '',
                               from:    e.parameter.from || '',
                               to:      e.parameter.to || '',
                               user:    e.parameter.user || ''
                             }); break;
      default: return json({ error: 'unknown action: ' + action }, 400);
    }
    return json({ ok: true, action: action, data: data });
  } catch (err) {
    return json({ ok: false, action: action, error: String(err && err.message || err) }, 500);
  }
}

/* ------------------------------------------------------------------ */
/*  Endpunkte                                                         */
/* ------------------------------------------------------------------ */

/** Alle Projekte: [{ id, name, client, billable }] — sortiert nach Name. */
function getProjects() {
  return rows_(CONFIG.TABS.projects)
    .map(function (r) {
      return {
        id:       str_(r['Project_ID']),
        name:     str_(r['Project Name']) || str_(r['Project_ID']),
        client:   str_(r['Client']),
        billable: truthy_(r['Billable'])
      };
    })
    .filter(function (p) { return p.id; })
    .sort(function (a, b) { return a.name.localeCompare(b.name, 'de'); });
}

/** Büroprofil für den Footer. */
function getCompanyInfo() {
  const r = rows_(CONFIG.TABS.companyInfo)[0] || {};
  return {
    name:    str_(r['Company Name']),
    address: str_(r['Company Adress']),
    vat:     str_(r['Company VAT Number']),
    phone:   str_(r['Company Telefon']),
    email:   str_(r['Company Email'])
  };
}

/**
 * Zeiteinträge eines Projekts im Zeitraum.
 * @param {{project:string, from:string, to:string, user?:string}} q  Datumsangaben yyyy-mm-dd.
 * @return {{items:Array, total:number, unresolved:number}}
 *   items: [{ datum:'yyyy-mm-dd', taetigkeit, bearbeiter, stunden, recordId, quelle }]
 */
function getTimeRecords(q) {
  if (!q.project) throw new Error('project fehlt');

  const fromD = q.from ? parseISO_(q.from) : null;
  const toD   = q.to   ? parseISO_(q.to)   : null;

  // Nachschlage-Tabellen
  const trackerById = indexBy_(rows_(CONFIG.TABS.timeTracking), 'Record_ID');
  const userByEmail = indexBy_(rows_(CONFIG.TABS.users), 'Email');
  const subById     = indexBy_(rows_(CONFIG.TABS.subTasks), 'Sub_Task_ID');
  const taskById    = indexBy_(rows_(CONFIG.TABS.tasks), 'Task_ID');
  const svcById     = indexBy_(rows_(CONFIG.TABS.services), 'Service_ID');

  const projKey = normKey_(q.project);
  const userKey = q.user ? normKey_(q.user) : '';

  const items = [];
  let unresolved = 0;

  rows_(CONFIG.TABS.timeTrackingRecords).forEach(function (rec) {
    // 1) Projektfilter (exakter ID-/Namensvergleich, nicht unscharf)
    if (normKey_(rec['Project_ID']) !== projKey) return;

    // 2) Tageskopf über Tracker_ID auflösen (Datum + Mitarbeiter kommen von dort)
    const head = trackerById[str_(rec['Tracker_ID'])] || {};
    let dateVal = head['Date'];
    if (!dateVal && rec['Record Date']) dateVal = rec['Record Date']; // Hilfsspalte als Fallback
    const dateObj = toDate_(dateVal);
    if (!dateObj) { unresolved++; return; }

    // 3) Zeitraumfilter (lokales Kalenderdatum)
    if (fromD && dateObj < fromD) return;
    if (toD   && dateObj > toD)   return;

    // 4) Mitarbeiter
    const email = str_(head['User']) || str_(rec['User']);
    const u = userByEmail[email] || {};
    const bearbeiter = str_(u['Name']) || email || '—';
    if (userKey && normKey_(email) !== userKey && normKey_(bearbeiter) !== userKey) return;

    // 5) Tätigkeitsbezeichnung: Sub-Task -> Task -> Leistung  (Reihenfolge noch fachlich zu bestätigen)
    let taetigkeit = '', quelle = '';
    const sub = subById[str_(rec['Sub_Task_ID'])];
    const tsk = taskById[str_(rec['Task_ID'])];
    const svc = svcById[str_(rec['Service_ID'])];
    if (sub && str_(sub['Sub Task'])) { taetigkeit = str_(sub['Sub Task']); quelle = 'subtask'; }
    else if (tsk && str_(tsk['Task'])) { taetigkeit = str_(tsk['Task']); quelle = 'task'; }
    else if (svc && str_(svc['Service'])) { taetigkeit = str_(svc['Service']); quelle = 'service'; }
    else { taetigkeit = ''; quelle = 'none'; unresolved++; }

    const stunden = num_(rec['Spent Time']);

    items.push({
      datum:      Utilities.formatDate(dateObj, CONFIG.TZ, 'yyyy-MM-dd'),
      taetigkeit: taetigkeit,
      bearbeiter: bearbeiter,
      stunden:    stunden,
      recordId:   str_(rec['Record_ID']),
      quelle:     quelle
    });
  });

  // chronologisch; Gruppierung/Zusammenfassung bewusst NICHT hier (offene Dokumentregel)
  items.sort(function (a, b) {
    return a.datum === b.datum ? a.bearbeiter.localeCompare(b.bearbeiter) : a.datum.localeCompare(b.datum);
  });

  const total = items.reduce(function (s, it) { return s + (it.stunden || 0); }, 0);
  return { items: items, total: Math.round(total * 100) / 100, unresolved: unresolved };
}

/* ------------------------------------------------------------------ */
/*  Helfer                                                            */
/* ------------------------------------------------------------------ */
function ss_()            { return SpreadsheetApp.openById(CONFIG.SHEET_ID); }
function json(obj, code)  { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

/** Tab -> Array von Objekten (erste Zeile = Spaltenköpfe). */
function rows_(tabName) {
  const sh = ss_().getSheetByName(tabName);
  if (!sh) throw new Error('Tab nicht gefunden: ' + tabName);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const head = values[0].map(function (h) { return String(h).trim(); });
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row.every(function (c) { return c === '' || c === null; })) continue;
    const o = {};
    for (let j = 0; j < head.length; j++) if (head[j]) o[head[j]] = row[j];
    out.push(o);
  }
  return out;
}

function indexBy_(arr, key) {
  const m = {};
  arr.forEach(function (o) { const k = str_(o[key]); if (k) m[k] = o; });
  return m;
}

function str_(v)    { return v == null ? '' : String(v).trim(); }
function num_(v)    { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? 0 : n; }
function truthy_(v) { const s = String(v).trim().toLowerCase(); return s === 'true' || s === 'yes' || s === 'ja' || s === '1'; }
function normKey_(v){ return str_(v).toLowerCase().replace(/\s+/g, ' '); }

function parseISO_(s) {           // 'yyyy-mm-dd' -> Date (lokale Mitternacht)
  const p = String(s).split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}
function toDate_(v) {
  if (v instanceof Date && !isNaN(v)) return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  if (typeof v === 'number' && v > 0) {           // Sheets-Seriennummer
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }
  const s = str_(v);
  if (!s) return null;
  let m = s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{2,4})$/);   // TT.MM.JJJJ oder MM/TT/JJJJ
  if (m) {
    let a = +m[1], b = +m[2], y = +m[3]; if (y < 100) y += 2000;
    // US-Mappe: MM/TT/JJJJ; deutsche Eingabe: TT.MM.JJJJ  -> heuristisch
    const isDot = s.indexOf('.') > -1;
    const day = isDot ? a : b, mon = isDot ? b : a;
    return new Date(y, mon - 1, day);
  }
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(s);
  return isNaN(d) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
