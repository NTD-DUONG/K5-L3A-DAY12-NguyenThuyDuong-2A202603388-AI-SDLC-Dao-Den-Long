import {mkdirSync,readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir,cpus,platform} from 'node:os';
import {resolve,join} from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url)),proof=resolve(root,'docs/proof/phase-3');
mkdirSync(proof,{recursive:true});const temp=mkdtempSync(join(tmpdir(),'p3-proof-'));
const manifest={"fuel-out":{"ticks":61,"night":1},"refuel":{"ticks":2,"night":1},"relight-capacity":{"ticks":2,"night":1},"stacked-drain":{"ticks":120,"night":1},"pulse-drain":{"ticks":121,"night":1},"dawn-survived":{"ticks":60,"night":1},"dawn-out":{"ticks":60,"night":1},"last-tick-relight":{"ticks":60,"night":1},"pause-fuel":{"ticks":120,"night":1}};
const report={contract:'1.2',node:process.version,os:platform(),cpu:cpus()[0]?.model,scenarios:[],benchmarks:[],web:'Chưa kiểm chứng trực tiếp sau thay luật.'};
function run(args){const start=performance.now(),r=spawnSync(process.execPath,[resolve(root,'src/headless/cli.mjs'),...args],{encoding:'utf8',cwd:root});assert.equal(r.status,0,r.stderr);return performance.now()-start;}
try{
 for(const [name,m]of Object.entries(manifest)){
  const output=resolve(proof,name+'.jsonl'),other=join(temp,name+'.jsonl');
  const args=['--seed','123','--night',String(m.night),'--ticks',String(m.ticks),'--snapshot-every','1','--scenario',resolve(root,'tests/phase-3/'+name+'.scenario.json'),'--inputs',resolve(root,'tests/phase-3/'+name+'.inputs.json')];
  const ms=run([...args,'--out',output]);run([...args,'--out',other]);assert.equal(readFileSync(output,'utf8'),readFileSync(other,'utf8'));
  const records=readFileSync(output,'utf8').trim().split('\n').map(JSON.parse);
  const events=records.filter(x=>x.type==='event');
  if(name==='dawn-survived'||name==='last-tick-relight')assert.equal(events.at(-1).data.reason,'dawn_survived');
  if(name==='dawn-out')assert.equal(events.at(-1).data.reason,'dawn');
  if(name==='fuel-out')assert.equal(events.find(x=>x.name==='lantern_out').tick,60);
  if(name==='stacked-drain')assert.equal(events.filter(x=>x.name==='fuel_drain').length,4);
  report.scenarios.push({name,ms,deterministic:true,end:records.at(-1),events:events.map(e=>({tick:e.tick,name:e.name,data:e.data}))});
 }
 const scenario=join(temp,'benchmark.json');writeFileSync(scenario,JSON.stringify({player:{invuln_ticks:21601}}));
 for(const night of [1,2,3]){
  const output=resolve(proof,'benchmark-night'+night+'.jsonl');
  const ms=run(['--seed','123','--night',String(night),'--ticks','21600','--snapshot-every','600','--scenario',scenario,'--out',output]);
  const end=readFileSync(output,'utf8').trim().split('\n').map(JSON.parse).at(-1);
  assert.equal(end.ticks,[14400,16200,18000][night-1]);assert.ok(ms<30000);report.benchmarks.push({night,ms,end});
 }
 writeFileSync(resolve(proof,'summary.json'),JSON.stringify(report,null,2)+'\n');
 console.log('PASS: 9 scenario v1.2 cùng seed có output giống hệt; các event quan trọng đúng; benchmark cả 3 đêm <30s.');
}finally{rmSync(temp,{recursive:true,force:true});}
