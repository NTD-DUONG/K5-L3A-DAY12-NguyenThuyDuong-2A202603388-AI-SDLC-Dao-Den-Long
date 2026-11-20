import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createGame} from '../src/core/index.mjs';
import {validateInputs,validateScenario,FormatError} from '../src/headless/validate.mjs';
const {tuning:t}=JSON.parse(readFileSync(new URL('../game.contract.json',import.meta.url)));
const empty={random_motes:false,random_shades:false,motes:[],shades:[]};
// v1.1 adds night_start; legacy behavior assertions exclude that new event only.
const game=s=>{const g=createGame(t,7,{...empty,...s});const step=g.step;g.step=p=>step(p).filter(e=>e.name!=='night_start');return g;};
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,actual+' != '+expected);
test('tick zero and no inputs; time derived from steps',()=>{
 const g=game();assert.equal(g.snapshot().tick,0);for(let i=0;i<60;i++)g.step();
 assert.deepEqual(g.snapshot().player.pos,[0,0,0]);assert.equal(g.state.time_left_s,299);assert.equal(g.snapshot().sim_tick,60);
});
test('movement normalized, yaw transform and persistence',()=>{
 const g=game();g.step({move:[1,1],cam_yaw_deg:90});for(let i=1;i<60;i++)g.step();
 close(g.state.player.pos[0],6/Math.sqrt(2));close(g.state.player.pos[2],-6/Math.sqrt(2));
 const h=game();h.step({move:[0,1],cam_yaw_deg:90});close(h.state.player.pos[0],0.1);close(h.state.player.pos[2],0);
});
test('jump uses rising edge and lands without autojump',()=>{
 const g=game();g.step({jump:true});assert.ok(g.state.player.pos[1]>0);
 for(let i=0;i<120;i++)g.step();assert.equal(g.state.player.pos[1],0);
 g.step({jump:false});g.step({jump:true});assert.ok(g.state.player.pos[1]>0);
});
test('pickup inclusive XZ boundary, capacity and exact event tick',()=>{
 const g=game({player:{carried:9},motes:[[1,1.5,0],[0,0,0],[1.001,0,0]]});
 const events=g.step();assert.equal(g.state.player.carried,10);assert.equal(g.state.motes.length,2);
 assert.deepEqual(events,[{type:'event',tick:1,name:'mote_picked',data:{carried:10}}]);assert.equal(g.state.score,0);
});
test('partial deposits, held button, lamp cost and no setup points',()=>{
 const g=game({player:{carried:4},lanterns:[{id:'L1',pos:[2,0,0],deposited:3},{id:'L2',lit:true}]});
 assert.equal(g.state.score,0);assert.equal(g.snapshot().lanterns[1].lit,true);
 let e=g.step({interact:true});assert.equal(e[0].data.amount,4);assert.equal(g.state.lanterns[0].deposited,7);
 g.state.player.carried=5;assert.equal(g.step().length,0);
 g.step({interact:false});e=g.step({interact:true});
 assert.equal(g.state.lanterns[0].lit,true);assert.equal(g.state.player.carried,2);assert.equal(g.state.score,170);assert.equal(e[1].name,'lantern_lit');
});
test('last lamp wins once and uses actual remaining time',()=>{
 const g=game({player:{carried:10},lanterns:[{id:'L1',pos:[0,0,0]},...['L2','L3','L4','L5'].map(id=>({id,lit:true}))]});
 const e=g.step({interact:true});assert.equal(g.state.state,'won');assert.equal(g.state.score,948);
 assert.equal(e.at(-1).data.reason,'all_lit');assert.deepEqual(g.step(),[]);assert.equal(g.state.tick,1);
});
test('pulse boundary, cost, push, stun duration and edge/cooldown',()=>{
 const g=game({player:{carried:10},shades:[{id:'edge',pos:[5,.8,0]},{id:'outside',pos:[5.001,.8,0]}]});
 const e=g.step({pulse:true});assert.deepEqual(e[0].data.stunned_ids,['edge']);assert.equal(g.state.player.carried,7);
 assert.equal(g.state.shades[0].state,'stunned');close(g.state.shades[0].pos[0],5+4/15);
 assert.equal(g.step().filter(x=>x.name==='pulse').length,0);
 g.step({pulse:false});assert.equal(g.step({pulse:true}).filter(x=>x.name==='pulse').length,0);
 for(let i=g.state.tick;i<120;i++)g.step();assert.equal(g.state.shades[0].state,'stunned');
 g.step();assert.equal(g.state.shades[0].state,'chase');
});
test('insufficient pulse emits nothing',()=>{
 const g=game({player:{carried:2}});assert.equal(g.step({pulse:true}).length,0);assert.equal(g.state.player.carried,2);
});
test('shade contact: one hit per immunity interval; no_flames stops',()=>{
 const g=game({shades:[{pos:[0,0,0]},{pos:[0,0,0]}]});let hits=[];
 for(let i=0;i<300&&g.state.state==='playing';i++)hits.push(...g.step().filter(e=>e.name==='player_hit'));
 assert.equal(hits.length,3);assert.ok(hits[1].tick-hits[0].tick>=90);assert.ok(hits[2].tick-hits[1].tick>=90);assert.equal(g.state.state,'lost');
});
test('safe lamp excludes shades and protects player',()=>{
 const g=game({lanterns:[{id:'L1',pos:[0,0,0],lit:true}],shades:[{pos:[0,0,0]}]});
 for(let i=0;i<120;i++)g.step();assert.equal(g.state.player.flames,3);
 assert.ok(Math.hypot(g.state.shades[0].pos[0],g.state.shades[0].pos[2])>=4);
});
test('overlapping safe zones cannot trap a shade inside another lamp',()=>{
 const lanterns=[
  {id:'L1',lit:true,pos:[-1.259292053519579,0,-2.6205626930518138]},
  {id:'L2',lit:true,pos:[2.869516699954529,0,1.7858326439658183]},
  {id:'L3',lit:true,pos:[-2.564488286163848,0,2.1603732852353823]},
  {id:'L4',lit:true,pos:[0.547797403893402,0,-2.3425370508172474]}
 ];
 const g=game({lanterns,shades:[{pos:[0,0,0]}]});
 for(let tick=0;tick<180;tick++){
  g.step();const shade=g.snapshot().shades[0];
  for(const lamp of lanterns)assert.ok(Math.hypot(shade.pos[0]-lamp.pos[0],shade.pos[2]-lamp.pos[2])>=t.safe_radius-.001);
 }
});
test('dawn ends at exact step and setup has no events',()=>{
 const g=game({time_left_s:2/60});assert.equal(g.state.score,0);g.step();const e=g.step();
 assert.equal(g.state.tick,2);assert.equal(g.state.time_left_s,0);assert.equal(e.at(-1).data.reason,'dawn');
});
test('validation rejects malformed schemas and duplicate frames/ids',()=>{
 for(const v of [null,{}, {frames:[{tick:0},{tick:0}]},{frames:[{tick:1,move:[2,0]}]},{frames:[{tick:0,pulse:1}]}])
   assert.throws(()=>validateInputs(v),FormatError);
 for(const s of [null,{motes:[[]]},{player:{carried:21}},{lanterns:[{id:'L6'}]},{shades:[{id:'S1',pos:[0,0,0]},{id:'S1',pos:[0,0,0]}]}])
   assert.throws(()=>validateScenario(s,t),FormatError);
});
test('CLI JSONL, deterministic bytes, zero ticks, format exit codes',()=>{
 const dir=mkdtempSync(join(tmpdir(),'lantern-test-'));
 const cli=fileURLToPath(new URL('../src/headless/cli.mjs',import.meta.url));
 const run=(extra,out='a.jsonl')=>spawnSync(process.execPath,[cli,'--seed','123','--night','1','--ticks','60','--out',join(dir,out),...extra],{encoding:'utf8'});
 try{
  assert.equal(run([]).status,0);assert.equal(run([],'b.jsonl').status,0);
  assert.equal(readFileSync(join(dir,'a.jsonl'),'utf8'),readFileSync(join(dir,'b.jsonl'),'utf8'));
  const lines=readFileSync(join(dir,'a.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
  assert.equal(lines[0].tick,0);assert.equal(lines.at(-1).type,'end');assert.equal(lines.at(-1).ticks,60);
  writeFileSync(join(dir,'bad.json'),'{');assert.equal(run(['--inputs',join(dir,'bad.json')]).status,2);
  writeFileSync(join(dir,'bad.json'),'{"frames":[{"tick":0},{"tick":0}]}');assert.equal(run(['--inputs',join(dir,'bad.json')]).status,2);
  writeFileSync(join(dir,'bad.json'),'{"shades":"bad"}');assert.equal(run(['--scenario',join(dir,'bad.json')]).status,2);
  const zero=spawnSync(process.execPath,[cli,'--seed','1','--night','1','--ticks','0','--out',join(dir,'zero.jsonl')]);
  assert.equal(zero.status,0);assert.equal(readFileSync(join(dir,'zero.jsonl'),'utf8').trim().split('\n').length,2);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
