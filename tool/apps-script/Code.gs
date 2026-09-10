/**
 * ann architecture — Dokumenten-System
 * Backend-Layer (Phase 1): Google Apps Script Web App über »Project Management NEW«.
 * Die Tabelle wird NUR GELESEN. Für die Textaufbereitung ruft das Skript zusätzlich
 * einen KI-Anbieter (OpenAI oder Anthropic, Key in den Script-Properties) — kein
 * Schreibzugriff auf das Sheet.
 *
 * Endpunkte (GET, ?action=…):
 *   ping
 *   getFilterTree                          -> Projekte/Phasen/Leistungen, die Buchungen haben
 *   getCompanyInfo
 *   getProjectMeta&project=…[&phase=…]     -> Stammdaten eines Projekts (Name, Adresse, …)
 *   getTimeRecords&project=…&phase=…&service=…&from=YYYY-MM-DD&to=YYYY-MM-DD&user=…
 *   cleanDescriptions&items=<JSON>[&project=…&phase=…]  -> KI-bereinigte Tätigkeitstexte
 *
 * Script-Properties für cleanDescriptions:
 *   AI_PROVIDER        optional: 'openai' (Standard) oder 'anthropic'
 *   OPENAI_API_KEY     nötig bei openai   ·  OPENAI_MODEL     optional, Standard: gpt-4.1-mini
 *   ANTHROPIC_API_KEY  nötig bei anthropic ·  ANTHROPIC_MODEL optional, Standard: claude-sonnet-5
 *
 * Deploy: siehe README.md in diesem Ordner.
 */

const CONFIG = {
  SHEET_ID: '14WcYfxy5oFoArQh3dWz2zNeP5lFLMlkyMxunm3b-SHI',   // Project Management NEW
  TZ: 'Europe/Berlin',
  TABS: {
    timeTracking:        'TimeTracking',
    timeTrackingRecords: 'TimeTrackingRecords',
    projects:            'Projects',
    projectPhases:       'Project Phases',
    phases:              'Phases',
    services:            'Services',
    tasks:               'Tasks',
    subTasks:            'Sub Tasks',
    users:               'Users',
    clients:             'Clients',
    companyInfo:         'Company Info'
  }
};

/* ------------------------------------------------------------------ */
function doGet(e){
  const p = (e && e.parameter) || {};
  const action = p.action || 'ping';
  let out;
  try{
    let data;
    switch(action){
      case 'ping':          data = { ts:new Date().toISOString() }; break;
      case 'getFilterTree': data = getFilterTreeCached(p.fresh === '1'); break;
      case 'getCompanyInfo':data = getCompanyInfo(); break;
      case 'getProjectMeta':data = getProjectMeta(p.project || '', p.phase || ''); break;
      case 'cleanDescriptions': data = cleanDescriptions(p); break;
      case 'getTimeRecords':data = getTimeRecords({
                              project:p.project || '', phase:p.phase || '', service:p.service || '',
                              from:p.from || '', to:p.to || '', user:p.user || ''
                            }); break;
      default: out = { ok:false, action:action, error:'unknown action: '+action };
    }
    if(!out) out = { ok:true, action:action, data:data };
  }catch(err){
    out = { ok:false, action:action, error:String(err && err.message || err) };
  }
  return reply(out, p.callback);   // JSONP wenn ?callback= gesetzt (umgeht CORS im Browser)
}
function reply(obj, callback){
  const body = JSON.stringify(obj);
  if(callback && /^[\w.$]+$/.test(callback)){
    return ContentService.createTextOutput(callback + '(' + body + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}

/* Filter-Baum ändert sich selten -> 10 min im Script-Cache halten (spart die
   schweren Sheet-Reads bei jedem Tool-Aufruf). ?fresh=1 erzwingt Neuaufbau. */
function getFilterTreeCached(fresh){
  const cache = CacheService.getScriptCache();
  if(!fresh){
    const hit = cache.get('filterTree');
    if(hit) return JSON.parse(hit);
  }
  const data = getFilterTree();
  try{ cache.put('filterTree', JSON.stringify(data), 600); }catch(_){ /* >100KB -> nicht cachen */ }
  return data;
}

/* ------------------------------------------------------------------ */
/*  Filter-Baum: nur Projekte/Phasen/Leistungen, für die es Buchungen gibt  */
/* ------------------------------------------------------------------ */
function getFilterTree(){
  const projByName = indexBy_(rows_(CONFIG.TABS.projects), 'Project_ID');
  const svcById    = indexBy_(rows_(CONFIG.TABS.services), 'Service_ID');

  const projects = {};   // pKey -> { id, name, phases: { phKey -> { id, name, services: { sKey -> {id,name} } } } }

  rows_(CONFIG.TABS.timeTrackingRecords).forEach(function(rec){
    const pId = str_(rec['Project_ID']);   if(!pId) return;
    const phId = str_(rec['Phase_ID']);
    const sId  = str_(rec['Service_ID']);

    if(!projects[pId]){
      const pr = projByName[pId] || {};
      projects[pId] = { id:pId, name: str_(pr['Project Name']) || pId, phases:{} };
    }
    const P = projects[pId];

    const phKey = phId || '—';
    if(!P.phases[phKey]) P.phases[phKey] = { id:phId, name: phId ? phaseLabel_(phId) : '(ohne Phase)', services:{} };
    const PH = P.phases[phKey];

    if(sId){
      if(!PH.services[sId]){
        const sv = svcById[sId] || {};
        PH.services[sId] = { id:sId, name: str_(sv['Service']) || sId };
      }
    }
  });

  // -> Arrays, sortiert
  const out = Object.keys(projects).sort(cmpDe_).map(function(pKey){
    const P = projects[pKey];
    return {
      id:P.id, name:P.name,
      phases: Object.keys(P.phases).sort(cmpDe_).map(function(phKey){
        const PH = P.phases[phKey];
        return {
          id:PH.id, name:PH.name,
          services: Object.keys(PH.services).sort(function(a,b){ return cmpDe_(PH.services[a].name, PH.services[b].name); })
                      .map(function(sKey){ return PH.services[sKey]; })
        };
      })
    };
  });
  return { projects: out };
}

/* ------------------------------------------------------------------ */
function getCompanyInfo(){
  const r = rows_(CONFIG.TABS.companyInfo)[0] || {};
  return {
    name:    str_(r['Company Name']),
    address: str_(r['Company Adress']),
    vat:     str_(r['Company VAT Number']),
    phone:   str_(r['Company Telefon']),
    email:   str_(r['Company Email'])
  };
}

/* ------------------------------------------------------------------ */
/*  Projekt-Stammdaten (für die Autofüllung im Stundennachweis-Tool)  */
/* ------------------------------------------------------------------ */
function getProjectMeta(projectId, phaseId){
  if(!projectId) throw new Error('project fehlt');
  const pr = indexBy_(rows_(CONFIG.TABS.projects), 'Project_ID')[projectId] || {};
  const cl = indexBy_(rowsSafe_(CONFIG.TABS.clients), 'Client_ID')[str_(pr['Client'])] || {};
  return {
    id:          projectId,
    name:        str_(pr['Project Name']) || projectId,
    address:     str_(pr['Address']),
    description: str_(pr['Description']),
    client:      str_(cl['Client Name']) || str_(pr['Client']),
    billName:    str_(pr['Bill Name']),
    billAddress: str_(pr['Bill Address']),
    timeline:    str_(pr['Timeline']),
    startDate:   str_(pr['Project StartDate']),
    endDate:     str_(pr['Project EndDate']),
    status:      str_(pr['Status']),
    responsible: str_(pr['Responsible']),
    phase:       phaseId ? phaseLabel_(phaseId) : ''
  };
}

/* "LP 05-KANT CENTER" / "Phase 05-…" -> "LP 05 — Ausführungsplanung" (aus Tab `Phases`).
   Fällt bei fehlendem Tab / Treffer immer auf den Rohwert zurück. */
function phaseLabel_(phaseId){
  const s = str_(phaseId); if(!s) return '';
  const m = s.match(/^(?:LP|Phase)\s*0*(\d+)/i);
  if(!m) return s;
  const code = 'LP ' + (m[1].length < 2 ? '0' + m[1] : m[1]);
  const row = indexBy_(rowsSafe_(CONFIG.TABS.phases), 'Phase_ID')[code];
  return (row && str_(row['Phase Name'])) ? code + ' — ' + str_(row['Phase Name']) : s;
}

/* ------------------------------------------------------------------ */
/*  KI: Tätigkeitsbeschreibungen für den Stundennachweis aufbereiten  */
/*  Ruft OpenAI oder Anthropic (Key in den Script-Properties).        */
/*  Kein Schreibzugriff auf die Tabelle.                              */
/* ------------------------------------------------------------------ */
function cleanDescriptions(p){
  var items;
  try{ items = JSON.parse(p.items || '[]'); }catch(e){ throw new Error('items ist kein gültiges JSON'); }
  if(!Array.isArray(items) || !items.length) return { items: [] };

  var props = PropertiesService.getScriptProperties();
  var provider = (props.getProperty('AI_PROVIDER') || 'openai').toLowerCase();
  var maxTok = Math.min(4096, 300 + items.length * 90);
  var maxChars = parseInt(p.maxChars, 10); if(isNaN(maxChars) || maxChars < 10) maxChars = 0;

  var sys =
    'Du redigierst Tätigkeitsbeschreibungen für den Stundennachweis eines Architektur- und Innenarchitekturbüros.\n' +
    'Wandle jeden Eintrag in knappes, professionelles Deutsch um, wie es in einem Stundennachweis an einen Auftraggeber steht.\n' +
    'Regeln:\n' +
    '- Deutsch, Nominalstil, sachlich. Keine Ich-Form, keine Anrede, keine Füllwörter, kein Datum, keine Uhrzeit, keine Personennamen.\n' +
    '- Nichts erfinden. Nur sprachlich glätten und präzisieren; Bedeutung erhalten.\n' +
    (maxChars ? '- HARTE LÄNGENGRENZE: jede Beschreibung höchstens ' + maxChars + ' Zeichen inklusive Leerzeichen. Lieber knapper und mit gängigen Abkürzungen (z. B. „Abstimmung“ statt „Abstimmung und Koordination“) als überschreiten; die Kernaussage muss erhalten bleiben.\n'
              : '- Länge ähnlich wie das Original.\n') +
    '- Architektur-/HOAI-Vokabular verwenden, wenn es eindeutig passt (z. B. Ausführungsplanung, Detail, Abstimmung, Koordination, Aufmaß, Bemusterung, Leistungsverzeichnis).\n' +
    '- Einheitliche Terminologie über alle Einträge.\n' +
    '- Leere oder unverständliche Einträge unverändert zurückgeben.\n' +
    'Antworte AUSSCHLIESSLICH mit JSON, exakt: {"items":[{"i":<zahl>,"text":"<bereinigt>"}]} — gleiche i-Werte wie in der Eingabe, kein Markdown, keine Erklärung.';

  var userText = 'Eingabe:\n' + JSON.stringify({ projekt: str_(p.project), phase: str_(p.phase), eintraege: items });

  var raw = (provider === 'anthropic')
    ? aiAnthropic_(props, sys, userText, maxTok)
    : aiOpenAI_(props, sys, userText, maxTok);

  var parsed = parseModelJson_(raw);
  if(!parsed || !parsed.items) throw new Error('KI-Antwort nicht lesbar');

  var clean = parsed.items
    .map(function(o){ return { i: Number(o.i), text: str_(o.text) }; })
    .filter(function(o){ return !isNaN(o.i); });
  return { items: clean };
}

function aiOpenAI_(props, sys, userText, maxTok){
  var key = props.getProperty('OPENAI_API_KEY');
  if(!key) throw new Error('OPENAI_API_KEY fehlt in den Script-Properties');
  var model = props.getProperty('OPENAI_MODEL') || 'gpt-4.1-mini';
  var res = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + key },
    payload: JSON.stringify({
      model: model,
      messages: [{ role: 'system', content: sys }, { role: 'user', content: userText }],
      response_format: { type: 'json_object' },
      max_completion_tokens: maxTok
    })
  });
  var code = res.getResponseCode(), txt = res.getContentText();
  if(code !== 200) throw new Error('OpenAI ' + code + ': ' + txt.slice(0, 300));
  var data = JSON.parse(txt);
  return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
}

function aiAnthropic_(props, sys, userText, maxTok){
  var key = props.getProperty('ANTHROPIC_API_KEY');
  if(!key) throw new Error('ANTHROPIC_API_KEY fehlt in den Script-Properties');
  var model = props.getProperty('ANTHROPIC_MODEL') || 'claude-sonnet-5';
  var res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({
      model: model, max_tokens: maxTok,
      system: sys, messages: [{ role: 'user', content: userText }]
    })
  });
  var code = res.getResponseCode(), txt = res.getContentText();
  if(code !== 200) throw new Error('Anthropic ' + code + ': ' + txt.slice(0, 300));
  var data = JSON.parse(txt);
  return (data.content && data.content[0] && data.content[0].text) || '';
}

function parseModelJson_(s){
  s = String(s || '').trim();
  try{ return JSON.parse(s); }catch(e){}
  var a = s.indexOf('{'), b = s.lastIndexOf('}');
  if(a > -1 && b > a){ try{ return JSON.parse(s.slice(a, b + 1)); }catch(e){} }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Zeiteinträge                                                      */
/* ------------------------------------------------------------------ */
function getTimeRecords(q){
  if(!q.project && !q.phase && !q.service) throw new Error('mindestens project, phase oder service angeben');

  const fromD = q.from ? parseISO_(q.from) : null;
  const toD   = q.to   ? parseISO_(q.to)   : null;

  const trackerById = indexBy_(rows_(CONFIG.TABS.timeTracking), 'Record_ID');
  const userByEmail = indexBy_(rows_(CONFIG.TABS.users), 'Email');
  const subById     = indexBy_(rows_(CONFIG.TABS.subTasks), 'Sub_Task_ID');
  const taskById    = indexBy_(rows_(CONFIG.TABS.tasks), 'Task_ID');
  const svcById     = indexBy_(rows_(CONFIG.TABS.services), 'Service_ID');

  const kProj = q.project ? normKey_(q.project) : '';
  const kPh   = q.phase   ? normKey_(q.phase)   : '';
  const kSvc  = q.service ? normKey_(q.service) : '';
  const kUser = q.user    ? normKey_(q.user)    : '';

  const items = []; let unresolved = 0;

  rows_(CONFIG.TABS.timeTrackingRecords).forEach(function(rec){
    if(kProj && normKey_(rec['Project_ID']) !== kProj) return;
    if(kPh   && normKey_(rec['Phase_ID'])   !== kPh)   return;
    if(kSvc  && normKey_(rec['Service_ID']) !== kSvc)  return;

    const head = trackerById[str_(rec['Tracker_ID'])] || {};
    let dv = head['Date']; if(!dv && rec['Record Date']) dv = rec['Record Date'];
    const d = toDate_(dv);
    if(!d){ unresolved++; return; }
    if(fromD && d < fromD) return;
    if(toD   && d > toD)   return;

    const email = str_(head['User']) || str_(rec['User']);
    const u = userByEmail[email] || {};
    const bearbeiter = str_(u['Name']) || email || '—';
    if(kUser && normKey_(email) !== kUser && normKey_(bearbeiter) !== kUser) return;

    let taetigkeit = '', quelle = '';
    const sub = subById[str_(rec['Sub_Task_ID'])];
    const tsk = taskById[str_(rec['Task_ID'])];
    const svc = svcById[str_(rec['Service_ID'])];
    if(sub && str_(sub['Sub Task'])){ taetigkeit = str_(sub['Sub Task']); quelle='subtask'; }
    else if(tsk && str_(tsk['Task'])){ taetigkeit = str_(tsk['Task']); quelle='task'; }
    else if(svc && str_(svc['Service'])){ taetigkeit = str_(svc['Service']); quelle='service'; }
    else { quelle='none'; unresolved++; }

    items.push({
      datum:      Utilities.formatDate(d, CONFIG.TZ, 'yyyy-MM-dd'),
      taetigkeit: taetigkeit,
      bearbeiter: bearbeiter,
      stunden:    num_(rec['Spent Time']),
      recordId:   str_(rec['Record_ID']),
      quelle:     quelle
    });
  });

  items.sort(function(a,b){ return a.datum === b.datum ? a.bearbeiter.localeCompare(b.bearbeiter) : a.datum.localeCompare(b.datum); });
  const total = items.reduce(function(s,it){ return s + (it.stunden||0); }, 0);
  return { items:items, total:Math.round(total*100)/100, unresolved:unresolved };
}

/* ------------------------------------------------------------------ */
/*  Tests — im Editor per „Ausführen" aufrufbar, Ergebnis unter „Ausführungsprotokoll".
    Umgehen die Bereitstellung komplett: zeigen, ob der CODE stimmt.                 */
/* ------------------------------------------------------------------ */
function TEST_getProjectMeta(){
  Logger.log(JSON.stringify(getProjectMeta('ANDERMATT HOTEL', ''), null, 2));
}
function TEST_cleanDescriptions(){
  Logger.log(JSON.stringify(cleanDescriptions({
    items: JSON.stringify([{ i:0, text:'preparing 3d model and fixing doors kant parkhaus' }])
  }), null, 2));
}
function TEST_props(){
  var p = PropertiesService.getScriptProperties().getProperties();
  Logger.log('AI_PROVIDER=' + (p.AI_PROVIDER || '(leer -> openai)'));
  Logger.log('OPENAI_API_KEY ' + (p.OPENAI_API_KEY ? 'gesetzt (' + p.OPENAI_API_KEY.length + ' Zeichen)' : 'FEHLT'));
  Logger.log('OPENAI_MODEL=' + (p.OPENAI_MODEL || '(leer -> gpt-4.1-mini)'));
}

/* ------------------------------------------------------------------ */
/*  Helfer                                                            */
/* ------------------------------------------------------------------ */
function ss_(){ return SpreadsheetApp.openById(CONFIG.SHEET_ID); }

var _rowsMemo = {};                 // pro Ausführung: jedes Tab nur einmal lesen
function rows_(tab){
  if(_rowsMemo[tab]) return _rowsMemo[tab];
  const sh = ss_().getSheetByName(tab);
  if(!sh) throw new Error('Tab nicht gefunden: '+tab);
  const v = sh.getDataRange().getValues();
  if(v.length < 2){ return (_rowsMemo[tab] = []); }
  const head = v[0].map(function(h){ return String(h).trim(); });
  const out = [];
  for(let i=1;i<v.length;i++){
    if(v[i].every(function(c){ return c === '' || c === null; })) continue;
    const o = {};
    for(let j=0;j<head.length;j++) if(head[j]) o[head[j]] = v[i][j];
    out.push(o);
  }
  return (_rowsMemo[tab] = out);
}
function rowsSafe_(tab){ try{ return rows_(tab); }catch(e){ return []; } }   // fehlender Tab -> [] statt Fehler
function indexBy_(arr, key){ const m={}; arr.forEach(function(o){ const k=str_(o[key]); if(k) m[k]=o; }); return m; }
function str_(v){ return v==null ? '' : String(v).trim(); }
function num_(v){ const n=parseFloat(String(v).replace(',', '.')); return isNaN(n)?0:n; }
function normKey_(v){ return str_(v).toLowerCase().replace(/\s+/g,' '); }
function cmpDe_(a,b){ return String(a).localeCompare(String(b), 'de'); }
function parseISO_(s){ const p=String(s).split('-'); return new Date(+p[0], +p[1]-1, +p[2]); }
function toDate_(v){
  if(v instanceof Date && !isNaN(v)) return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  if(typeof v === 'number' && v > 0){ const d=new Date(Math.round((v-25569)*86400*1000)); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); }
  const s = str_(v); if(!s) return null;
  let m = s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{2,4})$/);
  if(m){ let a=+m[1], b=+m[2], y=+m[3]; if(y<100) y+=2000; const isDot = s.indexOf('.')>-1; return new Date(y, (isDot?b:a)-1, isDot?a:b); }
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if(m) return new Date(+m[1], +m[2]-1, +m[3]);
  const d = new Date(s); return isNaN(d) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
