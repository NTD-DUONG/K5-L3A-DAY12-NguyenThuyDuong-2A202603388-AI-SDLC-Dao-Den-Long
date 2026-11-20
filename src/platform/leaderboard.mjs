import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {dirname} from 'node:path';
export const validName=name=>typeof name==='string'&&/^[A-Za-z0-9_]{3,12}$/.test(name);
export function validateEntry(e){
 if(!e||!validName(e.name)||!Number.isSafeInteger(e.score)||e.score<0||!Number.isInteger(e.nights_won)||e.nights_won<0||e.nights_won>3||!Number.isSafeInteger(e.seed))throw new Error('Invalid leaderboard entry');
 if(typeof e.achieved_at!=='string'||!/(Z|[+-]\d\d:\d\d)$/.test(e.achieved_at)||!Number.isFinite(Date.parse(e.achieved_at)))throw new Error('Invalid timestamp');
 return {name:e.name,score:e.score,nights_won:e.nights_won,achieved_at:e.achieved_at,seed:e.seed};
}
export const topTen=entries=>entries.map(validateEntry).sort((a,b)=>b.score-a.score||Date.parse(a.achieved_at)-Date.parse(b.achieved_at)).slice(0,10);
export async function readBoard(path){try{return {entries:topTen(JSON.parse(await readFile(path,'utf8')).entries)};}catch(e){if(e.code==='ENOENT')return {entries:[]};throw e;}}
export async function saveEntry(path,entry,now=new Date()){
 const old=await readBoard(path),entries=topTen([...old.entries,validateEntry({...entry,achieved_at:now.toISOString()})]);
 await mkdir(dirname(path),{recursive:true});const temp=path+'.tmp';await writeFile(temp,JSON.stringify({entries},null,2)+'\n');await rename(temp,path);return {entries};
}
