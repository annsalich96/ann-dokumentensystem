/**
 * ann architecture — Dokumenten-System
 * Backend-Layer (Phase 1): Google Apps Script Web App über »Project Management NEW«.
 * NUR LESEND. Liefert JSON für das Stundennachweis-Tool und für KI-Agenten.
 *
 * Endpunkte (GET, ?action=…):
 *   ping
 *   getFilterTree                          -> Projekte/Phasen/Leistungen, die Buchungen haben
 *   getCompanyInfo
 *   getTimeRecords&project=…&phase=…&service=…&from=YYYY-MM-DD&to=YYYY-MM-DD&user=…
 *
 * Deploy: siehe README.md in diesem Ordner.
 */

// Optionaler Zugriffsschutz: langen Zufallswert eintragen und im Tool (SHEET_TOKEN)
// denselben setzen. Leer = aus (dann zählt nur die Bereitstellungs-Zugriffsstufe).
const TOKEN = '';

const CONFIG = {
  SHEET_ID: '14WcYfxy5oFoArQh3dWz2zNeP5lFLMlkyMxunm3b-SHI',   // Project Management NEW
  TZ: 'Europe/Berlin',
  TABS: {
    timeTracking:        'TimeTracking',
    timeTrackingRecords: 'TimeTrackingRecords',
    projects:            'Projects',
    projectPhases:       'Project Phases',
    services:            'Services',
    tasks:               'Tasks',
    subTasks:            'Sub Tasks',
    users:               'Users',
    companyInfo:         'Company Info'
  }
};

/* ------------------------------------------------------------------ */
function doGet(e){
  const p = (e && e.parameter) || {};
  const action = p.action || 'ping';
  if(TOKEN && p.token !== TOKEN) return reply({ ok:false, action:action, error:'nicht autorisiert' }, p.callback);
  let out;
  try{
    let data;
    switch(action){
      case 'ping':          data = { ts:new Date().toISOString() }; break;
      case 'getFilterTree': data = getFilterTreeCached(p.fresh === '1'); break;
      case 'getCompanyInfo':data = getCompanyInfo(); break;
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
    if(!P.phases[phKey]) P.phases[phKey] = { id:phId, name: phId || '(ohne Phase)', services:{} };
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
