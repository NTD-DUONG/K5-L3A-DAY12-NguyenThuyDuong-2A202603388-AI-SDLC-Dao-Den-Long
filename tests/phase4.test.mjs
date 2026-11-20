import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join,resolve} from 'node:path';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {createBenchmark,benchmarkScenario,frameStats} from '../src/core/benchmark.mjs';
import {readBoard,saveEntry} from '../src/platform/leaderboard.mjs';
import {defaultBindings,bindingErrors,loadPreferences} from '../src/web/input.mjs';
import {createApp} from '../scripts/serve.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),{tuning:t}=JSON.parse(await readFile(resolve(root,'game.contract.json'),'utf8'));
test('benchmark has exact populations, stationary player, constant fuel and no game over',()=>{
 const s=benchmarkScenario(42);assert.equal(s.shades.length,200);assert.equal(s.motes.length,100);
 assert.equal(new Set(s.shades.map(s=>s.pos.join(','))).size,200);assert.deepEqual(s,benchmarkScenario(42));
 const g=createBenchmark(t,42);for(let i=0;i<1800;i++)g.step({move:[1,1],pulse:true,dash:true,interact:true});
 const snap=g.snapshot();assert.equal(snap.shades.length,200);assert.equal(snap.motes.length,100);assert.deepEqual(snap.player.pos,[0,0,0]);assert.equal(snap.player.flames,3);
 assert.ok(snap.shades.every(s=>s.state==='wander'));assert.ok(snap.lanterns.slice(0,3).every(l=>l.lit&&l.fuel===100));assert.equal(snap.state,'playing');
 assert.ok(snap.shades.some((shade,i)=>shade.pos[0]!==s.shades[i].pos[0]));
});
test('benchmark metrics follow N/sum, slowest one percent and nearest-rank p95',()=>{
 const dt=[...Array(99).fill(10),100];const stats=frameStats(dt);
 assert.equal(stats.frames,100);assert.equal(stats.avg_fps,100000/1090);assert.equal(stats.p1_low_fps,10);assert.equal(stats.frame_ms_p95,10);
 assert.throws(()=>frameStats([]));assert.throws(()=>frameStats([0]));
});
test('preferences roundtrip, duplicate key detection and defaults recovery',()=>{
 const v={volume:.4,sensitivity:1.7,colorblind:true,reducedMotion:true,largeText:true,bindings:{...defaultBindings,jump:'KeyJ'}};
 const storage={getItem:()=>JSON.stringify(v)};assert.deepEqual(loadPreferences(storage),v);
 const errors=bindingErrors({...defaultBindings,jump:'KeyW'});assert.ok(errors.some(e=>e.includes('Trùng')));
 assert.deepEqual(loadPreferences({getItem:()=>'{'}).bindings,defaultBindings);
 assert.deepEqual(loadPreferences({getItem:()=>JSON.stringify({bindings:{...defaultBindings,jump:'KeyW'}})}).bindings,defaultBindings);
});
test('leaderboard persists, sorts ties by earlier achieved_at, caps ten and rejects invalid name',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'lantern-p4-')),file=join(dir,'leaderboard.json');
 try{
  await saveEntry(file,{name:'Later',score:500,nights_won:2,seed:7},new Date('2026-11-21T10:00:02+07:00'));
  await saveEntry(file,{name:'Early',score:500,nights_won:1,seed:8},new Date('2026-11-21T10:00:01+07:00'));
  assert.equal((await readBoard(file)).entries[0].name,'Early');
  await assert.rejects(()=>saveEntry(file,{name:'a!',score:2,nights_won:0,seed:1}));
  for(let i=0;i<15;i++)await saveEntry(file,{name:'User_'+i,score:i,nights_won:0,seed:i});
  const entries=(await readBoard(file)).entries;assert.equal(entries.length,10);assert.equal(entries[0].name,'Early');assert.ok(entries.every(e=>e.achieved_at.endsWith('Z')));
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('game API and export CLI read the same persistent leaderboard file',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'lantern-p4-'));let app;
 try{
  app=await createApp({dataFile:join(dir,'leaderboard.json')});
  const response=await fetch(app.url+'/api/leaderboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Tester',score:1234,nights_won:3,seed:12})});
  assert.equal(response.status,200);await app.close();app=null;
  const output=join(dir,'export.json'),run=spawnSync(process.execPath,[resolve(root,'scripts/serve.mjs'),'--export-leaderboard',output],{env:{...process.env,LANTERN_DATA_DIR:dir},encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);assert.equal(JSON.parse(await readFile(output,'utf8')).entries[0].score,1234);
 }finally{if(app)await app.close();await rm(dir,{recursive:true,force:true});}
});
test('soak CLI runs multiple nights in one process and writes real RSS metrics',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'lantern-p4-'));
 try{
  const out=join(dir,'soak.json'),r=spawnSync(process.execPath,['--expose-gc',resolve(root,'scripts/soak.mjs'),'--seed','7','--nights','3','--out',out],{encoding:'utf8'});
  assert.ok([0,1].includes(r.status),r.stderr);const data=JSON.parse(await readFile(out,'utf8'));
  assert.equal(data.nights,3);assert.equal(data.results.length,3);assert.equal(data.crashes,0);assert.ok(data.mem_start_mb>0);assert.ok(data.mem_end_mb>0);assert.ok(data.duration_s>0);
 }finally{await rm(dir,{recursive:true,force:true});}
});
