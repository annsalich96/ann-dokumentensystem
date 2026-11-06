/** Separate, append-only description history. No AI drafts in the operational sheet.
 * All mutations use the same script lock. PREPARED -> sheet write -> COMMITTED;
 * retries carry the same operation ID and never repeat a completed transaction.
 */
const DESCRIPTION_HEADERS = ['Event_ID', 'Operation_ID', 'Type', 'Record_ID', 'Timestamp', 'Original', 'AI', 'Final', 'Data_JSON'];

function setupDescriptionLearning(){
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try{
    var props = PropertiesService.getScriptProperties();
    var id = props.getProperty('DESCRIPTION_ARCHIVE_ID');
    var book;
    if(id) book = SpreadsheetApp.openById(id);
    else {
      book = SpreadsheetApp.create('ANN STUNDENNACHWEIS – LERNARCHIV');
      props.setProperty('DESCRIPTION_ARCHIVE_ID', book.getId());
    }
    var sh = book.getSheetByName('Description_History');
    if(!sh){ sh = book.insertSheet('Description_History'); }
    if(!sh.getLastRow()){
      sh.getRange(1, 1, 1, DESCRIPTION_HEADERS.length).setValues([DESCRIPTION_HEADERS]);
      sh.setFrozenRows(1);
      sh.getRange(1,1,1,DESCRIPTION_HEADERS.length).setFontWeight('bold');
      sh.setColumnWidths(6,3,350);
    }
    SpreadsheetApp.flush();
    return { archiveId: book.getId(), archiveUrl: book.getUrl() };
  } finally { lock.releaseLock(); }
}

function descriptionArchive_(){
  var id = PropertiesService.getScriptProperties().getProperty('DESCRIPTION_ARCHIVE_ID');
  if(!id) throw new Error('Lernarchiv noch nicht eingerichtet. setupDescriptionLearning zuerst ausführen.');
  var sh = SpreadsheetApp.openById(id).getSheetByName('Description_History');
  if(!sh) throw new Error('Description_History fehlt im Lernarchiv.');
  var header = sh.getRange(1,1,1,DESCRIPTION_HEADERS.length).getValues()[0];
  if(JSON.stringify(header) !== JSON.stringify(DESCRIPTION_HEADERS)) throw new Error('Lernarchiv: unerwartete Spalten.');
  return sh;
}

function descriptionEvents_(sh){
  return sh.getLastRow() < 2 ? [] : sh.getRange(2,1,sh.getLastRow()-1,DESCRIPTION_HEADERS.length).getValues().map(function(r){
    return { id:String(r[0]), op:String(r[1]), type:String(r[2]), record:String(r[3]), original:String(r[5]), ai:String(r[6]), final:String(r[7]), data:JSON.parse(r[8] || '{}') };
  });
}

function descriptionValue_(v){
  return v instanceof Date ? Utilities.formatDate(v, CONFIG.TZ, 'yyyy-MM-dd') : v == null ? '' : v;
}

function descriptionCell_(v){
  // Leading apostrophe forces literal text in Sheets, including formula-looking input.
  return typeof v === 'string' && /^[=+'@-]/.test(v) ? "'" + v : v;
}

function descriptionAppend_(sh, events, e){
  if(events.some(function(x){ return x.id === e.id; })) return;
  e.data = e.data || {};
  var row = [e.id,e.op,e.type,e.record,new Date().toISOString(),e.original||'',e.ai||'',e.final||'',JSON.stringify(e.data)];
  if(row.some(function(v){return String(v).length > 45000;})) throw new Error('Textverlauf zu groß für eine Archivzeile; nichts kürzen oder verwerfen.');
  sh.getRange(sh.getLastRow()+1,1,1,row.length).setValues([row.map(descriptionCell_)]);
  SpreadsheetApp.flush();
  events.push(e);
}

function descriptionId_(v){
  var s = str_(v);
  if(!/^[A-Za-z0-9_-]{8,100}$/.test(s)) throw new Error('Vorgangs-ID fehlt/ungültig. Editor neu laden.');
  return s;
}

function descriptionClean_(p){
  assertWriteAuth_(p);
  var op = descriptionId_(p.runId), items = JSON.parse(p.items || '[]');
  if(!Array.isArray(items) || !items.length || items.length > 10) throw new Error('KI-Stapel muss 1 bis 10 Einträge enthalten.');
  var request = JSON.stringify([items,p.project||'',p.phase||'',p.maxChars||'',p.lineChars||'']);
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try{
    var sh = descriptionArchive_(), events = descriptionEvents_(sh);
    var cached = events.find(function(e){return e.id === op + ':response';});
    if(cached && cached.data.request !== request) throw new Error('KI-Vorgangs-ID bereits für andere Eingabe verwendet.');
    var result = cached ? cached.data.response : cleanDescriptions(p);
    if(result.items.length !== items.length || items.some(function(it){ return result.items.filter(function(o){return o.i === it.i;}).length !== 1; })) throw new Error('KI-Antwort unvollständig oder doppelt; erneut versuchen.');
    result.items.forEach(function(o){o.learningId = op + ':' + o.i;});
    // Persist the exact response before individual rows so an interrupted write
    // never mixes outputs from two different model calls on retry.
    descriptionAppend_(sh,events,{id:op+':response',op:op,type:'RESPONSE',record:'',data:{request:request,response:result}});
    result.items.forEach(function(o){
      var input = items.find(function(it){return it.i === o.i;});
      descriptionAppend_(sh,events,{id:o.learningId,op:op,type:'GENERATED',record:str_(input.recordId),original:str_(input.original != null ? input.original : input.text),ai:o.text,
        data:{input:input.text,project:p.project||'',phase:p.phase||'',provider:result.provider,model:result.model,promptVersion:result.promptVersion,exampleCount:result.exampleCount}});
    });
    return result;
  } finally { lock.releaseLock(); }
}

function descriptionExamples_(p, items){
  var events = descriptionEvents_(descriptionArchive_()), byId = {}, latest = {};
  events.forEach(function(e){ byId[e.id]=e; if(e.type==='PREPARED' || e.type==='COMMITTED') latest[e.record]=e; });
  var live = indexBy_(rows_(CONFIG.TABS.timeTrackingRecords),'Record_ID');
  var input = items.map(function(x){return x.text||'';}).join(' ').toLowerCase();
  var tokens = input.match(/[a-zäöüß]{4,}/g) || [];
  return Object.keys(latest).map(function(id){
    var e=latest[id], d=e.data, rec=live[id];
    if(e.type!=='COMMITTED' || d.action!=='BOOK' || !rec || !bool_(rec.Billed) || str_(rec.Billing_Description)!==e.final || str_(rec.Billed_Document)!==d.document || !e.original || !e.final) return null;
    // Initially only same-project examples: no transfer of another client's facts.
    if(d.projectName !== str_(p.project)) return null;
    var overlap=tokens.filter(function(t){return e.original.toLowerCase().indexOf(t)>=0;}).length;
    if(!overlap) return null;
    return {score:overlap,original:e.original,ai:e.ai,final:e.final};
  }).filter(Boolean).sort(function(a,b){return b.score-a.score;}).slice(0,4).map(function(e){return {original:e.original,kiVorschlag:e.ai,final:e.final};});
}

function descriptionBill_(p, undo){
  assertWriteAuth_(p);
  var op=descriptionId_(p.operationId), doc=str_(p.document), dry=p.dryRun==='1';
  if(!doc) throw new Error('Dokument fehlt.');
  var entries=JSON.parse(p.entries||'[]');
  if(!Array.isArray(entries) || !entries.length || entries.length>12) throw new Error('Buchungsstapel muss 1 bis 12 Einträge enthalten. Editor neu laden.');
  var ids={}; entries.forEach(function(e){ if(!e.id || ids[e.id]) throw new Error('Leere/doppelte Record_ID.'); ids[e.id]=true; });
  var lock=LockService.getScriptLock(); lock.waitLock(20000);
  try{
    var archive=descriptionArchive_(), events=descriptionEvents_(archive);
    var sh=ss_().getSheetByName(CONFIG.TABS.timeTrackingRecords), values=sh.getDataRange().getValues(), header=values[0];
    var index={}; header.forEach(function(h,i){index[h]=i;});
    ['Record_ID'].concat(BILLING_COLS).forEach(function(h){if(index[h]==null) throw new Error('Erforderliche Spalte fehlt: '+h);});
    var records={}; values.slice(1).forEach(function(row,i){if(row[index.Record_ID]) records[String(row[index.Record_ID])]={row:row,n:i+2};});
    entries.forEach(function(e){
      if(!records[e.id]) throw new Error('Buchung nicht gefunden: '+e.id+'. Keine Einträge überspringen.');
      if(!undo && (typeof e.original!=='string' || !str_(e.desc))) throw new Error('Original/finaler Text fehlt. Editor neu laden.');
    });
    if(dry) return {updated:entries.length,notFound:0};
    if(index.Original_Description==null){
      index.Original_Description=header.length;
      if(sh.getMaxColumns()<=header.length) sh.insertColumnsAfter(sh.getMaxColumns(),1);
      sh.getRange(1,header.length+1).setValue('Original_Description');
    }
    var updated=0;
    entries.forEach(function(e){
      var record=records[e.id], current={};
      BILLING_COLS.concat(['Original_Description']).forEach(function(h){current[h]=descriptionValue_(record.row[index[h]]);});
      var key=op+':'+e.id, action=undo?'UNDO':'BOOK';
      var signature=JSON.stringify([action,doc,p.date||'',e]);
      var prepared=events.find(function(x){return x.id===key+':prepared';});
      var committed=events.find(function(x){return x.id===key+':committed';});
      var latest=events.filter(function(x){return x.record===String(e.id) && (x.type==='PREPARED'||x.type==='COMMITTED');}).pop();
      if(prepared && prepared.data.signature!==signature) throw new Error('Vorgangs-ID wiederverwendet; Inhalt wurde geändert.');
      if(committed){
        if(!latest || latest.id!==committed.id) throw new Error('Buchung wurde inzwischen geändert. Daten neu laden.');
        updated++; return;
      }
      if(prepared && latest && latest.id!==prepared.id) throw new Error('Offener Vorgang wurde durch spätere Bearbeitung überholt. Manuell prüfen.');
      if(!prepared){
        if(latest && latest.type==='PREPARED') throw new Error('Unvollständige Speicherung vorhanden. Zuerst den ursprünglichen Vorgang wiederholen.');
        if(bool_(current.Billed) && str_(current.Billed_Document)!==doc) throw new Error('Eintrag bereits auf ein anderes Dokument gebucht.');
        if(undo && str_(current.Billed_Document)!==doc) throw new Error('Rücknahme passt nicht zum gebuchten Dokument.');
        var generation=e.learningId ? events.find(function(x){return x.id===e.learningId && x.type==='GENERATED' && x.record===String(e.id);}) : null;
        if(e.learningId && !generation) throw new Error('Zugehöriger KI-Vorschlag fehlt im Archiv.');
        var original=str_(current.Original_Description)|| (undo ? '' : e.original);
        var target={Billing_Description:undo?current.Billing_Description:str_(e.desc), Billed:undo?'':true, Billed_On:undo?'':str_(p.date), Billed_Document:undo?'':doc, Billing_Note:undo?'':str_(e.note), Original_Description:original};
        prepared={id:key+':prepared',op:op,type:'PREPARED',record:String(e.id),original:original,ai:generation?generation.ai:'',final:target.Billing_Description,
          data:{action:action,document:doc,projectName:str_(p.project),projectId:record.row[index.Project_ID],phaseId:record.row[index.Phase_ID],serviceId:record.row[index.Service_ID],learningId:e.learningId||'',before:current,target:target,signature:signature,user:Session.getActiveUser().getEmail()||''}};
        descriptionAppend_(archive,events,prepared);
      }
      var before=prepared.data.before, target=prepared.data.target;
      Object.keys(target).forEach(function(h){
        // Partial writes can be safely resumed; unrelated changes cannot be overwritten.
        var actual=current[h];
        if(String(actual)!==String(before[h]) && String(actual)!==String(target[h])) throw new Error('Zwischenzeitliche Änderung an '+e.id+'/'+h+'. Bitte prüfen.');
      });
      Object.keys(target).forEach(function(h){sh.getRange(record.n,index[h]+1).setValue(descriptionCell_(target[h]));});
      SpreadsheetApp.flush();
      var readback=sh.getRange(record.n,1,1,sh.getLastColumn()).getValues()[0];
      Object.keys(target).forEach(function(h){if(String(descriptionValue_(readback[index[h]]))!==String(target[h])) throw new Error('Speicherprüfung fehlgeschlagen: '+h);});
      descriptionAppend_(archive,events,Object.assign({},prepared,{id:key+':committed',type:'COMMITTED'}));
      updated++;
    });
    CacheService.getScriptCache().remove('filterTree3');
    return {updated:updated,cleared:undo?updated:0,notFound:0,archiveUrl:'https://docs.google.com/spreadsheets/d/'+PropertiesService.getScriptProperties().getProperty('DESCRIPTION_ARCHIVE_ID')+'/edit'};
  } finally { lock.releaseLock(); }
}
