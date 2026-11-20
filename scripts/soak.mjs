import {readFile,writeFile} from 'node:fs/promises';
import {createGame} from '../src/core/index.mjs';
const args=process.argv.slice(2),o={};
try{
 for(let i=0;i<args.length;i+=2){if(!['--seed','--nights','--out'].includes(args[i])||args[i+1]===undefined)throw new Error('Invalid args');o[args[i]]=args[i+1];}
 const seed=Number(o['--seed']),nights=Number(o['--nights']);
 if(!Number.isSafeInteger(seed)||!Number.isInteger(nights)||nights<1||!o['--out'])throw new Error('Require --seed INT --nights POSITIVE --out FILE');
 const {tuning}=JSON.parse(await readFile(new URL('../game.contract.json',import.meta.url),'utf8'));
 let game=null;const report={nights,crashes:0,results:[],mem_start_mb:0,mem_end_mb:0,duration_s:0,seed_index_base:0};
 const started=performance.now();let rng=seed>>>0;
 const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
 for(let i=0;i<nights;i++){
  try{
   game=null;global.gc?.();game=createGame(tuning,seed+i,{},i%3+1);
   if(i===0)report.mem_start_mb=process.memoryUsage().rss/1048576;
   rng=(seed+i)>>>0;let move=[0,0];
   const max=tuning['night'+(i%3+1)+'_duration_s']*60;
   for(let tick=0;tick<max&&!['won','lost'].includes(game.state.state);tick++){
    if(tick%30===0){const a=random()*Math.PI*2;move=[Math.cos(a),Math.sin(a)];}
    game.step({move,jump:random()<.05,dash:random()<.03,pulse:random()<.02,interact:random()<.10});
   }
   report.results.push(game.state.state);
   game=null;global.gc?.();
  }catch{report.crashes++;report.results.push('crashed');}
 }
 report.mem_end_mb=process.memoryUsage().rss/1048576;report.duration_s=(performance.now()-started)/1000;
 await writeFile(o['--out'],JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 if(report.crashes||report.mem_end_mb>report.mem_start_mb*1.2)process.exitCode=1;
}catch(e){console.error(e.message);process.exitCode=2;}
