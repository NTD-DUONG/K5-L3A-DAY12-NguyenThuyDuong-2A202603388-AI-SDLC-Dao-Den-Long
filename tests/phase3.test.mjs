import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createGame} from '../src/core/index.mjs';
import {validateScenario,FormatError} from '../src/headless/validate.mjs';
const {tuning:t}=JSON.parse(readFileSync(new URL('../game.contract.json',import.meta.url)));
const base={random_motes:false,random_shades:false,random_drifters:false,wind_enabled:false,motes:[],shades:[],drifters:[]};
const make=(s={},night=1,tuning=t)=>createGame(tuning,123,{...base,...s},night);
const lamp=(g,id='L1')=>g.state.lanterns.find(l=>l.id===id);
test('fuel defaults, scenario does not increase capacity or score',()=>{
 const g=make({lanterns:[{id:'L1',lit:true}]});assert.equal(g.snapshot().lanterns[0].fuel,100);
 assert.equal(lamp(g).ever_lit,true);assert.equal(g.state.player.capacity,10);assert.equal(g.state.score,0);
});
test('fuel arithmetic is exact over 6000 ticks and emits out once',()=>{
 const g=make({lanterns:[{id:'L1',lit:true}]});let out=[];
 for(let i=0;i<5999;i++)out.push(...g.step().filter(e=>e.name==='lantern_out'));
 assert.equal(lamp(g).fuelUnits,1);assert.equal(lamp(g).lit,true);
 out.push(...g.step().filter(e=>e.name==='lantern_out'));assert.equal(out.length,1);assert.equal(out[0].tick,6000);
 assert.equal(lamp(g).deposited,0);assert.equal(lamp(g).ever_lit,true);assert.equal(g.snapshot().lanterns[0].fuel,0);
 g.step();assert.equal(lamp(g).lit,false);
});
test('pause freezes fuel and drain along with sim ticks',()=>{
 const g=make({player:{pos:[20,0,0]},lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel:20}],shades:[{id:'S1',pos:[0,.8,0],state:'drain',target_lantern_id:'L1'}]});
 g.step({pause:true});for(let i=0;i<100;i++)g.step();assert.equal(lamp(g).fuelUnits,1200);assert.equal(g.state.sim_tick,0);
});
test('first light sets fuel100, scores150 and grows capacity12',()=>{
 const g=make({player:{carried:10},lanterns:[{id:'L1',pos:[0,0,0]}]});const e=g.step({interact:true});
 assert.equal(lamp(g).fuelUnits,6000);assert.equal(g.state.score,150);assert.equal(g.state.player.capacity,12);
 assert.deepEqual(e.find(e=>e.name==='lantern_lit').data,{lantern_id:'L1',relight:false});assert.equal(g.state.state,'playing');
});
test('relight needs five, remembers partial deposit and scores40 bonus',()=>{
 const g=make({player:{carried:2},lanterns:[{id:'L1',pos:[0,0,0],ever_lit:true,deposited:3}]});const e=g.step({interact:true});
 assert.equal(lamp(g).lit,true);assert.equal(lamp(g).relit_count,1);assert.equal(g.state.score,50);
 assert.equal(e.find(e=>e.name==='lantern_lit').data.relight,true);assert.equal(g.state.player.capacity,12);
});
test('refuel uses ceil, caps fuel and never counts as a successful light',()=>{
 const g=make({player:{carried:10},lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel:89.9}]});const e=g.step({interact:true});
 const refuel=e.find(e=>e.name==='refuel');assert.equal(refuel.data.amount,2);assert.equal(refuel.data.fuel,100);
 assert.equal(g.state.player.carried,8);assert.equal(g.state.score,10);assert.equal(g.state.player.capacity,10);
});
test('full lamp is skipped with no fuel deficit, so nearest eligible unlit is chosen',()=>{
 const g=make({player:{carried:10},lanterns:[{id:'L1',pos:[0,0,0],lit:true},{id:'L2',pos:[1,0,0]}]},1,{...t,fuel_decay_per_s:0});
 const e=g.step({interact:true});assert.equal(e.find(e=>e.name==='deposit').data.lantern_id,'L2');assert.equal(e.some(e=>e.name==='refuel'),false);
});
test('eligible lamps tie-break by id and held interact does not refuel repeatedly',()=>{
 const g=make({player:{carried:10},lanterns:[{id:'L1',pos:[1,0,0],lit:true,fuel:50},{id:'L2',pos:[-1,0,0],lit:true,fuel:50}]});
 const e=g.step({interact:true});assert.equal(e.find(e=>e.name==='refuel').data.lantern_id,'L1');
 assert.equal(g.step().filter(e=>['refuel','deposit'].includes(e.name)).length,0);
});
test('capacity from scenario and successful relights caps at20 and pickup uses it',()=>{
 const g=make({player:{successful_lights:4,carried:17},motes:[[0,0,0],[0,0,0]],lanterns:[{id:'L1',pos:[0,0,0],ever_lit:true}]});
 g.step();assert.equal(g.state.player.carried,18);assert.equal(g.state.motes.length,1);
 g.step({interact:true});assert.equal(g.state.player.capacity,20);assert.equal(g.state.player.successfulLights,5);
 assert.equal(make().state.player.capacity,10);
});
test('weak lamp loses safe zone strictly below30; exact30 remains safe',()=>{
 const scenario=fuel=>({player:{pos:[20,0,0]},lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel}],shades:[{id:'S1',pos:[0,.8,0],state:'wander'}]});
 const strong=make(scenario(30+1/60));strong.step();assert.equal(lamp(strong).fuelUnits,1800);assert.ok(Math.hypot(strong.state.shades[0].pos[0],strong.state.shades[0].pos[2])>=6);
 const weak=make(scenario(30));weak.step();assert.equal(weak.state.shades[0].state,'drain');
});
test('wander prefers nearest weak light and ties by id; chase keeps player target',()=>{
 const s={player:{pos:[-30,0,0]},lanterns:[{id:'L1',pos:[10,0,0],lit:true,fuel:20},{id:'L2',pos:[-10,0,0],lit:true,fuel:20},{id:'L3',pos:[0,0,0]}],shades:[{id:'S1',pos:[0,.8,0],state:'wander'}]};
 const g=make(s);g.step();assert.equal(g.state.shades[0].target_lantern_id,'L1');
 const h=make({...s,player:{pos:[-15,0,0]},shades:[{id:'S1',pos:[0,.8,0],state:'chase'}]});h.step();assert.equal(h.state.shades[0].state,'chase');assert.ok(h.state.shades[0].pos[0]<0);
});
test('multiple drainers stack, including natural decay; drain events every60 sim ticks',()=>{
 const g=make({player:{pos:[20,0,0]},lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel:29}],shades:['S1','S2'].map(id=>({id,pos:[0,.8,0],state:'drain',target_lantern_id:'L1'}))});
 let e=[];for(let i=0;i<60;i++)e.push(...g.step());assert.equal(lamp(g).fuelUnits,18*60);
 const drains=e.filter(e=>e.name==='fuel_drain');assert.equal(drains.length,2);assert.ok(drains.every(e=>e.tick===60&&e.data.fuel===18));
});
test('drain gives way to chase within6m and stops when target is out',()=>{
 const s={lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel:20}],shades:[{id:'S1',pos:[0,.8,0],state:'drain',target_lantern_id:'L1'}]};
 const g=make({...s,player:{pos:[5,0,0]}});g.step();assert.equal(g.state.shades[0].state,'chase');
 const h=make({...s,player:{pos:[20,0,0]},lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel:1/60}]});h.step();assert.notEqual(h.state.shades[0].state,'drain');assert.equal(lamp(h).lit,false);
});
test('refuel above30 restores safe zone and expels draining shade with no hit',()=>{
 const g=make({player:{carried:1},lanterns:[{id:'L1',pos:[0,0,0],lit:true,fuel:29.5}],shades:[{id:'S1',pos:[1,.8,0],state:'drain',target_lantern_id:'L1'}]});
 const e=g.step({interact:true});assert.equal(e.find(e=>e.name==='refuel').data.fuel,39.4);
 assert.equal(g.state.player.flames,3);assert.ok(Math.hypot(g.state.shades[0].pos[0],g.state.shades[0].pos[2])>=6);assert.notEqual(g.state.shades[0].state,'drain');
});
test('pulse gives total15 for pre-pulse drain and5 for ordinary or already stunned shade',()=>{
 const g=make({player:{carried:3},lanterns:[{id:'L1',pos:[2,0,0],lit:true,fuel:20}],shades:[{id:'S1',pos:[2,.8,0],state:'drain',target_lantern_id:'L1'},{id:'S2',pos:[3,.8,0],state:'stunned',state_ticks_left:30}]});
 g.step({pulse:true});assert.equal(g.state.score,20);assert.ok(g.state.shades.every(s=>s.state==='stunned'));
});
test('dawn requires ceil60percent in every night; no early victory',()=>{
 for(const [night,required]of [[1,3],[2,4],[3,5]]){
  const lit=Array.from({length:required},(_,i)=>({id:'L'+(i+1),lit:true,fuel:80}));
  const g=make({time_left_s:1/60,lanterns:lit},night);const e=g.step();assert.equal(g.state.state,'won');assert.equal(e.at(-1).data.reason,'dawn_survived');
  const h=make({time_left_s:1/60,lanterns:lit.slice(1)},night);assert.equal(h.step().at(-1).data.reason,'dawn');
 }
});
test('last tick out and death are resolved before dawn; fuel bonus uses floor',()=>{
 const g=make({time_left_s:1/60,lanterns:[{id:'L1',lit:true,fuel:1/60},{id:'L2',lit:true},{id:'L3',lit:true}]});
 const e=g.step();assert.equal(e.find(e=>e.name==='lantern_out').tick,1);assert.equal(e.at(-1).data.reason,'dawn');
 const h=make({time_left_s:1/60,lanterns:['L1','L2','L3'].map(id=>({id,lit:true,fuel:80}))});h.step();assert.equal(h.state.score,537);
 const dead=make({time_left_s:1/60,player:{flames:0},lanterns:['L1','L2','L3'].map(id=>({id,lit:true}))});assert.equal(dead.step().at(-1).data.reason,'no_flames');
});
test('last tick interaction can restore enough lights to win',()=>{
 const g=make({time_left_s:1/60,player:{carried:5},lanterns:[{id:'L1',pos:[0,0,0],ever_lit:true},{id:'L2',lit:true},{id:'L3',lit:true}]});
 const e=g.step({interact:true});assert.equal(e.find(e=>e.name==='lantern_lit').data.relight,true);assert.equal(e.at(-1).data.reason,'dawn_survived');
});
test('v1.2 scenario validates expanded capacity, drain target and fuel',()=>{
 assert.doesNotThrow(()=>validateScenario({player:{carried:20,successful_lights:5},lanterns:[{id:'L1',lit:true,fuel:29.5,ever_lit:true}],shades:[{id:'S1',pos:[0,.8,0],state:'drain',target_lantern_id:'L1'}]},t));
 for(const s of [{player:{successful_lights:-1}},{player:{carried:12}},{lanterns:[{id:'L1',fuel:101}]},{lanterns:[{id:'L1',ever_lit:1}]}])assert.throws(()=>validateScenario(s,t),FormatError);
});
