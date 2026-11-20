import {readFile,writeFile} from 'node:fs/promises';
import {createGame} from '../core/index.mjs';
import {FormatError,validateInputs,validateScenario} from './validate.mjs';
async function main(){
  const args=process.argv.slice(2),o={},allowed=new Set(['seed','night','ticks','out','scenario','inputs','snapshot-every']);
  for(let i=0;i<args.length;i+=2){const k=args[i].slice(2);if(!args[i].startsWith('--')||!allowed.has(k)||args[i+1]===undefined||Object.hasOwn(o,k))throw new Error('Invalid CLI arguments');o[k]=args[i+1];}
  const integer=(k,min,fallback)=>{const raw=o[k]??fallback;if(raw===undefined||! /^-?\d+$/.test(String(raw)))throw new Error('Invalid --'+k);const v=Number(raw);if(!Number.isSafeInteger(v)||v<min)throw new Error('Invalid --'+k);return v;};
  const seed=integer('seed',Number.MIN_SAFE_INTEGER),night=integer('night',1),ticks=integer('ticks',0),every=integer('snapshot-every',1,10);
  if(night>3||!o.out)throw new Error('Require --night 1, 2 or 3 and --out');
  const {tuning}=JSON.parse(await readFile(new URL('../../game.contract.json',import.meta.url),'utf8'));
  async function json(path){const text=await readFile(path,'utf8');try{return JSON.parse(text.replace(/^\uFEFF/,''));}catch{throw new FormatError('Invalid JSON: '+path);}}
  const scenario=o.scenario?validateScenario(await json(o.scenario),tuning,night):{};
  const inputs=o.inputs?validateInputs(await json(o.inputs)):{frames:[]};
  const game=createGame(tuning,seed,scenario,night),lines=[JSON.stringify(game.snapshot())];let f=0;
  for(let k=0;k<ticks&&!['won','lost'].includes(game.state.state);k++){
    let patch={};if(inputs.frames[f]?.tick===k){const {tick,...fields}=inputs.frames[f++];patch=fields;}
    for(const event of game.step(patch))lines.push(JSON.stringify(event));
    if(game.state.tick%every===0)lines.push(JSON.stringify(game.snapshot()));
  }
  lines.push(JSON.stringify({type:'end',ticks:game.state.tick,state:game.state.state,score:game.state.score}));
  await writeFile(o.out,lines.join('\n')+'\n');
}
main().catch(e=>{console.error(e.message);process.exitCode=e instanceof FormatError?2:1;});
