import * as THREE from '/three.module.js';
import {createGame,DT} from '/core.mjs';
import {palette as C} from '/palette.mjs';
import {createAudio} from '/audio.mjs';
const $=id=>document.getElementById(id);
const {tuning:t}=await fetch('/game.contract.json').then(r=>r.json());
const settings={volume:.5,sensitivity:1};
try{const saved=JSON.parse(localStorage.getItem('lantern-settings'));if(saved){settings.volume=Math.max(0,Math.min(1,Number(saved.volume)||0));settings.sensitivity=Math.max(.2,Math.min(3,Number(saved.sensitivity)||1));}}catch{}
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
const keys=new Set(),mapCtx=$('map').getContext('2d');
const names=['Đảo Bến','Hai bờ tre','Tháp Bình Minh'];
const words=['Mỗi đốm sáng nhỏ đều biết đường về. Hãy thắp năm đèn trước bình minh.','Cầu tre nối hai bờ. Bùa Gió giúp con đi nhanh, nhưng hãy coi chừng Gió Lạc.','Theo dốc lên tầng cao, nhờ bục nhảy tới ngọn tháp. Đêm dài nhất cũng sẽ qua.'];
function clearWorld(){scene.remove(world);world.traverse(o=>{if(o.isMesh&&!Object.values(geo).includes(o.geometry))o.geometry.dispose();if(o.isMesh&&!Object.values(materials).includes(o.material))o.material.dispose();});world=new THREE.Group();scene.add(world);pools={motes:new Map(),shades:new Map(),drifters:new Map(),charms:new Map()};lamps=[];}
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
 for(const island of map.islands)for(let i=0;i<14;i++){
  const a=i*2.39996,r=island.radius-3,x=island.center[0]+Math.cos(a)*r,z=Math.sin(a)*r;
  mesh(geo.sphere,materials.sand,world,[x,.3,z],[.6,.45,.8]);
 }
 for(let i=0;i<20;i++){const a=i*2.39996,r=50+i%4*6;mesh(geo.sphere,materials.cloud,world,[Math.cos(a)*r+20,-5,Math.sin(a)*r],[7,2,4]);}
 for(const l of game.state.lanterns){
  const group=new THREE.Group();group.position.set(...l.pos);world.add(group);
  mesh(geo.cylinder,materials.wood,group,[0,1.25,0],[.16,2.5,.16]);
  const body=mesh(geo.sphere,mat(C.unlit,{emissive:C.core,emissiveIntensity:0}),group,[0,2.7,0],[.6,.8,.6]);
  mesh(geo.cone,materials.wood,group,[0,3.5,0],[.85,.4,.85]);
  const light=new THREE.PointLight(C.lit,0,18,2);light.position.y=2.8;group.add(light);
  const zone=mesh(new THREE.RingGeometry(5.94,6,64),new THREE.MeshBasicMaterial({color:C.gold,transparent:true,opacity:0,side:THREE.DoubleSide}),group,[0,.03,0]);zone.rotation.x=-Math.PI/2;
  lamps.push({body,light,zone});
 }
}
function toast(text){$('toast').textContent=text;toastUntil=performance.now()+2500;}
function card(title,body,label,action){
 $('card-title').textContent=title;$('card-body').textContent=body;$('start').textContent=label;$('start').disabled=false;$('start').onclick=()=>{audio.init();action();};
 $('overlay').hidden=false;$('restart').hidden=true;$('menu').hidden=stage==='menu';$('settings-panel').hidden=true;
}
function menu(){stage='menu';keys.clear();audio.setPaused(true);card('Ba đêm giữ lửa.','Gom đom đóm, vượt cầu tre, lên tháp chuông và đưa ánh sáng trở về đảo.','Bắt đầu',()=>{total=0;intro(1);});}
function intro(n){night=n;stage='intro';card('Đêm '+n+' · '+names[n-1],'Ông Đăng: “'+words[n-1]+'”','Vào Đêm '+n,()=>start(n));}
function start(n){
 night=n;game=createGame(t,12,{},night);buildWorld();yaw=0;acc=0;keys.clear();lastSecond=-1;stage='playing';pulseAt=-10;hitUntil=0;
 $('overlay').hidden=true;audio.setPaused(false);$('night-title').textContent='Đêm '+night+' / '+names[night-1];camera.position.set(0,8,11);toast(words[night-1]);
}
function pause(){
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
  if(e.name==='lantern_lit')toast('Một đèn nữa đã sáng.');
  if(e.name==='pulse')pulseAt=performance.now();
  if(e.name==='player_hit'){hitUntil=performance.now()+500;toast(e.data.by==='fall'?'Mây rơi xuống biển mây.':'Bóng Mực chạm vào Mây.');}
  if(e.name==='drifter_steal')toast('Gió Lạc vừa cướp '+e.data.amount+' đom đóm!');
  if(e.name==='charm_picked')toast('Bùa Gió · Chạy nhanh và lướt không hồi chiêu trong 10 giây.');
  if(e.name==='game_over'){
   const won=e.data.result==='won';keys.clear();stage='result';audio.play(won?'won':'lost');
   if(won)total+=game.state.score;
   if(won&&night===3)card('Bình Minh.','Cả ba đêm đã sáng. Tổng điểm: '+total+'.','Về menu',menu);
   else if(won)card('Đêm đã sáng.','Điểm Đêm '+night+': '+game.state.score+'. Tổng các đêm đã thắng: '+total+'.','Đêm tiếp theo',()=>intro(night+1));
   else card('Mây cần nghỉ một chút.',(e.data.reason==='dawn'?'Bình minh đã đến.':'Ngọn lửa cuối cùng đã tắt.')+' Điểm đêm thua không cộng vào tổng.','Chơi lại Đêm '+night,()=>start(night));
  }
 }
}
const handled=new Set(['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','KeyP','Space','ShiftLeft','ShiftRight','ArrowLeft','ArrowRight','Escape']);
addEventListener('keydown',e=>{
 if(e.target instanceof HTMLInputElement)return;
 if(!handled.has(e.code))return;e.preventDefault();
 if(['Escape','KeyP'].includes(e.code)){if(!e.repeat)pause();return;}keys.add(e.code);
});
addEventListener('keyup',e=>keys.delete(e.code));
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
 s.lanterns.forEach((l,i)=>{const m=lamps[i];m.body.material.color.set(l.lit?C.lit:C.unlit);m.body.material.emissiveIntensity=l.lit?2:0;m.light.intensity=l.lit?40:0;m.zone.material.opacity=l.lit?.3:0;});
 pool('motes',s.motes,()=>mesh(geo.mote,materials.mote,world));
 for(const m of s.motes)pools.motes.get(m.id).position.y=m.pos[1]+.5+Math.sin(s.sim_tick*.05)*.1;
 pool('shades',s.shades,()=>{const group=new THREE.Group();world.add(group);mesh(geo.sphere,materials.shade,group,[0,0,0],[.65,.8,.65]);for(const x of [-.22,.22])mesh(geo.sphere,materials.mote,group,[x,.2,.56],[.07,.09,.04]);return group;});
 for(const x of s.shades){const m=pools.shades.get(x.id);m.children[0].material=x.state==='stunned'?materials.stun:materials.shade;m.rotation.y=Math.atan2(p.pos[0]-x.pos[0],p.pos[2]-x.pos[2]);}
 pool('drifters',s.drifters,()=>{const group=new THREE.Group();world.add(group);for(let i=0;i<5;i++)mesh(geo.box,materials.drifter,group,[(i-2)*.3,Math.sin(i)*.08,0],[.32,.07,.24]);return group;});
 pool('charms',s.charms,()=>{const group=new THREE.Group();world.add(group);mesh(geo.box,materials.gold,group,[0,0,0],[.46,.7,.07]);mesh(geo.box,materials.charm,group,[0,0,.015],[.36,.6,.08]);return group;});
 for(const c of s.charms){const m=pools.charms.get(c.id);m.visible=c.available;m.position.y=c.pos[1]+.65;m.rotation.y=s.sim_tick*.03;}
 $('health').textContent='● '.repeat(Math.max(0,p.flames))+'○ '.repeat(Math.max(0,3-p.flames));$('carry').textContent=p.carried+' / 10';$('lit').textContent=lit+' / '+s.lanterns.length;$('score').textContent=s.score+' / '+total;
 $('time').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');$('time').classList.toggle('urgent',seconds<=30);
 $('mote-bar').innerHTML=Array.from({length:10},(_,i)=>'<i class="'+(i<p.carried?'filled':'')+'"></i>').join('');
 $('charm').textContent=p.charm>0?'Bùa Gió '+(p.charm/60).toFixed(1)+'s':'';
 $('cooldowns').textContent='◈ LƯỚT '+(p.charm>0?'Sẵn sàng':p.dashCd>0?(p.dashCd/60).toFixed(1)+'s':'Sẵn sàng')+' · ☀ TỎA SÁNG '+(p.pulseCd>0?(p.pulseCd/60).toFixed(1)+'s':'Sẵn sàng');
 const unlit=s.lanterns.filter(l=>!l.lit).sort((a,b)=>Math.hypot(a.pos[0]-p.pos[0],a.pos[2]-p.pos[2])-Math.hypot(b.pos[0]-p.pos[0],b.pos[2]-p.pos[2]));
 const closest=unlit[0],d=closest?Math.hypot(closest.pos[0]-p.pos[0],closest.pos[2]-p.pos[2]):Infinity;
 $('prompt').textContent=d<=2?'E — Nạp ánh sáng ('+closest.deposited+'/10)':s.wind.warning?'Lá đang bay · Gió mạnh sắp tới':s.wind.active?'Gió mạnh đang thổi':'';
 $('arrow').hidden=true;
 if(closest&&stage==='playing'){
  const v=new THREE.Vector3(...closest.pos).add(new THREE.Vector3(0,2,0)).project(camera);
  if(v.z>1||Math.abs(v.x)>.9||Math.abs(v.y)>.9){$('arrow').hidden=false;const angle=Math.atan2(closest.pos[0]-p.pos[0],closest.pos[2]-p.pos[2])-yaw;$('arrow').textContent='➤ '+closest.id+' · '+Math.round(d)+'m';$('arrow').style.transform='translateX(-50%) rotate('+(-angle*180/Math.PI+90)+'deg)';}
 }
 mapCtx.clearRect(0,0,180,180);const scale=night===2?1.3:1.7,cx=night===2?35:0;
 const dot=(pos,r,color)=>{mapCtx.fillStyle=color;mapCtx.beginPath();mapCtx.arc(90+(pos[0]-cx)*scale,90-pos[2]*scale,r,0,Math.PI*2);mapCtx.fill();};
 for(const i of s.map.islands)dot(i.center,i.radius*scale,C.grass);
 for(const l of s.lanterns)dot(l.pos,4,l.lit?C.lit:C.unlit);for(const x of s.shades)dot(x.pos,2,C.rim);for(const x of s.drifters)dot(x.pos,2,C.drifter);dot(p.pos,3,C.text);
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
 if(stage==='playing'){
  acc+=delta;
  while(acc>=DT){
   yaw+=(Number(keys.has('ArrowLeft'))-Number(keys.has('ArrowRight')))*1.6*DT;
   const jump=keys.has('Space');if(jump&&!game.state.input.jump&&game.state.player.grounded)audio.play('jump');
   events(game.step({move:[Number(keys.has('KeyD'))-Number(keys.has('KeyA')),Number(keys.has('KeyS'))-Number(keys.has('KeyW'))],cam_yaw_deg:yaw*180/Math.PI,jump,interact:keys.has('KeyE'),pulse:keys.has('KeyQ'),dash:keys.has('ShiftLeft')||keys.has('ShiftRight'),pause:false}));
   acc-=DT;if(stage!=='playing')break;
  }
  const sec=Math.ceil(game.state.time_left_s);if(sec!==lastSecond){lastSecond=sec;if(sec<=10&&sec>0)audio.play('countdown');}
  if(game.state.wind.warning&&game.state.sim_tick%60===0)audio.play('wind');
 }
 sync();const p=game.state.player.pos;camera.position.lerp(new THREE.Vector3(p[0]+Math.sin(yaw)*11,p[1]+8,p[2]+Math.cos(yaw)*11),1-Math.exp(-delta*8));camera.lookAt(p[0],p[1]+1,p[2]);
 glow.intensity=performance.now()-pulseAt<350?30:8;
 const age=(now-pulseAt)/600;pulseRing.material.opacity=age>=0&&age<1?(1-age)*.8:0;pulseRing.scale.setScalar(Math.max(.01,Math.min(age,1))*5);pulseRing.position.set(p[0],p[1]+.05,p[2]);
 leaves.forEach((m,i)=>{m.visible=game.state.wind.warning||game.state.wind.active;m.position.set(p[0]+Math.sin(now*.002+i)*5,p[1]+1+i%3,p[2]+Math.cos(now*.002+i)*5);m.rotation.y=now*.003+i;});
 $('toast').style.opacity=now<toastUntil?'1':'0';$('hit').style.opacity=now<hitUntil?'.6':'0';
 renderer.render(scene,camera);saveBenchmark(now);
}
addEventListener('resize',()=>{if(benchmark)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
buildWorld();camera.position.set(0,8,11);menu();requestAnimationFrame(frame);
