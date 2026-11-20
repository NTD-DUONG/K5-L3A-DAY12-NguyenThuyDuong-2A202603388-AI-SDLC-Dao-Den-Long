import http from 'node:http';
import {readFile} from 'node:fs/promises';
const routes=new Map([
 ['/',new URL('../src/web/index.html',import.meta.url)],
 ['/main.mjs',new URL('../src/web/main.mjs',import.meta.url)],
 ['/style.css',new URL('../src/web/style.css',import.meta.url)],
 ['/phase2.css',new URL('../src/web/phase2.css',import.meta.url)],
 ['/core.mjs',new URL('../src/core/index.mjs',import.meta.url)],
 ['/terrain.mjs',new URL('../src/core/terrain.mjs',import.meta.url)],
 ['/night-maps.mjs',new URL('../src/core/night-maps.mjs',import.meta.url)],
 ['/audio.mjs',new URL('../src/web/audio.mjs',import.meta.url)],
 ['/palette.mjs',new URL('../src/web/palette.mjs',import.meta.url)],
 ['/game.contract.json',new URL('../game.contract.json',import.meta.url)],
 ['/three.module.js',new URL('../node_modules/three/build/three.module.js',import.meta.url)],
 ['/three.core.js',new URL('../node_modules/three/build/three.core.js',import.meta.url)]
]);
const types={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',mjs:'text/javascript; charset=utf-8',js:'text/javascript; charset=utf-8',json:'application/json'};
const port=Number(process.env.PORT??5173);
const server=http.createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname,file=routes.get(path);
 if(!file){res.writeHead(404);res.end('Not found');return;}
 try{const body=await readFile(file);res.writeHead(200,{'Content-Type':types[file.pathname.split('.').at(-1)],'Cache-Control':'no-store'});res.end(body);}
 catch{res.writeHead(500);res.end('Cannot load asset. Run npm install first.');}
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'Port '+port+' đang được dùng. Dừng server cũ hoặc đặt PORT khác.':e.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log('Đảo Đèn Lồng: http://127.0.0.1:'+port));
