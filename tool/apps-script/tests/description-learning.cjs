const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const path = require('node:path');
const dir = path.join(__dirname,'..');
function fixture(){
  let fail = null, calls=0;
  class Sheet {
    constructor(data){this.data=data;this.maxCols=data[0]?.length||9;}
    getLastRow(){return this.data.length;}
    getLastColumn(){return this.data[0].length;}
    getMaxColumns(){return this.maxCols;}
    insertColumnsAfter(_,n){this.maxCols+=n;}
    getDataRange(){return this.getRange(1,1,this.data.length,this.getLastColumn());}
    getRange(r,c,n=1,m=1){const sh=this; return {
      getValues(){return Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>sh.data[r+i-1]?.[c+j-1]??''));},
      setValue(v){return this.setValues([[v]]);},
      setValues(rows){if(fail && fail(sh,r,c,rows)) {fail=null;throw Error('injected failure');}
        rows.forEach((row,i)=>row.forEach((v,j)=>{sh.data[r+i-1]??=[];sh.data[r+i-1][c+j-1]=typeof v==='string' && v.startsWith("'")?v.slice(1):v;}));return this;},
      setFontWeight(){return this;}
    };}
    setFrozenRows(){} setColumnWidths(){}
  }
  const headers=['Record_ID','Project_ID','Phase_ID','Service_ID','Billing_Description','Billed','Billed_On','Billed_Document','Billing_Note'];
  const main = new Sheet([headers,['r1','P','PH','S','','','','',''],['r2','P','PH','S','','','','','']]);
  const archive = new Sheet([['Event_ID','Operation_ID','Type','Record_ID','Timestamp','Original','AI','Final','Data_JSON']]);
  const props={DESCRIPTION_ARCHIVE_ID:'archive',WRITE_SECRET:'test'};
  const ctx={console,Date,JSON,Session:{getActiveUser:()=>({getEmail:()=> 'test@example.invalid'})},
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k],setProperty:(k,v)=>props[k]=v})},
    LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
    CacheService:{getScriptCache:()=>({remove(){}})},
    SpreadsheetApp:{openById:id=>({getSheetByName:()=>id==='archive'?archive:main}),flush(){}},
    Utilities:{formatDate:d=>d.toISOString().slice(0,10)},
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(dir,'Code.gs'),'utf8')+'\n'+fs.readFileSync(path.join(dir,'DescriptionLearning.gs'),'utf8'),ctx);
  ctx.rows_=()=>main.data.slice(1).map(row=>Object.fromEntries(main.data[0].map((h,i)=>[h,row[i]??''])));
  ctx.cleanDescriptions=p=>{calls++;return {items:JSON.parse(p.items).map(x=>({i:x.i,text:'KI '+x.text})),provider:'mock',model:'test',promptVersion:'v1',exampleCount:0};};
  const gen=()=>ctx.descriptionClean_({secret:'test',runId:'generate-001',project:'PROJECT',phase:'PH',items:JSON.stringify([{i:0,recordId:'r1',original:'plan revised',text:'plan revised'}])});
  const job=(op='booking-001',over={})=>({secret:'test',operationId:op,document:'DOC',date:'2026-11-06',project:'PROJECT',entries:JSON.stringify([{id:'r1',original:'plan revised',desc:'Überarbeitung der Planung',note:'',...over}])});
  const value=(id,h)=>main.data.find(r=>r[0]===id)[main.data[0].indexOf(h)];
  return {ctx,main,archive,gen,job,value,calls:()=>calls,setFail:f=>fail=f,events:()=>ctx.descriptionEvents_(archive)};
}
test('original/final only in operational source; AI history and accepted example separate',()=>{
 const f=fixture(), g=f.gen(); f.ctx.markBilled(f.job('booking-001',{learningId:g.items[0].learningId}));
 assert.equal(f.value('r1','Original_Description'),'plan revised'); assert.equal(f.value('r1','Billing_Description'),'Überarbeitung der Planung');
 assert.equal(f.main.data[0].length,10); const ex=f.ctx.descriptionExamples_({project:'PROJECT'},[{text:'plan revised'}]);
 assert.equal(ex.length,1);assert.equal(ex[0].kiVorschlag,'KI plan revised');assert.equal(ex[0].final,'Überarbeitung der Planung');
});
test('duplicate generation and booking do not duplicate rows or invoke model again',()=>{
 const f=fixture();f.gen();const n=f.archive.data.length;f.gen();assert.equal(f.calls(),1);assert.equal(f.archive.data.length,n);
 f.ctx.markBilled(f.job());const count=f.archive.data.length;f.ctx.markBilled(f.job());assert.equal(f.archive.data.length,count);
});
test('failed generation event append replays exact saved model response',()=>{
 const f=fixture();f.setFail((sh,r,c,rows)=>sh===f.archive && rows[0][2]==='GENERATED');assert.throws(f.gen,/injected/);
 const g=f.gen();assert.equal(f.calls(),1);assert.equal(g.items[0].text,'KI plan revised');assert.equal(f.events().filter(e=>e.type==='GENERATED').length,1);
});
test('archive failure prevents billing mutation',()=>{
 const f=fixture();f.setFail(sh=>sh===f.archive);assert.throws(()=>f.ctx.markBilled(f.job()),/injected/);assert.equal(f.value('r1','Billed'),'');
});
test('partial operational write resumes with same operation and no duplicate history',()=>{
 const f=fixture();f.setFail((sh,r,c)=>sh===f.main && r===2 && c===6);assert.throws(()=>f.ctx.markBilled(f.job()),/injected/);
 assert.equal(f.ctx.descriptionExamples_({project:'PROJECT'},[{text:'plan revised'}]).length,0);
 assert.throws(()=>f.ctx.markBilled(f.job('another-001')),/Unvollständige/);
 f.ctx.markBilled(f.job());assert.equal(f.value('r1','Billed'),true);assert.equal(f.events().filter(e=>e.type==='PREPARED').length,1);
});
test('commit failure resumes; changed payload with same ID rejected',()=>{
 const f=fixture();f.setFail((sh,r,c,rows)=>sh===f.archive && rows[0][2]==='COMMITTED');assert.throws(()=>f.ctx.markBilled(f.job()),/injected/);
 assert.throws(()=>f.ctx.markBilled(f.job('booking-001',{desc:'Different'})),/wiederverwendet/);
 f.ctx.markBilled(f.job());assert.equal(f.events().filter(e=>e.type==='COMMITTED').length,1);
});
test('new correction preserves first original, supersedes examples; undo retains history',()=>{
 const f=fixture();f.ctx.markBilled(f.job());f.ctx.markBilled(f.job('booking-002',{original:'renamed task',desc:'Planung überarbeitet'}));
 assert.equal(f.value('r1','Original_Description'),'plan revised');assert.equal(f.ctx.descriptionExamples_({project:'PROJECT'},[{text:'plan revised'}])[0].final,'Planung überarbeitet');
 f.ctx.unmarkBilled(f.job('undo-0001'));assert.equal(f.value('r1','Billed'),'');assert.equal(f.value('r1','Billing_Description'),'Planung überarbeitet');
 assert.equal(f.ctx.descriptionExamples_({project:'PROJECT'},[{text:'plan revised'}]).length,0);
 assert.throws(()=>f.ctx.markBilled(f.job('booking-001')),/inzwischen/);
 assert.equal(f.events().filter(e=>e.type==='COMMITTED').length,3);
});
test('missing/duplicate IDs, foreign generation, other document and no auth rejected',()=>{
 const f=fixture();assert.throws(()=>f.ctx.markBilled({...f.job(),secret:'wrong'}),/Schreib/);
 assert.throws(()=>f.ctx.markBilled(f.job('booking-001',{id:'missing'})),/nicht gefunden/);
 assert.throws(()=>f.ctx.markBilled(f.job('booking-001',{learningId:'missing'})),/KI-Vorschlag/);
 const j=f.job();j.entries=JSON.stringify([JSON.parse(j.entries)[0],JSON.parse(j.entries)[0]]);assert.throws(()=>f.ctx.markBilled(j),/doppelte/);
 f.ctx.markBilled(f.job());assert.throws(()=>f.ctx.markBilled({...f.job('booking-002'),document:'OTHER'}),/anderes Dokument/);
});
test('dry run does not add columns, archive rows or billed flags',()=>{
 const f=fixture();f.ctx.markBilled({...f.job(),dryRun:'1'});assert.equal(f.main.data[0].length,9);assert.equal(f.archive.data.length,1);
});
test('literal formula text roundtrips and cannot execute',()=>{
 const f=fixture();f.ctx.markBilled(f.job('booking-001',{original:'=HYPERLINK("x")',desc:'=1+1'}));assert.equal(f.value('r1','Billing_Description'),'=1+1');assert.equal(f.value('r1','Original_Description'),'=HYPERLINK("x")');
});
test('outdated source and other-project examples excluded',()=>{
 const f=fixture();f.ctx.markBilled(f.job());assert.equal(f.ctx.descriptionExamples_({project:'OTHER'},[{text:'plan revised'}]).length,0);
 f.main.data[1][4]='Changed elsewhere';assert.equal(f.ctx.descriptionExamples_({project:'PROJECT'},[{text:'plan revised'}]).length,0);
});
test('oversized archive payload is rejected without truncating or booking',()=>{
 const f=fixture();assert.throws(()=>f.ctx.markBilled(f.job('booking-001',{original:'x'.repeat(46000)})),/groß/);assert.equal(f.value('r1','Billed'),'');
});
test('concurrent source change on retry is not overwritten',()=>{
 const f=fixture();f.setFail((sh,r,c)=>sh===f.main && r===2 && c===6);assert.throws(()=>f.ctx.markBilled(f.job()),/injected/);
 f.main.data[1][4]='External edit';assert.throws(()=>f.ctx.markBilled(f.job()),/Zwischenzeitliche/);assert.equal(f.value('r1','Billing_Description'),'External edit');
});
