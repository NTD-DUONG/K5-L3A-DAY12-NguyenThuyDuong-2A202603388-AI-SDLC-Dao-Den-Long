import {mkdirSync,readFileSync,writeFileSync,rmSync,mkdtempSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir,cpus,platform,release} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
assert.equal(JSON.parse(readFileSync(new URL('../game.contract.json',import.meta.url),'utf8')).contract_version,'1.1','Chạy minh chứng Phase2 trên commit561be77. Bản v1.2 dùng npm run proof:phase3, không ghi đè output cũ.');
const root=fileURLToPath(new URL('../',import.meta.url)),proof=resolve(root,'docs/proof/phase-2');mkdirSync(proof,{recursive:true});
const manifest={"pause":{"night":1,"ticks":120},"dash":{"night":1,"ticks":13},"charm":{"night":2,"ticks":2},"drifter-steal":{"night":2,"ticks":3},"drifter-drop":{"night":2,"ticks":2},"fall":{"night":1,"ticks":62},"pad":{"night":2,"ticks":100},"wind":{"night":3,"ticks":1850}};
const temp=mkdtempSync(join(tmpdir(),'lantern-proof-'));
const report={node:process.version,os:platform()+' '+release(),cpu:cpus()[0]?.model,scenarios:[],benchmarks:[],fps:'Chưa đo trên trình duyệt; dùng nút đo FPS trong Cài đặt.'};
function cli(args){const start=performance.now(),r=spawnSync(process.execPath,[resolve(root,'src/headless/cli.mjs'),...args],{cwd:root,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return performance.now()-start;}
try{
 for(const [name,m]of Object.entries(manifest)){
  const out=resolve(proof,name+'.jsonl'),other=join(temp,name+'.jsonl');
  const args=['--seed','123','--night',String(m.night),'--ticks',String(m.ticks),'--scenario',resolve(root,'tests/phase-2/'+name+'.scenario.json'),'--inputs',resolve(root,'tests/phase-2/'+name+'.inputs.json'),'--snapshot-every','10'];
  const ms=cli([...args,'--out',out]);cli([...args,'--out',other]);assert.equal(readFileSync(out,'utf8'),readFileSync(other,'utf8'));
  const lines=readFileSync(out,'utf8').trim().split('\n').map(JSON.parse);
  report.scenarios.push({name,night:m.night,ms,deterministic:true,end:lines.at(-1),events:lines.filter(x=>x.type==='event').map(x=>x.name)});
 }
 for(const night of [1,2,3]){
  // Keep default spawns/AI/wind enabled; immunity only prevents an early loss.
  const scenario=join(temp,'benchmark.json');writeFileSync(scenario,JSON.stringify({player:{invuln_ticks:21601}}));
  const out=resolve(proof,'benchmark-night'+night+'.jsonl');
  const ms=cli(['--seed','123','--night',String(night),'--ticks','21600','--scenario',scenario,'--snapshot-every','600','--out',out]);
  const end=readFileSync(out,'utf8').trim().split('\n').map(JSON.parse).at(-1);
  assert.equal(end.ticks,[18000,19800,21600][night-1]);assert.ok(ms<=30000);
  report.benchmarks.push({night,ms,ticks:end.ticks,within_30_seconds:true});
 }
 writeFileSync(resolve(proof,'headless-summary.json'),JSON.stringify(report,null,2)+'\n');
 console.log('PASS: '+report.scenarios.length+' scenario chạy hai lần giống hệt; benchmark cả 3 đêm <=30s. Xem docs/proof/phase-2/headless-summary.json');
}finally{rmSync(temp,{recursive:true,force:true});}
