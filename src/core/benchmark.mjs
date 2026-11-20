import {createGame} from './index.mjs';
export function benchmarkScenario(seed=42){
 let s=seed>>>0;const rand=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
 const rotation=rand()*Math.PI*2;
 const points=(n,y)=>Array.from({length:n},(_,i)=>{const a=rotation+i*2.399963229728653,r=38*Math.sqrt((i+.5)/n);return [Math.cos(a)*r,y,Math.sin(a)*r];});
 return {random_motes:false,random_shades:false,random_drifters:false,wind_enabled:false,
 player:{pos:[0,0,0]},motes:points(100,0),shades:points(200,.8).map((pos,i)=>({id:'S'+(i+1),pos,state:'wander'})),
 lanterns:['L1','L2','L3'].map(id=>({id,lit:true,fuel:100}))};
}
export const createBenchmark=(t,seed)=>createGame(t,seed,benchmarkScenario(seed),1,{benchmark:true});
export function frameStats(values){
 if(!values.length||values.some(x=>!Number.isFinite(x)||x<=0))throw new Error('Invalid frame times');
 const sorted=[...values].sort((a,b)=>a-b),n=values.length,k=Math.max(1,Math.ceil(n*.01));
 return {avg_fps:1000*n/values.reduce((a,b)=>a+b,0),p1_low_fps:1000/(sorted.slice(-k).reduce((a,b)=>a+b,0)/k),frame_ms_p95:sorted[Math.ceil(.95*n)-1],frames:n};
}
