import * as THREE from '/three.module.js';
import {createGame,DT} from '/core.mjs';
import {palette as C} from '/palette.mjs';
import {createAudio} from '/audio.mjs';
import {loadPreferences} from '/input.mjs';
import {installFeatures,loadLeaderboard,saveScore} from '/features.mjs';
import {createBenchmark,frameStats} from '/benchmark-core.mjs';
const $=id=>document.getElementById(id);
const benchMode=new URL(location.href).searchParams.has('bench');
let demoPaint=null;
const demoMode=new URL(location.href).searchParams.has('demo');
const benchConfig=benchMode?await fetch('/api/benchmark').then(r=>r.json()):null;
const {tuning:t}=await fetch('/game.contract.json').then(r=>r.json());
const settings=benchMode?loadPreferences({getItem:()=>null}):loadPreferences(localStorage);
const audio=createAudio(settings);
for(const key of ['volume','sensitivity']){$(key).value=settings[key];$(key).oninput=()=>{settings[key]=Number($(key).value);try{localStorage.setItem('lantern-settings',JSON.stringify(settings));}catch{}};}
const renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
const scene=new THREE.Scene();scene.background=new THREE.Color(C.sky);scene.fog=new THREE.FogExp2(C.fog,.009);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,250);
const ambient=new THREE.AmbientLight('#ffffff',.15);scene.add(ambient);
const moon=new THREE.DirectionalLight('#bbcaff',1.4);moon.position.set(-30,50,10);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);Object.assign(moon.shadow.camera,{left:-65,right:100,top:60,bottom:-60,far:150});moon.shadow.bias=-.001;scene.add(moon);
const mat=(c,extra={})=>new THREE.MeshStandardMaterial({color:c,roughness:.85,...extra});
const geo={sphere:new THREE.SphereGeometry(1,12,8),cylinder:new THREE.CylinderGeometry(1,1,1,24),cone:new THREE.ConeGeometry(1,1,16),box:new THREE.BoxGeometry(1,1,1),mote:new THREE.IcosahedronGeometry(.12,0)};
const materials={grass:mat(C.grass),sand:mat(C.sand),wood:mat(C.wood),cloud:mat(C.cloud),mote:mat(C.mote,{emissive:C.halo,emissiveIntensity:1.8}),shade:mat(C.shade,{emissive:C.rim,emissiveIntensity:.25}),stun:mat(C.stunned),drifter:mat(C.drifter,{emissive:C.drifter,emissiveIntensity:.3}),charm:mat(C.scarf),gold:mat(C.gold)};
materials.rim=new THREE.MeshBasicMaterial({color:C.rim,side:THREE.BackSide});
materials.eyes=new THREE.MeshBasicMaterial({color:C.rim});
function applyAccessibleColors(){
 const color=settings.colorblind?'#00B3FF':C.rim;
 materials.rim.color.set(color);materials.eyes.color.set(color);materials.shade.emissive.set(color);
 document.body.classList.toggle('colorblind',settings.colorblind);
 document.body.classList.toggle('reduced-motion',settings.reducedMotion);
 document.body.classList.toggle('large-text',settings.largeText);
}
$('colorblind').checked=settings.colorblind;
$('colorblind').onchange=()=>{settings.colorblind=$('colorblind').checked;applyAccessibleColors();try{localStorage.setItem('lantern-settings',JSON.stringify(settings));}catch{}};
applyAccessibleColors();
function mesh(shape,material,parent,pos=[0,0,0],scale=[1,1,1]){
 const m=new THREE.Mesh(shape,material);m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
let world=new THREE.Group();scene.add(world);
const player=new THREE.Group();scene.add(player);
mesh(geo.cylinder,mat(C.shirt),player,[0,.8,0],[.32,1,.3]);mesh(geo.sphere,mat('#efc394'),player,[0,1.5,0],[.3,.32,.3]);
mesh(geo.cone,mat(C.sand),player,[0,1.85,0],[.7,.35,.7]);mesh(geo.cylinder,mat(C.sand),player,[0,1.68,0],[.7,.03,.7]);
mesh(geo.box,mat(C.scarf),player,[0,1.18,0],[.7,.12,.64]);
mesh(geo.sphere,materials.mote,player,[.5,.9,0],[.16,.23,.16]);
const legs=[-.17,.17].map(x=>mesh(geo.cylinder,mat('#27333b'),player,[x,.23,0],[.11,.46,.12]));
const glow=new THREE.PointLight(C.lit,8,8,2);glow.position.set(0,1.5,0);player.add(glow);
let pools={},lamps=[],pulseRing,leaves=[],game=createGame(t,12,{},1),night=1,total=0,stage='menu',yaw=0,last=0,acc=0,pulseAt=-10,hitUntil=0,toastUntil=0,lastSecond=-1;
let benchmark=null;
let standardBench=null,spawnCue=null,pendingEntry=null,recorder=null,recordStopTimer=null,shadeMeshes=null;
const benchVisibility={hidden_at:null,hidden_ms:0,focus_losses:0};
document.addEventListener('visibilitychange',()=>{if(!benchMode)return;if(document.hidden)benchVisibility.hidden_at=performance.now();else if(benchVisibility.hidden_at!==null){benchVisibility.hidden_ms+=performance.now()-benchVisibility.hidden_at;benchVisibility.hidden_at=null;}});
addEventListener('blur',()=>{if(benchMode)benchVisibility.focus_losses++;});
let nightsWon=0;const campaignSeed=12;
const keys=new Set(),mapCtx=$('map').getContext('2d');
const names=['Đảo Bến','Hai bờ tre','Tháp Bình Minh'];
const words=['Đèn có thể cạn dầu. Hãy giữ ít nhất 3 trong 5 đèn sáng tới bình minh, và nhớ quay lại châm dầu.','Giữ ít nhất 4 trong 6 đèn sáng. Đèn dưới 30 dầu mất vùng an toàn: hãy coi chừng Bóng Mực hút dầu.','Giữ ít nhất 5 trong 7 đèn sáng tới bình minh. Thắp lại chỉ tốn 5 đom đóm; mỗi lần thắp thành công giúp con mang nhiều hơn.'];
function clearWorld(){scene.remove(world);world.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.isMesh&&!Object.values(geo).includes(o.geometry))o.geometry.dispose();if(o.isMesh&&!Object.values(materials).includes(o.material))o.material.dispose();});world=new THREE.Group();scene.add(world);pools={motes:new Map(),shades:new Map(),drifters:new Map(),charms:new Map()};lamps=[];shadeMeshes=null;}
function buildWorld(){
 clearWorld();const map=game.state.map;
 pulseRing=mesh(new THREE.RingGeometry(.94,1,48),new THREE.MeshBasicMaterial({color:C.halo,transparent:true,opacity:0,side:THREE.DoubleSide}),world);pulseRing.rotation.x=-Math.PI/2;
 leaves=Array.from({length:16},()=>mesh(geo.box,materials.sand,world,[0,0,0],[.15,.02,.3]));
 for(const island of map.islands){
  mesh(geo.cylinder,materials.cloud,world,[island.center[0],-2,island.center[2]],[island.radius,4,island.radius]);
  mesh(geo.cylinder,materials.grass,world,[island.center[0],-.05,island.center[2]],[island.radius,.1,island.radius]);
 }
 for(const b of map.bridges)mesh(geo.box,materials.wood,world,[(b.minX+b.maxX)/2,-.15,0],[b.maxX-b.minX,.3,b.maxZ-b.minZ]);
 for(const level of map.levels??[]){
  let shape;
  if(level.minRadius===0)shape=new THREE.CylinderGeometry(level.maxRadius,level.maxRadius,level.y,48);
  else{
   const outline=new THREE.Shape();outline.absarc(0,0,level.maxRadius,0,Math.PI,false);outline.absarc(0,0,level.minRadius,Math.PI,0,true);
   shape=new THREE.ExtrudeGeometry(outline,{depth:level.y,bevelEnabled:false,curveSegments:32});shape.rotateX(Math.PI/2);
   mesh(shape,materials.grass,world,[0,level.y,0]);continue;
  }
  mesh(shape,materials.grass,world,[0,level.y/2,0]);
 }
 for(const r of map.ramps){
  const ramp=new THREE.Group();ramp.rotation.y=-r.angle*Math.PI/180;world.add(ramp);
  const verts=new Float32Array([24,3,-1.5,30,0,-1.5,30,0,1.5,24,3,-1.5,30,0,1.5,24,3,1.5]);
  const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.BufferAttribute(verts,3));geom.computeVertexNormals();
  mesh(geom,new THREE.MeshStandardMaterial({color:C.sand,side:THREE.DoubleSide}),ramp);
 }
 for(const tower of map.towers){
  mesh(geo.cylinder,materials.wood,world,[tower.pos[0],tower.pos[1]+tower.height/2,tower.pos[2]],[tower.radius,tower.height,tower.radius]);
  mesh(geo.cone,materials.gold,world,[tower.pos[0],tower.pos[1]+tower.height+.5,tower.pos[2]],[3,1,3]);
 }
 for(const pad of map.pads){const m=mesh(new THREE.TorusGeometry(pad.radius,.13,8,24),materials.gold,world,[pad.pos[0],pad.pos[1]+.12,pad.pos[2]]);m.rotation.x=Math.PI/2;}
 if(!benchMode)for(const island of map.islands)for(let i=0;i<14;i++){
  const a=i*2.39996,r=island.radius-3,x=island.center[0]+Math.cos(a)*r,z=Math.sin(a)*r;
  mesh(geo.sphere,materials.sand,world,[x,.3,z],[.6,.45,.8]);
 }
 if(!benchMode)for(let i=0;i<20;i++){const a=i*2.39996,r=50+i%4*6;mesh(geo.sphere,materials.cloud,world,[Math.cos(a)*r+20,-5,Math.sin(a)*r],[7,2,4]);}
 for(const l of game.state.lanterns){
  const group=new THREE.Group();group.position.set(...l.pos);world.add(group);
  mesh(geo.cylinder,materials.wood,group,[0,1.25,0],[.16,2.5,.16]);
  const body=mesh(geo.sphere,mat(C.unlit,{emissive:C.core,emissiveIntensity:0}),group,[0,2.7,0],[.6,.8,.6]);
  mesh(geo.cone,materials.wood,group,[0,3.5,0],[.85,.4,.85]);
  const light=new THREE.PointLight(C.lit,0,18,2);light.position.y=2.8;group.add(light);
  const zone=mesh(new THREE.RingGeometry(5.94,6,64),new THREE.MeshBasicMaterial({color:C.gold,transparent:true,opacity:0,side:THREE.DoubleSide}),group,[0,.03,0]);zone.rotation.x=-Math.PI/2;
  const fuelGroup=new THREE.Group();fuelGroup.position.y=3.95;group.add(fuelGroup);
  const barBack=mesh(geo.box,materials.wood,fuelGroup,[0,0,0],[1.4,.13,.1]);
  const bar=mesh(geo.box,materials.gold,fuelGroup,[0,0,.07],[1.35,.09,.08]);
  const tears=new THREE.Group();group.add(tears);
  const tearMaterial=new THREE.MeshBasicMaterial({color:C.shade});
  for(const [x,a]of [[-.15,.6],[.1,-.5]]){const tear=mesh(geo.box,tearMaterial,tears,[x,2.7,.58],[.045,.5,.03]);tear.rotation.z=a;}
  lamps.push({body,light,zone,bar,barBack,tears,fuelGroup});
 }
}
function toast(text){$('toast').textContent=text;toastUntil=performance.now()+2500;}
function card(title,body,label,action){
 $('score-form').hidden=true;pendingEntry=null;
 $('card-title').textContent=title;$('card-body').textContent=body;$('start').textContent=label;$('start').disabled=false;$('start').onclick=()=>{audio.init();action();};
 $('overlay').hidden=false;$('restart').hidden=true;$('menu').hidden=stage==='menu';$('settings-panel').hidden=true;
}
function menu(){stage='menu';keys.clear();audio.setPaused(true);$('leaderboard-panel').hidden=true;card('Ba đêm giữ lửa.','Gom đom đóm, vượt cầu tre, lên tháp chuông và đưa ánh sáng trở về đảo.','Bắt đầu',()=>{total=0;nightsWon=0;intro(1);});}
function intro(n){night=n;stage='intro';card('Đêm '+n+' · '+names[n-1],'Ông Đăng: “'+words[n-1]+'”','Vào Đêm '+n,()=>start(n));}
function start(n){
 night=n;game=createGame(t,12,{},night);buildWorld();yaw=0;acc=0;keys.clear();lastSecond=-1;stage='playing';pulseAt=-10;hitUntil=0;
 $('overlay').hidden=true;audio.setPaused(false);$('night-title').textContent='Đêm '+night+' / '+names[night-1];camera.position.set(0,8,11);toast(words[night-1]);
}
function pause(){
 if(benchMode)return;
 if(!['playing','paused'].includes(stage))return;
 if(benchmark){benchmark=null;toast('Đã hủy phép đo FPS do tạm dừng. Hãy đo lại trong 30 giây chơi liên tục.');}
 game.step({pause:true});game.state.input.pause=false;
 if(game.state.state==='paused'){stage='paused';audio.setPaused(true);card('Nghỉ một chút.','Thời gian, hồi chiêu và mọi sinh vật đang chờ Mây.','Tiếp tục',pause);$('restart').hidden=false;}
 else{stage='playing';audio.setPaused(false);$('overlay').hidden=true;}
 keys.clear();acc=0;
}
$('settings').onclick=()=>$('settings-panel').hidden=!$('settings-panel').hidden;
$('restart').onclick=()=>start(night);$('menu').onclick=menu;
function events(items){
 for(const e of items){
  audio.play(e.name);
  if(e.name==='shade_spawned'){const shade=game.state.shades.find(s=>s.id===e.data.id);if(shade)spawnCue={pos:[...shade.pos],until:performance.now()+4000};toast('⚠ Bóng Mực xuất hiện');}
  if(e.name==='lantern_lit')toast(e.data.relight?'Đã thắp lại đèn. Sức chứa tăng!':'Đèn đã sáng. Nhớ quay lại châm dầu.');
  if(e.name==='refuel')toast('Đã châm '+e.data.amount+' đom đóm · Dầu '+e.data.fuel.toFixed(1)+'/100.');
  if(e.name==='lantern_out')toast('⚠ '+e.data.lantern_id+' đã cạn dầu. Thắp lại cần 5 đom đóm.');
  if(e.name==='pulse')pulseAt=performance.now();
  if(e.name==='player_hit'){hitUntil=performance.now()+500;toast(e.data.by==='fall'?'Mây rơi xuống biển mây.':'Bóng Mực chạm vào Mây.');}
  if(e.name==='drifter_steal')toast('Gió Lạc vừa cướp '+e.data.amount+' đom đóm!');
  if(e.name==='charm_picked')toast('Bùa Gió · Chạy nhanh và lướt không hồi chiêu trong 10 giây.');
  if(e.name==='game_over'){
   const won=e.data.result==='won';keys.clear();stage='result';audio.play(won?'won':'lost');
   if(won){total+=game.state.score;nightsWon++;}
   if(won&&night===3)card('Bình Minh.','Cả ba đêm đã sáng. Tổng điểm: '+total+'.','Về menu',menu);
   else if(won)card('Đã giữ sáng tới bình minh.','Điểm Đêm '+night+': '+game.state.score+'. Tổng các đêm đã thắng: '+total+'.','Đêm tiếp theo',()=>intro(night+1));
   else card('Mây cần nghỉ một chút.',(e.data.reason==='dawn'?'Bình minh đã đến nhưng chưa đủ đèn đang sáng.':'Ngọn lửa cuối cùng đã tắt.')+' Điểm đêm thua không cộng vào tổng.','Chơi lại Đêm '+night,()=>start(night));
   if(!won||night===3){pendingEntry={score:total,nights_won:nightsWon,seed:campaignSeed};$('score-form').hidden=false;$('save-score').disabled=false;$('score-status').textContent='';}
   if(!won||night===3){pendingEntry={score:total,nights_won:nightsWon,seed:campaignSeed};$('score-form').hidden=false;$('save-score').disabled=false;$('score-status').textContent='Lưu tổng điểm các Đêm đã thắng: '+total;}
  }
 }
}
const down=benchMode?()=>false:installFeatures({settings,keys,pause,onPreferences:applyAccessibleColors,onLeaderboard:showLeaderboard,onRecord:recordDemo});
$('close-leaderboard').onclick=menu;
$('score-form').onsubmit=async e=>{
 e.preventDefault();if(!pendingEntry)return;
 const name=$('player-name').value;if(!/^[A-Za-z0-9_]{3,12}$/.test(name)){$('score-status').textContent='Tên cần 3–12 chữ, số hoặc _.';return;}
 $('save-score').disabled=true;
 try{await saveScore({...pendingEntry,name});pendingEntry=null;$('score-status').textContent='Đã lưu điểm trên máy.';}
 catch(error){$('score-status').textContent=error.message;$('save-score').disabled=false;}
};
async function showLeaderboard(){
 if(stage==='playing')pause();$('overlay').hidden=true;$('leaderboard-panel').hidden=false;
 try{
  const {entries}=await loadLeaderboard(),table=document.createElement('table');
  const header=table.createTHead().insertRow();for(const name of ['Tên','Điểm','Đêm thắng']){const cell=document.createElement('th');cell.textContent=name;header.append(cell);}
  for(const entry of entries){const row=table.insertRow();for(const value of [entry.name,entry.score,entry.nights_won])row.insertCell().textContent=String(value);}
  $('leaderboard-rows').replaceChildren(entries.length?table:document.createTextNode('Chưa có điểm được lưu.'));
 }catch(error){$('leaderboard-rows').textContent=error.message;}
}
async function recordDemo(){
 if(recorder?.state==='recording'){recorder.stop();return;}
 try{
  const stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:30},audio:true});
  const type=MediaRecorder.isTypeSupported('video/mp4')?'video/mp4':'video/webm';
  const chunks=[];recorder=new MediaRecorder(stream,{mimeType:type});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  recorder.onstop=()=>{clearTimeout(recordStopTimer);stream.getTracks().forEach(track=>track.stop());const url=URL.createObjectURL(new Blob(chunks,{type})),a=document.createElement('a');a.href=url;a.download='demo.'+(type==='video/mp4'?'mp4':'webm');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('record-demo').textContent='Quay demo màn chơi';};
  stream.getVideoTracks()[0].onended=()=>{if(recorder.state==='recording')recorder.stop();};
  recorder.start(1000);recordStopTimer=setTimeout(()=>{if(recorder.state==='recording')recorder.stop();},290000);$('record-demo').textContent='Dừng quay và tải demo';toast('Đang quay phần màn hình bạn đã chọn; bấm Dừng quay để lưu.');
 }catch(error){toast('Chưa quay được: '+error.message);}
}
addEventListener('blur',()=>{keys.clear();if(stage==='playing')pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&stage==='playing')pause();});
let dragging=false,lastX=0;
$('world').onpointerdown=e=>{dragging=true;lastX=e.clientX;$('world').setPointerCapture(e.pointerId);};
$('world').onpointermove=e=>{if(dragging){yaw-=(e.clientX-lastX)*.006*settings.sensitivity;lastX=e.clientX;}};
$('world').onpointerup=$('world').onpointercancel=()=>dragging=false;
function pool(kind,items,make){
 const group=pools[kind],active=new Set(items.map(x=>x.id));
 for(const [id,m]of group)if(!active.has(id)){world.remove(m);group.delete(id);}
 for(const item of items){let m=group.get(item.id);if(!m){m=make();group.set(item.id,m);}m.position.set(...item.pos);}
}
function sync(){
 const s=game.state,p=s.player,seconds=Math.ceil(s.time_left_s),lit=s.lanterns.filter(l=>l.lit).length;
 player.position.set(...p.pos);player.visible=p.respawn===0&&!(p.invuln>0&&s.sim_tick%10<4);player.rotation.y=Math.atan2(p.facing[0],p.facing[2]);
 legs.forEach((m,i)=>m.rotation.x=stage==='playing'&&Math.hypot(p.vel[0],p.vel[2])>.1?Math.sin(s.sim_tick*.2+i*Math.PI)*.4:0);
 ambient.intensity=.15+.55*lit/s.lanterns.length;
 s.lanterns.forEach((l,i)=>{
  const m=lamps[i],fuel=l.fuelUnits/60,blink=l.lit&&fuel<t.low_fuel_threshold,visible=!blink||s.sim_tick%60<30;
  m.body.material.color.set(l.lit?C.lit:C.unlit);m.body.material.emissiveIntensity=l.lit&&visible?2:0;
  m.body.scale.y=l.lit?.8:.64;m.body.visible=!l.lit||visible;m.tears.visible=!l.lit;
  m.light.intensity=l.lit&&visible?40:0;m.zone.material.opacity=l.lit&&fuel>=30?.3:0;
  m.barBack.visible=l.lit;m.bar.visible=l.lit&&visible;m.bar.scale.x=1.35*Math.max(.001,fuel/t.fuel_max);m.bar.position.x=-(1.35-m.bar.scale.x)/2;m.fuelGroup.quaternion.copy(camera.quaternion);
 });
 pool('motes',s.motes,()=>mesh(geo.mote,materials.mote,world));
 for(const m of s.motes)pools.motes.get(m.id).position.y=m.pos[1]+.5+Math.sin(s.sim_tick*.05)*.1;
 renderShades(s.shades,p.pos);
 pool('drifters',s.drifters,()=>{const group=new THREE.Group();world.add(group);for(let i=0;i<5;i++)mesh(geo.box,materials.drifter,group,[(i-2)*.3,Math.sin(i)*.08,0],[.32,.07,.24]);return group;});
 pool('charms',s.charms,()=>{const group=new THREE.Group();world.add(group);mesh(geo.box,materials.gold,group,[0,0,0],[.46,.7,.07]);mesh(geo.box,materials.charm,group,[0,0,.015],[.36,.6,.08]);return group;});
 for(const c of s.charms){const m=pools.charms.get(c.id);m.visible=c.available;m.position.y=c.pos[1]+.65;m.rotation.y=s.sim_tick*.03;}
 if(benchMode)return;
 $('health').textContent='● '.repeat(Math.max(0,p.flames))+'○ '.repeat(Math.max(0,3-p.flames));$('carry').textContent=p.carried+' / '+p.capacity;$('lit').textContent=lit+' / '+s.lanterns.length+' · cần '+Math.ceil(t.win_ratio*s.lanterns.length);$('score').textContent=s.score+' / '+total;
 $('time').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');$('time').classList.toggle('urgent',seconds<=30);
 $('mote-bar').innerHTML=Array.from({length:p.capacity},(_,i)=>'<i class="'+(i<p.carried?'filled':'')+'"></i>').join('');
 $('charm').textContent=p.charm>0?'Bùa Gió '+(p.charm/60).toFixed(1)+'s':'';
 $('cooldowns').textContent='◈ LƯỚT '+(p.charm>0?'Sẵn sàng':p.dashCd>0?(p.dashCd/60).toFixed(1)+'s':'Sẵn sàng')+' · ☀ TỎA SÁNG '+(p.pulseCd>0?(p.pulseCd/60).toFixed(1)+'s':'Sẵn sàng');
 const unlit=s.lanterns.filter(l=>!l.lit||l.fuelUnits<t.fuel_max*60).sort((a,b)=>Math.hypot(a.pos[0]-p.pos[0],a.pos[2]-p.pos[2])-Math.hypot(b.pos[0]-p.pos[0],b.pos[2]-p.pos[2]));
 const closest=unlit[0],d=closest?Math.hypot(closest.pos[0]-p.pos[0],closest.pos[2]-p.pos[2]):Infinity;
 $('prompt').textContent=d<=2?(closest.lit?'E — Châm dầu ('+(closest.fuelUnits/60).toFixed(1)+'/100)':'E — Nạp ánh sáng ('+closest.deposited+'/'+(closest.ever_lit?t.relight_cost:t.lantern_cost)+')'):s.wind.warning?'Lá đang bay · Gió mạnh sắp tới':s.wind.active?'Gió mạnh đang thổi':'';
 $('arrow').hidden=true;
 const guide=unlit.find(l=>!l.lit)??unlit.find(l=>l.fuelUnits<t.low_fuel_threshold*60);
 if(guide&&stage==='playing'){
  const v=new THREE.Vector3(...guide.pos).add(new THREE.Vector3(0,2,0)).project(camera),guideDistance=Math.hypot(guide.pos[0]-p.pos[0],guide.pos[2]-p.pos[2]);
  if(v.z>1||Math.abs(v.x)>.9||Math.abs(v.y)>.9){$('arrow').hidden=false;const angle=Math.atan2(guide.pos[0]-p.pos[0],guide.pos[2]-p.pos[2])-yaw;$('arrow-label').textContent=guide.id+' · '+Math.round(guideDistance)+' m';$('arrow-icon').style.transform='rotate('+(-angle*180/Math.PI+90)+'deg)';}
 }
 mapCtx.clearRect(0,0,180,180);const scale=night===2?1.3:1.7,cx=night===2?35:0;
 const dot=(pos,r,color)=>{mapCtx.fillStyle=color;mapCtx.beginPath();mapCtx.arc(90+(pos[0]-cx)*scale,90-pos[2]*scale,r,0,Math.PI*2);mapCtx.fill();};
 for(const i of s.map.islands)dot(i.center,i.radius*scale,C.grass);
 for(const l of s.lanterns)dot(l.pos,4,l.lit?C.lit:C.unlit);for(const x of s.shades)dot(x.pos,2,C.rim);for(const x of s.drifters)dot(x.pos,2,C.drifter);dot(p.pos,3,C.text);
 const weak=s.lanterns.filter(l=>l.lit&&l.fuelUnits<30*60);
 $('visual-cues').textContent=[s.wind.warning?'⚠ Gió sắp thổi trong 2 giây':s.wind.active?'⚠ Gió mạnh':'',seconds<=10?'⚠ Còn '+seconds+' giây tới bình minh':'',weak.length?'⚠ Đèn ít dầu: '+weak.map(l=>l.id).join(', '):''].filter(Boolean).join('\n');
 $('spawn-cue').hidden=!spawnCue||performance.now()>spawnCue.until;
 if(spawnCue){const a=Math.atan2(spawnCue.pos[0]-p.pos[0],spawnCue.pos[2]-p.pos[2])-yaw;$('spawn-arrow').style.transform='rotate('+(-a*180/Math.PI+90)+'deg)';}
}
const shadeDummy=new THREE.Object3D(),shadeColor=new THREE.Color();
function renderShades(items,playerPos){
 if(!shadeMeshes||shadeMeshes.capacity<items.length){
  if(shadeMeshes){for(const m of shadeMeshes.meshes){world.remove(m);m.dispose();}shadeMeshes.body.material.dispose();}
  const capacity=Math.max(16,items.length),bodyMaterial=materials.shade.clone();bodyMaterial.color.set('#ffffff');bodyMaterial.emissiveIntensity=0;
  const body=new THREE.InstancedMesh(geo.sphere,bodyMaterial,capacity),rim=new THREE.InstancedMesh(geo.sphere,materials.rim,capacity),eyes=new THREE.InstancedMesh(geo.sphere,materials.eyes,capacity*2);
  body.castShadow=true;body.receiveShadow=true;for(const m of [body,rim,eyes]){m.frustumCulled=false;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);world.add(m);}
  shadeMeshes={capacity,body,rim,eyes,meshes:[body,rim,eyes]};
 }
 const {body,rim,eyes}=shadeMeshes;body.count=rim.count=items.length;eyes.count=items.length*2;
 items.forEach((s,i)=>{
  const yaw=Math.atan2(playerPos[0]-s.pos[0],playerPos[2]-s.pos[2]);
  shadeDummy.position.set(...s.pos);shadeDummy.rotation.set(0,yaw,0);shadeDummy.scale.set(.65,.8,.65);shadeDummy.updateMatrix();body.setMatrixAt(i,shadeDummy.matrix);body.setColorAt(i,shadeColor.set(s.state==='stunned'?C.stunned:C.shade));
  shadeDummy.scale.set(.69,.84,.69);shadeDummy.updateMatrix();rim.setMatrixAt(i,shadeDummy.matrix);
  for(let eye=0;eye<2;eye++){const x=eye===0?-.22:.22;shadeDummy.position.set(s.pos[0]+Math.cos(yaw)*x+Math.sin(yaw)*.56,s.pos[1]+.2,s.pos[2]-Math.sin(yaw)*x+Math.cos(yaw)*.56);shadeDummy.scale.set(.07,.09,.04);shadeDummy.updateMatrix();eyes.setMatrixAt(i*2+eye,shadeDummy.matrix);}
 });
 for(const m of shadeMeshes.meshes)m.instanceMatrix.needsUpdate=true;if(body.instanceColor)body.instanceColor.needsUpdate=true;
}
$('benchmark').onclick=()=>{
 audio.init();start(night);renderer.setPixelRatio(1);renderer.setSize(1280,720,false);camera.aspect=1280/720;camera.updateProjectionMatrix();
 benchmark={start:performance.now(),frames:0};toast('Đang đo FPS 1280×720 trong 30 giây; giữ tab mở và chơi bình thường.');
};
function saveBenchmark(now){
 if(!benchmark)return;
 if(stage!=='playing'){benchmark=null;toast('Phép đo FPS bị hủy vì Đêm đã kết thúc hoặc đã về menu.');return;}
 benchmark.frames++;
 if(now-benchmark.start>=30000){
  const result={resolution:[1280,720],seconds:(now-benchmark.start)/1000,frames:benchmark.frames,average_fps:benchmark.frames/((now-benchmark.start)/1000),user_agent:navigator.userAgent};
  const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='phase-2-fps.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);benchmark=null;toast('Đã tải kết quả đo FPS.');
 }
}
function frame(now){
 requestAnimationFrame(frame);const delta=last?Math.min(.1,(now-last)/1000):0;last=now;
 if(benchMode){runStandardBenchmark(now,delta);return;}
 if(stage==='playing'){
  acc+=delta;
  while(acc>=DT){
   const mapped=new Set(Object.values(settings.bindings));yaw+=(Number(keys.has('ArrowLeft')&&!mapped.has('ArrowLeft'))-Number(keys.has('ArrowRight')&&!mapped.has('ArrowRight')))*1.6*DT;
const jump=down('jump');if(jump&&!game.state.input.jump&&game.state.player.grounded)audio.play('jump');
   events(game.step(demoMode?demoInput():{move:[Number(down('right'))-Number(down('left')),Number(down('backward'))-Number(down('forward'))],cam_yaw_deg:yaw*180/Math.PI,jump,interact:down('interact'),pulse:down('pulse'),dash:down('dash'),pause:false}));
   acc-=DT;if(stage!=='playing')break;
  }
  const sec=Math.ceil(game.state.time_left_s);if(sec!==lastSecond){lastSecond=sec;if(sec<=10&&sec>0)audio.play('countdown');}
  if(game.state.wind.warning&&game.state.sim_tick%60===0)audio.play('wind');
 }
 sync();const p=game.state.player.pos;camera.position.lerp(new THREE.Vector3(p[0]+Math.sin(yaw)*11,p[1]+8,p[2]+Math.cos(yaw)*11),settings.reducedMotion?1:1-Math.exp(-delta*8));camera.lookAt(p[0],p[1]+1,p[2]);
 glow.intensity=performance.now()-pulseAt<350?30:8;
 const age=(now-pulseAt)/600;pulseRing.material.opacity=age>=0&&age<1?(1-age)*.8:0;pulseRing.scale.setScalar(Math.max(.01,Math.min(age,1))*5);pulseRing.position.set(p[0],p[1]+.05,p[2]);
 leaves.forEach((m,i)=>{m.visible=game.state.wind.warning||game.state.wind.active;m.position.set(p[0]+Math.sin(now*.002+i)*5,p[1]+1+i%3,p[2]+Math.cos(now*.002+i)*5);m.rotation.y=now*.003+i;});
 $('toast').style.opacity=now<toastUntil?'1':'0';$('hit').style.opacity=!settings.reducedMotion&&now<hitUntil?'.6':'0';
 renderer.render(scene,camera);demoPaint?.();saveBenchmark(now);
}
function runStandardBenchmark(now,delta){
 if(standardBench.finished)return;
 const firstFrame=standardBench.first===null;
 if(firstFrame){standardBench.first=now;standardBench.previous=now;}
 acc+=delta;while(acc>=DT){game.step();acc-=DT;}
 sync();const angle=(now-standardBench.first)/15000*Math.PI*2;camera.position.set(30*Math.cos(angle),15,30*Math.sin(angle));camera.lookAt(0,0,0);renderer.render(scene,camera);
 if(firstFrame){standardBench.first=performance.now();standardBench.previous=standardBench.first;standardBench.load_ms=Date.now()-benchConfig.started_at;return;}
 const begin=standardBench.first+3000,end=begin+benchConfig.duration*1000;
 const dt=Math.min(now,end)-Math.max(standardBench.previous,begin);if(dt>0)standardBench.times.push(dt);standardBench.previous=now;
 if(now>=end){
  standardBench.finished=true;
  const report={contract_version:'1.3',...frameStats(standardBench.times),load_ms:standardBench.load_ms,peak_mem_mb:null,vsync_off:benchConfig.vsync_off===true,renderer:'Three.js r'+THREE.REVISION+' / WebGL2',os:benchConfig.os,
   memory_note:'Web page cannot measure process RSS.',vsync_note:benchConfig.vsync_off?'Chromium launched with disable-frame-rate-limit and disable-gpu-vsync; driver behavior may vary.':'Manual browser launch: vsync is browser controlled.',resolution:[1280,720],
   hidden_ms:benchVisibility.hidden_ms+(benchVisibility.hidden_at!==null?performance.now()-benchVisibility.hidden_at:0),focus_losses:benchVisibility.focus_losses,max_frame_ms:Math.max(...standardBench.times),background_throttling_disabled:benchConfig.background_throttling_disabled===true};
  fetch('/api/benchmark',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(report)}).then(r=>{if(!r.ok)throw new Error('Cannot save benchmark');window.close();}).catch(e=>console.error(e));
 }
}
addEventListener('resize',()=>{if(benchmark||benchMode)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
if(benchMode){game=createBenchmark(t,benchConfig.seed);stage='benchmark';document.body.classList.add('bench-mode');renderer.setPixelRatio(1);renderer.setSize(1280,720,false);camera.aspect=1280/720;camera.updateProjectionMatrix();standardBench={first:null,previous:null,times:[],finished:false};buildWorld();$('overlay').hidden=true;}
else{buildWorld();camera.position.set(0,8,11);menu();}
requestAnimationFrame(frame);
function demoInput(){
 const s=game.state,p=s.player;
 const candidates=p.carried>=10?s.lanterns.filter(l=>!l.lit):s.motes;
 const target=[...candidates].sort((a,b)=>Math.hypot(a.pos[0]-p.pos[0],a.pos[2]-p.pos[2])-Math.hypot(b.pos[0]-p.pos[0],b.pos[2]-p.pos[2]))[0];
 const dx=target?target.pos[0]-p.pos[0]:0,dz=target?target.pos[2]-p.pos[2]:0,len=Math.hypot(dx,dz);
 return {move:len>.3?[dx/len,dz/len]:[0,0],cam_yaw_deg:0,jump:false,dash:false,pulse:false,interact:s.sim_tick%2===0,pause:false};
}
if(demoMode){
 const config=await fetch('/api/demo').then(r=>r.json());start(1);
 const capture=document.createElement('canvas');capture.width=1280;capture.height=720;
 const ctx=capture.getContext('2d'),mime='video/mp4';
 if(!MediaRecorder.isTypeSupported(mime))throw new Error('MP4 MediaRecorder unavailable');
 const stream=capture.captureStream(30),recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2500000}),chunks=[];
 const paint=()=>{ctx.drawImage(renderer.domElement,0,0,1280,720);ctx.fillStyle='#0e1430';ctx.fillRect(0,0,1280,95);ctx.fillStyle='#f5f1e6';ctx.font='24px sans-serif';ctx.fillText('ĐẢO ĐÈN LỒNG — DEMO TỰ ĐỘNG / GAMEPLAY THẬT',24,32);const s=game.state;ctx.fillText(`Đêm 1 | ${s.state} | Còn ${Math.ceil(s.time_left_s)}s | Đèn ${s.lanterns.filter(l=>l.lit).length}/5 | Đom đóm ${s.player.carried}/${s.player.capacity} | Điểm ${s.score}`,24,68);};
 demoPaint=paint;recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
 recorder.onstop=async()=>{demoPaint=null;stream.getTracks().forEach(t=>t.stop());await fetch('/api/demo',{method:'POST',headers:{'Content-Type':mime},body:new Blob(chunks,{type:mime})});};
 recorder.start();setTimeout(()=>recorder.stop(),config.duration*1000);
}
