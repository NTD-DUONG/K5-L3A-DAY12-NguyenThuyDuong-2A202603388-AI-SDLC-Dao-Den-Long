import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
import {createGame} from '../src/core/index.mjs';
import {createNightMap,terrainHeight} from '../src/core/terrain.mjs';
const {tuning:t}=JSON.parse(readFileSync(new URL('../game.contract.json',import.meta.url)));
const empty={random_motes:false,random_shades:false,random_drifters:false,motes:[],shades:[],drifters:[]};
const make=(s={},n=1)=>createGame(t,123,{...empty,...s},n);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,a+' != '+b);
test('pause freezes sim time, every cooldown, TTL and charm; tick continues',()=>{
 const g=make({player:{charm_ticks:60,invuln_ticks:80,dash_cd_ticks:30,pulse_cd_ticks:40},motes:[{pos:[4,0,0],kind:'dropped',ttl_s:8}]});
 assert.equal(g.step({pause:true})[0].name,'paused');for(let i=0;i<20;i++)g.step();
 const s=g.snapshot();assert.equal(s.tick,21);assert.equal(s.sim_tick,0);assert.equal(s.state,'paused');assert.equal(s.player.charm_s,1);assert.equal(s.motes[0].ttl_s,8);assert.equal(s.time_left_s,300);
 g.step({pause:false});const e=g.step({pause:true});assert.equal(e[0].name,'resumed');assert.equal(g.state.sim_tick,1);
});
test('dash is exactly 12 ticks, 14m/s, rising edge and 90 tick cooldown',()=>{
 const g=make();for(let i=0;i<12;i++)g.step({dash:true});
 close(g.state.player.pos[2],2.8);assert.equal(g.state.player.dashTicks,0);g.step();close(g.state.player.pos[2],2.8);
 g.step({dash:false});assert.equal(g.step({dash:true}).some(e=>e.name==='dash'),false);
});
test('air dash preserves height during all 12 active ticks',()=>{
 const g=make({player:{pos:[0,3,0]}});for(let i=0;i<12;i++)g.step({dash:true});assert.equal(g.state.player.pos[1],3);
});
test('charm grants speed, no dash cooldown, refresh and timed respawn',()=>{
 const g=make({player:{pos:[35,0,0]}},2);const e=g.step();assert.equal(e.find(x=>x.name==='charm_picked').data.charm_ticks,600);
 assert.equal(g.state.charms[0].respawn,2700);assert.equal(g.state.player.charm,600);
 g.step({move:[1,0]});close(g.state.player.vel[0],7.2);
 assert.ok(g.step({dash:true}).some(e=>e.name==='dash'));assert.equal(g.state.player.dashCd,0);
});
test('drifter steals once, before shade hit and independently of invulnerability',()=>{
 const g=make({player:{carried:8,invuln_ticks:20},drifters:[{id:'D1',pos:[.5,.8,0],state:'chase'}]},2);
 const e=g.step();assert.equal(e.find(e=>e.name==='drifter_steal').data.amount,3);assert.equal(g.state.player.carried,5);assert.equal(g.state.player.flames,3);
 for(let i=0;i<10;i++)assert.equal(g.step().filter(e=>e.name==='drifter_steal').length,0);
});
test('pulse chase drifter flees without stealing; fleeing thief drops motes',()=>{
 const g=make({player:{carried:8},drifters:[{id:'D1',pos:[.5,.8,0],state:'chase'},{id:'D2',pos:[2,.8,0],state:'flee',stolen:3,state_ticks_left:240}]},2);
 const e=g.step({pulse:true});assert.equal(e.filter(e=>e.name==='drifter_steal').length,0);assert.equal(e.find(e=>e.name==='drifter_drop').data.amount,3);
 assert.equal(g.state.motes.filter(m=>m.kind==='dropped').length,3);assert.equal(g.state.drifters[1].timer,120);
});
test('fall bypasses invulnerability, loses all cargo once, respawns after 60 ticks',()=>{
 const g=make({player:{pos:[41,-10.1,0],carried:8,invuln_ticks:80}});
 const e=g.step();assert.deepEqual(e.find(e=>e.name==='player_hit').data,{by:'fall',flames:2,dropped:0,lost:8});
 for(let i=0;i<59;i++)assert.equal(g.step().filter(e=>e.name==='player_hit').length,0);
 assert.equal(g.state.player.respawn,1);g.step();assert.deepEqual(g.state.player.pos,[0,0,0]);assert.equal(g.state.player.invuln,90);
});
test('shade hit drops floor half; new drops unavailable until next tick',()=>{
 const g=make({player:{carried:9},shades:[{id:'S1',pos:[0,.8,0],state:'chase'}]});const e=g.step();
 assert.equal(e.find(e=>e.name==='player_hit').data.dropped,4);assert.equal(g.state.player.carried,5);assert.equal(g.state.motes.length,4);
 assert.ok(g.state.motes.every(m=>m.ttl===480&&m.born===1));
});
test('standard initial motes distinct; first shade spawn 300 and next 780',()=>{
 const g=createGame(t,1,{},1);assert.equal(g.state.motes.length,20);assert.equal(new Set(g.state.motes.map(m=>m.pos.join(','))).size,20);assert.equal(g.state.shades.length,0);
 for(let i=0;i<300;i++)g.step();assert.equal(g.state.shades.length,2);
 for(let i=300;i<780&&!['won','lost'].includes(g.state.state);i++)g.step();assert.equal(g.state.shades.length,3);
});
test('night2 pad lands on other island with preserved launch velocity',()=>{
 const g=make({player:{pos:[20,0,18]}},2);g.step({move:[-1,0]});assert.ok(g.state.player.pos[1]>0);
 for(let i=0;i<100;i++)g.step({move:[0,0]});assert.ok(g.state.player.pos[0]>42);assert.equal(g.state.player.grounded,true);
});
test('night3 ramp, vertical tiers, ground origin and tower geometry',()=>{
 const m=createNightMap(3);close(terrainHeight(m,27*Math.cos(Math.PI/6),27*Math.sin(Math.PI/6)),1.5);assert.equal(terrainHeight(m,0,13),3);assert.equal(terrainHeight(m,0,6),6);
 const g=make({},3);assert.deepEqual(g.snapshot().player.pos,[0,0,0]);g.step({move:[1,0]});assert.ok(g.state.player.pos[0]>0);
});
test('wind warning two seconds early and active at 1800, pauses freeze it',()=>{
 const g=make({player:{pos:[30,0,0]}},3);for(let i=0;i<1680;i++)g.step();assert.equal(g.state.wind.warning,true);assert.equal(g.state.wind.active,false);
 for(let i=1680;i<1800;i++)g.step();assert.equal(g.state.wind.active,true);
 const sim=g.state.sim_tick;g.step({pause:true});for(let i=0;i<60;i++)g.step();assert.equal(g.state.sim_tick,sim);
});
test('3D pulse and vertical pickup exclusion use standard heights',()=>{
 const g=make({player:{carried:3},motes:[[0,2,0]],shades:[{id:'S1',pos:[0,7,0]}]});const e=g.step({pulse:true});
 assert.deepEqual(e.find(e=>e.name==='pulse').data.stunned_ids,[]);assert.equal(g.state.motes.length,1);
});
test('full 21600 step night CLI schema and runtime',()=>{
 const dir=mkdtempSync(join(tmpdir(),'p2-'));const cli=fileURLToPath(new URL('../src/headless/cli.mjs',import.meta.url));
 try{
  for(const night of [1,2,3]){
   const out=join(dir,'n'+night+'.jsonl'),start=performance.now();
   const run=spawnSync(process.execPath,[cli,'--seed','5','--night',String(night),'--ticks','21600','--snapshot-every','600','--scenario',fileURLToPath(new URL('../tests/phase-2/wind.scenario.json',import.meta.url)),'--out',out],{encoding:'utf8'});
   assert.equal(run.status,0,run.stderr);assert.ok(performance.now()-start<30000);
   const lines=readFileSync(out,'utf8').trim().split('\n').map(JSON.parse);
   assert.equal(lines[0].night,night);assert.equal(lines.at(-1).type,'end');assert.equal(lines.at(-1).ticks,[18000,19800,21600][night-1]);
   for(const key of ['motes','drifters','charms'])assert.ok(Array.isArray(lines[0][key]));
  }
 }finally{rmSync(dir,{force:true,recursive:true});}
});
test('drifters spawn at 1200 and 2400, capped at two',()=>{
 const g=make({random_drifters:true},2);
 for(let i=0;i<1199;i++)g.step();assert.equal(g.state.drifters.length,0);
 g.step();assert.equal(g.state.drifters[0].id,'D1');
 for(let i=1200;i<3600;i++)g.step();assert.equal(g.state.drifters.length,2);
 assert.deepEqual(g.state.drifters.map(d=>d.id),['D1','D2']);
});
test('charm expires after 600 ticks and reappears 2700 after pickup',()=>{
 const g=make({player:{pos:[35,0,0]}},2);g.step();assert.equal(g.state.player.charm,600);
 for(let i=1;i<601;i++)g.step();assert.equal(g.state.player.charm,0);
 for(let i=601;i<2700;i++)g.step();assert.equal(g.state.charms[0].available,false);
 assert.ok(g.step().some(e=>e.name==='charm_picked'));assert.equal(g.state.player.charm,600);
});
test('pulse pushes exactly four meters over fifteen active ticks',()=>{
 const g=make({player:{carried:3},shades:[{id:'S1',pos:[3,.8,0]}]});g.step({pulse:true});
 for(let i=1;i<15;i++)g.step();close(g.state.shades[0].pos[0],7);
 g.step();close(g.state.shades[0].pos[0],7);
});
test('all three nights win at exact deadline; no flames still loses first',()=>{
 for(const night of [1,2,3]){
  const lanterns=createNightMap(night).lanterns.map((l,i)=>({id:l.id,...(i?{lit:true}:{pos:[0,0,0]})}));
  const g=make({time_left_s:1/60,player:{carried:10},lanterns},night);g.step({interact:true});assert.equal(g.state.state,'won');assert.equal(g.state.score,350);
  const h=make({time_left_s:1/60,player:{carried:10,flames:0},lanterns},night);const e=h.step({interact:true});assert.equal(h.state.state,'lost');assert.equal(e.at(-1).data.reason,'no_flames');
 }
});
