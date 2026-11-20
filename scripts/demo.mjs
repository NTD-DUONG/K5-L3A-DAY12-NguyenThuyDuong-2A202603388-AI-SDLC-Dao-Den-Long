import {writeFile,mkdtemp,rm,access} from 'node:fs/promises';
import {tmpdir,platform} from 'node:os';import {join} from 'node:path';import {spawn} from 'node:child_process';
import {createApp} from './serve.mjs';
const began=performance.timeOrigin,o={};let app,child,profile,timer;
try{
 const args=process.argv.slice(2);
 for(let i=0;i<args.length;i+=2){if(!['--seed','--duration','--out','--no-open'].includes(args[i]))throw new Error('Invalid arguments');if(args[i]==='--no-open'){o.noOpen=true;i--;continue;}o[args[i]]=args[i+1];}
 const seed=Number(o['--seed']),duration=Number(o['--duration']);
 if(!Number.isSafeInteger(seed)||!Number.isFinite(duration)||duration<=0||!o['--out'])throw new Error('Require --seed INT --duration POSITIVE --out FILE');
 let finish;const completed=new Promise((r,j)=>{finish=r;timer=setTimeout(()=>j(new Error('No rendered benchmark report received. Open the printed URL in a GPU-capable browser.')),180000);});
 const config={seed,duration,started_at:began,os:platform(),vsync_off:false};
 app=await createApp({demoConfig:config,onDemoResult:async (bytes,mime)=>{
  if(mime!=='video/mp4')throw new Error('Expected actual MP4');await writeFile(o['--out'],bytes);const report={automatic:true,duration_s:duration,bytes:bytes.length,mime,seed,description:'Real canvas recording with automatic inputs; silent; no manual play claimed'};await writeFile('docs/proof/phase-4/demo.json',JSON.stringify(report,null,2)+'\n');finish(report);
 }});
 const url=app.url+'/?demo=1';console.log('Automatic real-game demo: '+url);
 if(!o.noOpen){
  const candidates=[process.env.LANTERN_BROWSER,
   ...(process.platform==='win32'?[join(process.env['ProgramFiles(x86)']??'C:/Program Files (x86)','Microsoft/Edge/Application/msedge.exe'),join(process.env.ProgramFiles??'C:/Program Files','Google/Chrome/Application/chrome.exe')]:
   process.platform==='darwin'?['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']:['/usr/bin/chromium','/usr/bin/chromium-browser','/usr/bin/google-chrome'])].filter(Boolean);
  let binary;for(const path of candidates){try{await access(path);binary=path;break;}catch{}}
  if(binary){config.vsync_off=true;config.background_throttling_disabled=true;profile=await mkdtemp(join(tmpdir(),'lantern-bench-'));child=spawn(binary,['--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--window-size=1280,720','--disable-frame-rate-limit','--disable-gpu-vsync','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--disable-features=CalculateNativeWinOcclusion','--app='+url],{stdio:'ignore'});child.on('error',e=>console.error(e.message));}
  else console.log('Open the URL manually. Set LANTERN_BROWSER to your Chromium/Edge executable to launch automatically.');
 }
 const report=await completed;console.log('Saved '+o['--out']+'; video bytes='+report.bytes);
}catch(e){console.error(e.message);process.exitCode=1;}
finally{
 clearTimeout(timer);if(app)await app.close();child?.kill();
 if(profile)await rm(profile,{recursive:true,force:true}).catch(()=>{});
}
