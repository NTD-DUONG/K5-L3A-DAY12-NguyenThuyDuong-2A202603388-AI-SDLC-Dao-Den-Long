import * as THREE from '/three.module.js';
import {createGame,DT} from '/core.mjs';
const $=id=>document.getElementById(id);
const {tuning:t}=await fetch('/game.contract.json').then(r=>{if(!r.ok)throw new Error('Không tải được contract');return r.json();});
const renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.25;
const scene=new THREE.Scene();scene.background=new THREE.Color('#142435');scene.fog=new THREE.FogExp2('#142435',0.012);
const camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,0.1,220);
const ambient=new THREE.HemisphereLight('#a5d5df','#192126',1.7);scene.add(ambient);
const moon=new THREE.DirectionalLight('#a8d6e8',2.2);moon.position.set(-20,35,-15);moon.castShadow=true;
moon.shadow.mapSize.set(2048,2048);Object.assign(moon.shadow.camera,{left:-42,right:42,top:42,bottom:-42,near:1,far:100});moon.shadow.bias=-0.001;scene.add(moon);
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:0.9,...extra});
const grass=mat('#345957'),stone=mat('#31434b'),wood=mat('#66503a'),gold=mat('#ffc565',{emissive:'#ff9d36',emissiveIntensity:1.5});
const geometry={
 sphere:new THREE.SphereGeometry(1,12,8),mote:new THREE.IcosahedronGeometry(0.13,0),
 cylinder:new THREE.CylinderGeometry(1,1,1,12),cone:new THREE.ConeGeometry(1,1,16)
};
function mesh(geo,material,parent=scene,pos=[0,0,0],scale=[1,1,1]){
 const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
mesh(new THREE.CylinderGeometry(35,31,4,64),stone,scene,[0,-2,0]);
mesh(new THREE.CylinderGeometry(35,35,.16,64),grass,scene,[0,-.08,0]);
mesh(new THREE.CylinderGeometry(31,16,9,32),mat('#24333e'),scene,[0,-8,0]);
const shore=mesh(new THREE.TorusGeometry(34.7,.24,6,100),mat('#6f8b7a'),scene,[0,.05,0]);shore.rotation.x=Math.PI/2;
// Decorative geometry is visual only; it never enters the shared simulation.
for(let i=0;i<35;i++){
 const a=i*2.39996,r=30+Math.sin(i*3)*2;
 mesh(geometry.sphere,stone,scene,[Math.sin(a)*r,.4,Math.cos(a)*r],[.7+(i%3)*.3,.6,.8]);
}
for(let i=0;i<13;i++){
 const a=i*2.39996,r=14+(i%4)*4.5,x=Math.sin(a)*r,z=Math.cos(a)*r;
 if(Math.hypot(x,z-25)<6)continue;
 const tree=new THREE.Group();tree.position.set(x,0,z);scene.add(tree);
 mesh(geometry.cylinder,wood,tree,[0,1.5,0],[.24,3,.24]);
 mesh(geometry.cone,mat(i%2?'#2e5e59':'#3c7064'),tree,[0,3.5,0],[1.7,3,1.7]);
 mesh(geometry.cone,mat('#447a6a'),tree,[0,4.7,0],[1.2,2.4,1.2]);
}
const cloudMat=mat('#658591',{transparent:true,opacity:.20,depthWrite:false});
for(let i=0;i<24;i++){
 const a=i*2.39996,r=42+i%4*8;
 mesh(geometry.sphere,cloudMat,scene,[Math.sin(a)*r,-7-i%3,Math.cos(a)*r],[7,2,4]);
}
const player=new THREE.Group();scene.add(player);
mesh(geometry.cylinder,mat('#df9865'),player,[0,.8,0],[.34,1.05,.3]);
mesh(geometry.sphere,mat('#f4c99c'),player,[0,1.5,0],[.32,.34,.32]);
const hat=mesh(geometry.cone,mat('#e7d39a'),player,[0,1.87,0],[.75,.38,.75]);
mesh(geometry.cylinder,mat('#e7d39a'),player,[0,1.69,0],[.74,.04,.74]);
const legs=[-.17,.17].map(x=>mesh(geometry.cylinder,mat('#183d46'),player,[x,.23,0],[.11,.46,.12]));
mesh(geometry.cylinder,wood,player,[.52,1.1,0],[.025,.8,.025]);
mesh(geometry.sphere,gold,player,[.52,.72,0],[.17,.23,.17]);
const playerLight=new THREE.PointLight('#ffbc65',8,7,2);playerLight.position.set(.5,1,0);player.add(playerLight);
const ring=mesh(new THREE.RingGeometry(.94,1,64),new THREE.MeshBasicMaterial({color:'#ffd789',side:THREE.DoubleSide,transparent:true,opacity:0}),scene,[0,.08,0]);ring.rotation.x=-Math.PI/2;
const pools={motes:new Map(),shades:new Map()},lamps=[];
const shadeMat=mat('#4e3167',{emissive:'#512a72',emissiveIntensity:.5});
const stunMat=mat('#b4a5df',{emissive:'#a28be5',emissiveIntensity:1});
for(let i=0;i<5;i++){
 const group=new THREE.Group();scene.add(group);
 mesh(geometry.cylinder,stone,group,[0,.15,0],[1.05,.3,1.05]);
 mesh(geometry.cylinder,wood,group,[0,1.4,0],[.16,2.5,.16]);
 const body=mesh(geometry.sphere,mat('#90754d',{emissive:'#ff9e32',emissiveIntensity:0}),group,[0,2.65,0],[.65,.85,.65]);
 mesh(geometry.cone,wood,group,[0,3.6,0],[.9,.35,.9]);
 const light=new THREE.PointLight('#ffc06a',0,16,2);light.position.set(0,2.5,0);group.add(light);
 const safeZone=mesh(new THREE.RingGeometry(t.safe_radius-.07,t.safe_radius,64),new THREE.MeshBasicMaterial({color:'#ffd484',transparent:true,opacity:0,side:THREE.DoubleSide}),group,[0,.025,0]);safeZone.rotation.x=-Math.PI/2;
 lamps.push({group,body,light,safeZone});
}
let game=createGame(t,12),started=false,paused=false,yaw=0,accumulator=0,last=0,toastUntil=0,pulseAt=-10,hitUntil=0;
const keys=new Set();let dragging=false,lastX=0;
const map=$('map').getContext('2d');
function toast(text){$('toast').textContent=text;toastUntil=performance.now()+2500;}
function reset(){
 game=createGame(t,12);yaw=0;accumulator=0;pulseAt=-10;hitUntil=0;keys.clear();started=true;paused=false;
 $('overlay').hidden=true;sync();toast('Gom đom đóm vàng. Đèn đầu tiên đang chờ Mây.');
}
function showCard(kicker,title,body,button){
 $('card-kicker').textContent=kicker;$('card-title').textContent=title;$('card-body').textContent=body;
 $('start').textContent=button;$('start').disabled=false;$('overlay').hidden=false;
}
function pause(){
 if(!started||game.state.state!=='playing')return;
 paused=!paused;keys.clear();accumulator=0;
 if(paused){showCard('NGHỈ MỘT CHÚT','Đảo vẫn chờ Mây.','Trò chơi đã tạm dừng. Thời gian và Bóng Mực đều đứng yên.','Tiếp tục');$('restart').hidden=false;}
 else $('overlay').hidden=true;
}
$('start').onclick=()=>{if(paused){paused=false;accumulator=0;keys.clear();$('overlay').hidden=true;}else reset();};
$('restart').onclick=reset;
const handled=new Set(['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','Space','ArrowLeft','ArrowRight','Escape']);
addEventListener('keydown',e=>{
 if(!handled.has(e.code))return;e.preventDefault();
 if(e.code==='Escape'){if(!e.repeat)pause();return;}
 if(e.target instanceof HTMLButtonElement&&e.code==='Space')return;
 keys.add(e.code);
});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();if(started&&!paused&&game.state.state==='playing')pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();if(started&&!paused&&game.state.state==='playing')pause();}});
$('world').addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;$('world').setPointerCapture(e.pointerId);});
$('world').addEventListener('pointermove',e=>{if(dragging){yaw-=(e.clientX-lastX)*.006;lastX=e.clientX;}});
$('world').addEventListener('pointerup',()=>dragging=false);
$('world').addEventListener('pointercancel',()=>dragging=false);
function processEvents(events){
 for(const e of events){
  if(e.name==='lantern_lit')toast('Một đèn đã thức giấc. Ánh sáng sẽ bảo vệ Mây.');
  if(e.name==='deposit')toast('Đã nạp '+e.data.amount+' ánh sáng vào '+e.data.lantern_id+'.');
  if(e.name==='pulse')pulseAt=performance.now()/1000;
  if(e.name==='player_hit'){hitUntil=performance.now()+450;toast('Bóng Mực chạm vào Mây! Tìm một vùng sáng.');}
  if(e.name==='game_over'){
   keys.clear();const won=e.data.result==='won';
   showCard(won?'BÌNH YÊN TRỞ LẠI':'MỘT ĐÊM CHƯA TRỌN',won?'Đảo đã sáng rồi.':'Mây cần nghỉ một chút.',
    (won?'Cả 5 Đèn Lồng Lớn đã thức giấc.':e.data.reason==='dawn'?'Bình minh đã đến trước khi đủ 5 đèn.':'Ba ngọn lửa đã tắt trong sương.')+' Điểm của bạn: '+game.state.score+'.','Chơi lại');
   $('restart').hidden=true;
  }
 }
}
function reconcile(kind,items,create){
 const pool=pools[kind],active=new Set(items.map(x=>x.id));
 for(const [id,m]of pool)if(!active.has(id)){scene.remove(m);pool.delete(id);}
 for(const item of items){let m=pool.get(item.id);if(!m){m=create();pool.set(item.id,m);}m.position.set(...item.pos);}
}
function sync(){
 const s=game.state,p=s.player;
 player.position.set(...p.pos);
 const moving=keys.has('KeyW')||keys.has('KeyS')||keys.has('KeyA')||keys.has('KeyD');
 if(moving){
  const x=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),z=Number(keys.has('KeyS'))-Number(keys.has('KeyW'));
  player.rotation.y=Math.atan2(x,z)+yaw;
 }
 legs.forEach((leg,i)=>leg.rotation.x=moving&&!paused&&s.state==='playing'?Math.sin(s.tick*.22+i*Math.PI)*.45:0);
 player.visible=!(s.tick<s.immune&&s.tick%10<4);
 reconcile('motes',s.motes,()=>mesh(geometry.mote,gold));
 for(const mote of s.motes){const m=pools.motes.get(mote.id);m.position.y=.7+Math.sin(s.tick*.05+Number(mote.id.slice(1)))*.18;}
 reconcile('shades',s.shades,()=>{
  const group=new THREE.Group();scene.add(group);
  mesh(geometry.sphere,shadeMat,group,[0,.8,0],[.65,.85,.65]);
  for(const x of [-.22,.22])mesh(geometry.sphere,mat('#f3bbff',{emissive:'#f3bbff',emissiveIntensity:2}),group,[x,1,.55],[.09,.11,.04]);
  return group;
 });
 for(const shade of s.shades){const m=pools.shades.get(shade.id);m.rotation.y=Math.atan2(p.pos[0]-shade.pos[0],p.pos[2]-shade.pos[2]);m.children[0].material=shade.state==='stunned'?stunMat:shadeMat;m.children[0].position.y=.8+Math.sin(s.tick*.07)*.1;}
 s.lanterns.forEach((l,i)=>{
  const m=lamps[i];m.group.position.set(...l.pos);m.body.material.emissiveIntensity=l.lit?2: .05+l.deposited/t.lantern_cost*.5;
  m.light.intensity=l.lit?38:0;m.safeZone.material.opacity=l.lit?.24:0;
 });
 const lit=s.lanterns.filter(l=>l.lit).length;ambient.intensity=1.7+lit*.16;
 $('health').textContent='● '.repeat(p.flames)+'○ '.repeat(Math.max(0,3-p.flames));
 $('carry').textContent=p.carried+' / '+t.carry_capacity;$('lit').textContent=lit+' / 5';$('score').textContent=s.score;
 const seconds=Math.ceil(s.time_left_s);$('time').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
 const near=s.lanterns.filter(l=>!l.lit&&Math.hypot(l.pos[0]-p.pos[0],l.pos[2]-p.pos[2])<=t.interact_radius).sort((a,b)=>Math.hypot(a.pos[0]-p.pos[0],a.pos[2]-p.pos[2])-Math.hypot(b.pos[0]-p.pos[0],b.pos[2]-p.pos[2]))[0];
 $('prompt').textContent=near?(p.carried?'E · Nạp ánh sáng vào '+near.id+' ('+near.deposited+'/10)':'Hãy gom đom đóm để thắp '+near.id):p.carried===t.carry_capacity?'Túi ánh sáng đã đầy · Mang về một đèn chưa sáng':'';
 drawMap(s);
}
function drawMap(s){
 map.clearRect(0,0,180,180);map.fillStyle='#183a3e';map.beginPath();map.arc(90,90,80,0,Math.PI*2);map.fill();map.strokeStyle='#719284';map.stroke();
 const dot=(p,r,color)=>{map.fillStyle=color;map.beginPath();map.arc(90+p[0]*2.15,90-p[2]*2.15,r,0,Math.PI*2);map.fill();};
 for(const m of s.motes)dot(m.pos,1,'#b9a976');
 for(const l of s.lanterns){dot(l.pos,l.lit?6:4,l.lit?'#ffd47b':'#867c66');map.fillStyle='#edf1d0';map.font='11px system-ui';map.fillText(l.id,97+l.pos[0]*2.15,93-l.pos[2]*2.15);}
 for(const shade of s.shades)dot(shade.pos,3,'#c68be7');
 dot(s.player.pos,4,'#fff5cf');
}
function frame(now){
 requestAnimationFrame(frame);
 const elapsed=last?Math.min((now-last)/1000,.1):0;last=now;
 if(started&&!paused&&game.state.state==='playing'){
  accumulator+=elapsed;
  while(accumulator>=DT){
   yaw+=(Number(keys.has('ArrowLeft'))-Number(keys.has('ArrowRight')))*1.6*DT;
   processEvents(game.step({move:[Number(keys.has('KeyD'))-Number(keys.has('KeyA')),Number(keys.has('KeyS'))-Number(keys.has('KeyW'))],cam_yaw_deg:yaw*180/Math.PI,jump:keys.has('Space'),interact:keys.has('KeyE'),pulse:keys.has('KeyQ')}));
   accumulator-=DT;if(game.state.state!=='playing')break;
  }
 }
 sync();
 const p=game.state.player.pos;
 const target=new THREE.Vector3(p[0]+Math.sin(yaw)*11,p[1]+8,p[2]+Math.cos(yaw)*11);
 camera.position.lerp(target,1-Math.exp(-elapsed*8));
 camera.lookAt(p[0],p[1]+1,p[2]);
 const age=now/1000-pulseAt;ring.material.opacity=age>=0&&age<.6?(1-age/.6)*.8:0;ring.scale.setScalar(Math.max(.01,Math.min(age/.6,1))*t.pulse_radius);ring.position.set(p[0],.1,p[2]);
 $('toast').style.opacity=now<toastUntil?'1':'0';$('hit').style.opacity=now<hitUntil?'.65':'0';
 renderer.render(scene,camera);
}
camera.position.set(0,8,11);
sync();$('start').disabled=false;$('start').textContent='Bắt đầu đêm 1';
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
requestAnimationFrame(frame);
