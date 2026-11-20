import http from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readBoard,saveEntry} from '../src/platform/leaderboard.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
export const boardPath=()=>resolve(process.env.LANTERN_DATA_DIR??resolve(root,'data'),'leaderboard.json');
const paths={'/':'src/web/index.html','/main.mjs':'src/web/main.mjs','/style.css':'src/web/style.css','/phase2.css':'src/web/phase2.css',
 '/phase4.css':'src/web/phase4.css','/features.mjs':'src/web/features.mjs','/core.mjs':'src/core/index.mjs','/index.mjs':'src/core/index.mjs',
 '/terrain.mjs':'src/core/terrain.mjs','/night-maps.mjs':'src/core/night-maps.mjs','/audio.mjs':'src/web/audio.mjs',
 '/palette.mjs':'src/web/palette.mjs','/input.mjs':'src/web/input.mjs','/benchmark-core.mjs':'src/core/benchmark.mjs',
 '/game.contract.json':'game.contract.json','/three.module.js':'node_modules/three/build/three.module.js','/three.core.js':'node_modules/three/build/three.core.js'};
const types={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',mjs:'text/javascript; charset=utf-8',js:'text/javascript; charset=utf-8',json:'application/json'};
async function body(req){let text='';for await(const part of req){text+=part;if(text.length>32768)throw new Error('Request too large');}return JSON.parse(text);}
export async function createApp({port=0,host='127.0.0.1',dataFile=boardPath(),benchConfig=null,onBenchResult=null,demoConfig=null,onDemoResult=null}={}){
 let queue=Promise.resolve();
 const server=http.createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  const json=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
  try{
   if(path==='/api/leaderboard'){
    if(req.method==='GET')return json(200,await readBoard(dataFile));
    if(req.method==='POST'){
     if(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host)return json(403,{error:'Origin mismatch'});
     const entry=await body(req);const job=queue.then(()=>saveEntry(dataFile,entry));queue=job.catch(()=>{});
     return json(200,await job);
    }
    return json(405,{error:'Method not allowed'});
   }
   if(path==='/api/benchmark'&&benchConfig){
    if(req.method==='GET')return json(200,benchConfig);
    if(req.method==='POST'){
     const report=await body(req);
     for(const key of ['avg_fps','p1_low_fps','frame_ms_p95','frames','load_ms'])if(!Number.isFinite(report[key])||report[key]<0)throw new Error('Invalid benchmark report');
     json(200,{saved:true});await onBenchResult?.(report);return;
    }
   }
   if(path==='/api/demo'&&demoConfig){
    if(req.method==='GET')return json(200,demoConfig);
    if(req.method==='POST'){
     const parts=[];let size=0;for await(const part of req){size+=part.length;if(size>96000000)throw new Error('Video too large');parts.push(part);}
     await onDemoResult?.(Buffer.concat(parts),req.headers['content-type']);return json(200,{saved:true});
    }
   }
   const asset=paths[path];if(!asset){res.writeHead(404);res.end('Not found');return;}
   const bytes=await readFile(resolve(root,asset));res.writeHead(200,{'Content-Type':types[asset.split('.').at(-1)],'Cache-Control':'no-store'});res.end(bytes);
  }catch(e){json(e.code==='ENOENT'?404:400,{error:e.message});}
 });
 await new Promise((done,reject)=>{server.once('error',reject);server.listen(port,host,done);});
 return {server,url:'http://127.0.0.1:'+server.address().port,close:()=>new Promise(r=>server.close(r))};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const index=process.argv.indexOf('--export-leaderboard');
  if(index>=0){if(!process.argv[index+1])throw new Error('Missing export path');await writeFile(process.argv[index+1],JSON.stringify(await readBoard(boardPath()),null,2)+'\n');}
  else{const app=await createApp({port:Number(process.env.PORT??5173),host:process.env.HOST??'127.0.0.1'});console.log('Đảo Đèn Lồng: '+app.url);}
 }catch(e){console.error(e.message);process.exitCode=1;}
}
