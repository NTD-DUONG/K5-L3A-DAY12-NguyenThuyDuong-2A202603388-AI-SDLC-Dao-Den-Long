import test from 'node:test';
import assert from 'node:assert/strict';
import {createNightMap} from '../src/core/night-maps.mjs';
test('night 1 has exact standard lamps and 24 spawn points',()=>{
 const m=createNightMap(1);assert.equal(m.islands[0].radius,40);
 assert.deepEqual(m.lanterns[1],{id:'L2',pos:[23.8,0,7.7]});
 assert.equal(m.motePoints.length,24);assert.deepEqual(m.motePoints[0],[12,0,0]);
 assert.equal(m.shadePoints.length,12);assert.equal(m.shadeSchedule.firstTick,300);
});
test('night 2 has two islands, bridge, pads and six lamps',()=>{
 const m=createNightMap(2);assert.equal(m.islands.length,2);
 assert.deepEqual(m.islands[1].center,[70,0,0]);assert.equal(m.lanterns.length,6);
 assert.deepEqual(m.lanterns[5],{id:'L6',pos:[53,0,-10]});
 assert.deepEqual(m.bridges[0],{minX:26,maxX:44,minZ:-2,maxZ:2,y:0});
 assert.equal(m.pads.length,2);assert.deepEqual(m.charms[0].pos,[35,0,0]);
 assert.equal(m.motePoints.length,24);assert.equal(m.shadePoints.length,16);
});
test('night 3 has three spawn heights, ramps, tower and seven lamps',()=>{
 const m=createNightMap(3);assert.equal(m.lanterns.length,7);
 assert.equal(m.motePoints.length,30);
 assert.deepEqual([0,3,6].map(y=>m.motePoints.filter(p=>p[1]===y).length),[18,8,4]);
 assert.ok(m.motePoints.filter(p=>p[1]===3).every(p=>p[2]>0));
 assert.equal(m.ramps.length,2);assert.equal(m.towers[0].radius,2);
 assert.deepEqual(m.pads[0].direction,[0,0,-1]);assert.equal(m.wind.warningTicks,120);
});
test('map instances are independent and invalid nights are rejected',()=>{
 const first=createNightMap(1);first.lanterns[0].pos[0]=999;
 assert.equal(createNightMap(1).lanterns[0].pos[0],0);
 for(const value of [0,4,'1',null])assert.throws(()=>createNightMap(value),RangeError);
});
