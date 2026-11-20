import {mkdir,cp,readdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';import {fileURLToPath} from 'node:url';import {deflateRawSync} from 'node:zlib';import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url)),folder=resolve(root,'artifacts/dao-den-long-v1.0.0');
await mkdir(folder,{recursive:true});
for(const name of ['src','scripts','tests','docs','package.json','package-lock.json','game.contract.json','README.md','LICENSE','CREDITS.md','AGENTS.md','CHANGELOG.md','Dockerfile','.dockerignore'])await cp(resolve(root,name),resolve(folder,name),{recursive:true});
await cp(resolve(root,'node_modules/three/LICENSE'),resolve(folder,'THREE-LICENSE.txt'));
await mkdir(resolve(folder,'node_modules/three'),{recursive:true});
await cp(resolve(root,'node_modules/three/build'),resolve(folder,'node_modules/three/build'),{recursive:true});
await cp(resolve(root,'node_modules/three/package.json'),resolve(folder,'node_modules/three/package.json'));
await cp(resolve(root,'node_modules/three/LICENSE'),resolve(folder,'node_modules/three/LICENSE'));
const table=Array.from({length:256},(_,i)=>{let n=i;for(let j=0;j<8;j++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
const crc=buffer=>{let c=0xffffffff;for(const byte of buffer)c=table[(c^byte)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
const entries=[];
async function walk(dir){for(const item of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,item.name);if(item.isDirectory())await walk(path);else entries.push({path,name:relative(folder,path).replaceAll('\\','/')});}}
await walk(folder);entries.sort((a,b)=>a.name.localeCompare(b.name));
const local=[],central=[];let offset=0;
for(const entry of entries){
 const name=Buffer.from(entry.name),raw=await readFile(entry.path),compressed=deflateRawSync(raw),checksum=crc(raw);
 const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt32LE(checksum,14);header.writeUInt32LE(compressed.length,18);header.writeUInt32LE(raw.length,22);header.writeUInt16LE(name.length,26);
 const center=Buffer.alloc(46);center.writeUInt32LE(0x02014b50,0);center.writeUInt16LE(20,4);center.writeUInt16LE(20,6);center.writeUInt16LE(0x800,8);center.writeUInt16LE(8,10);center.writeUInt32LE(checksum,16);center.writeUInt32LE(compressed.length,20);center.writeUInt32LE(raw.length,24);center.writeUInt16LE(name.length,28);center.writeUInt32LE(offset,42);
 local.push(header,name,compressed);central.push(center,name);offset+=header.length+name.length+compressed.length;
}
const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
const zip=Buffer.concat([...local,directory,end]),file=resolve(root,'artifacts/dao-den-long-v1.0.0.zip');await writeFile(file,zip);
await writeFile(file+'.sha256',createHash('sha256').update(zip).digest('hex')+'  dao-den-long-v1.0.0.zip\n');
console.log(file+' ('+zip.length+' bytes, '+entries.length+' files)');
