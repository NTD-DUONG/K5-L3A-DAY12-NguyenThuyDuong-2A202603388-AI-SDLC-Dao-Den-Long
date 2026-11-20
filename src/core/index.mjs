import {createNightMap,terrainHeight,blocked,distanceXZ as dist} from './terrain.mjs';
export const TICK_RATE=60,DT=1/60;
const eps=1e-9,near=(a,b,r)=>dist(a,b)<=r+eps;
const round=n=>Math.round(n*1000)/1000,vec=p=>p.map(round);
const direction=(a,b)=>{const d=dist(a,b);return d>eps?[(b[0]-a[0])/d,0,(b[2]-a[2])/d]:[1,0,0];};
const compare=(a,b)=>a.id<b.id?-1:a.id>b.id?1:0;
export function createGame(t,seed=1,s={},night=1,options={}){
 const map=createNightMap(night);let rng=seed>>>0,mid=1,sid=1,did=1;
 const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
 const choose=a=>a[Math.floor(random()*a.length)];
 const ids=new Set((s.shades??[]).map(x=>x.id).filter(Boolean));
 const dids=new Set((s.drifters??[]).map(x=>x.id).filter(Boolean));
 const nextId=(prefix,set)=>{let id;do{id=prefix+(prefix==='S'?sid++:did++);}while(set.has(id));set.add(id);return id;};
 const duration=s.time_left_s??t['night'+night+'_duration_s'];
 const startPos=[0,0,0];
 const p={pos:[...(s.player?.pos??startPos)],vel:[0,0,0],carried:s.player?.carried??0,flames:s.player?.flames??t.flames,
  grounded:false,invuln:s.player?.invuln_ticks??0,dashCd:s.player?.dash_cd_ticks??0,pulseCd:s.player?.pulse_cd_ticks??0,charm:s.player?.charm_ticks??0,
  facing:[0,0,1],dashTicks:0,dashDir:[0,0,1],launch:null,respawn:0,successfulLights:s.player?.successful_lights??0};
 Object.defineProperty(p,'capacity',{get:()=>Math.min(t.capacity_max,t.carry_capacity+2*p.successfulLights)});
 p.grounded=Math.abs(p.pos[1]-terrainHeight(map,p.pos[0],p.pos[2]))<eps;
 const g={tick:0,sim_tick:0,night,state:'playing',score:0,time_left_s:duration,player:p,map,wind:{active:false,dir_deg:0,warning:false},
  lanterns:map.lanterns.map(l=>({...l,pos:[...l.pos],lit:false,deposited:0,fuelUnits:0,ever_lit:false,relit_count:0})),motes:[],shades:[],drifters:[],
  charms:(s.charms??map.charms).map(c=>({id:c.id,pos:[...(c.pos??map.charms.find(x=>x.id===c.id)?.pos??[0,0,0])],available:c.available??true,respawn:c.respawn_ticks??0})),
  input:{move:[0,0],cam_yaw_deg:0,jump:false,interact:false,pulse:false,dash:false,pause:false}};
 const addMote=(pos,kind='random',ttl=0)=>g.motes.push({id:'M'+mid++,pos:[...pos],kind,ttl,born:g.sim_tick});
 const makeShade=x=>({id:x.id??nextId('S',ids),pos:[...x.pos],offset:.8,state:x.state??'wander',timer:x.state_ticks_left??0,pushTicks:0,pushSpeed:0,dir:[1,0,0],safeEscape:0,born:g.sim_tick,target_lantern_id:x.target_lantern_id??null});
 const makeDrifter=x=>({id:x.id??nextId('D',dids),pos:[...x.pos],state:x.state??'idle',stolen:x.stolen??0,timer:x.state_ticks_left??(x.state==='flee'?240:0),born:g.sim_tick,dir:[1,0,0]});
 for(const u of s.lanterns??[]){
  const l=g.lanterns.find(x=>x.id===u.id);Object.assign(l,u);l.pos=[...l.pos];
  const cost=l.ever_lit?t.relight_cost:t.lantern_cost;
  if(l.lit||l.deposited>=cost){
   l.lit=true;l.deposited=cost;l.ever_lit=true;l.fuelUnits=Math.round((u.fuel??t.fuel_max)*60);
   if(l.fuelUnits<=0){l.lit=false;l.deposited=0;}
  }else l.fuelUnits=0;
 }
 if(s.motes!==undefined)s.motes.forEach(x=>Array.isArray(x)?addMote(x):addMote(x.pos,x.kind??'random',Math.round((x.ttl_s??8)*60)));
 else if(s.random_motes!==false){const points=map.motePoints.map(x=>[...x]);for(let i=0;i<20&&points.length;i++)addMote(points.splice(Math.floor(random()*points.length),1)[0]);}
 g.shades=(s.shades??[]).map(makeShade);g.drifters=(s.drifters??[]).map(makeDrifter);
 const protectedLamp=l=>l.lit&&l.fuelUnits>=t.low_fuel_threshold*60;
 const safe=pos=>g.lanterns.some(l=>protectedLamp(l)&&near(pos,l.pos,t.safe_radius));
 function outside(pos){
  const q=[...pos];
  for(let k=0;k<10;k++){let changed=false;for(const l of g.lanterns)if(protectedLamp(l)&&near(q,l.pos,t.safe_radius)){const d=direction(l.pos,q);q[0]=l.pos[0]+d[0]*(t.safe_radius+.002);q[2]=l.pos[2]+d[2]*(t.safe_radius+.002);changed=true;}if(!changed)break;}
  if(safe(q))q[0]=Math.max(...g.lanterns.filter(protectedLamp).map(l=>l.pos[0]+t.safe_radius))+.002;
  return q;
 }
 function moveEntity(entity,dir,speed,avoidSafe=false){
  const old=entity.pos,next=[old[0]+dir[0]*speed*DT,old[1],old[2]+dir[2]*speed*DT],h=terrainHeight(map,next[0],next[2]);
  if(!Number.isFinite(h)||blocked(map,old,next,true))return;
  if(avoidSafe&&safe(next)){entity.pos=outside(next);return;}
  next[1]=h+(entity===p?0:entity.offset??0);entity.pos=next;
 }
 function dropped(amount,center){
  for(let i=0;i<amount;i++){const a=random()*Math.PI*2,r=1.5+random();addMote([center[0]+Math.cos(a)*r,center[1],center[2]+Math.sin(a)*r],'dropped',480);}
 }
 function step(patch={}){
  if(options.benchmark)patch={};
  if(g.state==='won'||g.state==='lost')return [];
  const previous=g.input;g.input={...previous,...patch};const input=g.input,press=k=>input[k]&&!previous[k];
  const events=[];g.tick++;const emit=(name,data={})=>events.push({type:'event',tick:g.tick,name,data});
  if(press('pause')){g.state=g.state==='paused'?'playing':'paused';emit(g.state==='paused'?'paused':'resumed');if(g.state==='paused')return events;}
  if(g.state==='paused')return events;
  g.sim_tick++;const sim=g.sim_tick;
  if(sim===1)emit('night_start',{night});
  g.time_left_s=options.benchmark?duration:Math.max(0,duration-sim/60);
  // All fuel arithmetic is in integer units of 1/60, before interaction/AI.
  for(const l of g.lanterns)if(l.lit&&!options.benchmark){
   const drainers=g.shades.filter(sh=>sh.state==='drain'&&sh.target_lantern_id===l.id&&l.fuelUnits<t.low_fuel_threshold*60&&near(sh.pos,l.pos,2));
   l.fuelUnits=Math.max(0,l.fuelUnits-t.fuel_decay_per_s-drainers.length*t.drain_per_s);
   if(sim%60===0)for(const sh of drainers)emit('fuel_drain',{lantern_id:l.id,shade_id:sh.id,fuel:Math.round(l.fuelUnits/6)/10});
   if(l.fuelUnits===0){l.lit=false;l.deposited=0;emit('lantern_out',{lantern_id:l.id});}
  }
  for(const k of ['invuln','dashCd','pulseCd','charm'])p[k]=Math.max(0,p[k]-1);
  for(const m of g.motes)if(m.kind==='dropped')m.ttl--;
  g.motes=g.motes.filter(m=>m.kind!=='dropped'||m.ttl>0);
  for(const c of g.charms)if(!c.available&&c.respawn>0){c.respawn--;if(c.respawn===0)c.available=true;}
  for(const shade of g.shades){if(shade.timer>0)shade.timer--;if(shade.pushTicks>0)shade.pushTicks--;}
  for(const d of g.drifters)if(d.timer>0)d.timer--;
  if(night===3&&s.wind_enabled!==false){
   const cycle=sim%1800;g.wind.warning=cycle>=1680;
   if(cycle===1680)g.wind.dir_deg=random()*360;
   g.wind.active=sim>=1800&&cycle<300;
  }
  let inactive=false;
  if(p.respawn>0){
   p.respawn--;inactive=true;p.vel=[0,0,0];
   if(p.respawn===0){p.pos=[...startPos];p.invuln=90;p.grounded=true;p.launch=null;}
  }else{
   let [x,z]=input.move,len=Math.hypot(x,z);if(len>1){x/=len;z/=len;}
   const yaw=input.cam_yaw_deg*Math.PI/180,dir=[x*Math.cos(yaw)+z*Math.sin(yaw),0,-x*Math.sin(yaw)+z*Math.cos(yaw)];
   if(Math.hypot(...[dir[0],dir[2]])>eps)p.facing=direction([0,0,0],dir);
   if(press('dash')&&p.dashTicks===0&&(p.charm>0||p.dashCd===0)){
    p.dashTicks=12;p.dashCd=p.charm>0?0:90;p.dashDir=[...p.facing];emit('dash');
   }
   if(press('jump')&&p.grounded&&p.dashTicks===0){p.vel[1]=7;p.grounded=false;}
   if(p.grounded&&p.dashTicks===0){
    const pad=map.pads.find(a=>near(p.pos,a.pos,a.radius)&&Math.abs(p.pos[1]-a.pos[1])<.2);
    if(pad){const d=pad.direction??direction(pad.pos,pad.target);p.launch=[d[0]*pad.horizontalSpeed,0,d[2]*pad.horizontalSpeed];p.vel[1]=pad.verticalSpeed;p.grounded=false;}
   }
   const speed=p.charm>0?7.2:t.player_speed;
   let vx=p.launch?.[0]??dir[0]*speed,vz=p.launch?.[2]??dir[2]*speed;
   const dashing=p.dashTicks>0;
   if(dashing){vx=p.dashDir[0]*t.dash_speed;vz=p.dashDir[2]*t.dash_speed;p.dashTicks--;}
   if(g.wind.active){const a=g.wind.dir_deg*Math.PI/180;vx+=2*Math.cos(a);vz+=2*Math.sin(a);}
   const old=[...p.pos],next=[old[0]+vx*DT,old[1],old[2]+vz*DT];
   if(blocked(map,old,next,p.grounded)){vx=0;vz=0;next[0]=old[0];next[2]=old[2];}
   let floor=terrainHeight(map,next[0],next[2]);
   // Ground floor exists underneath upper tiers; origin remains (0,0,0).
   if(floor>old[1]+.12&&terrainHeight(map,old[0],old[2])>old[1]+.12)floor=0;
   if(!dashing){
    if(p.grounded&&Number.isFinite(floor)&&Math.abs(floor-old[1])<=.12){next[1]=floor;p.vel[1]=0;}
    else{
     p.grounded=false;const vy=p.vel[1];next[1]+=vy*DT-10*DT*DT;p.vel[1]-=20*DT;
     if(p.vel[1]<=0&&Number.isFinite(floor)&&old[1]>=floor-eps&&next[1]<=floor){next[1]=floor;p.vel[1]=0;p.grounded=true;p.launch=null;}
    }
   }
   p.pos=next;p.vel[0]=vx;p.vel[2]=vz;
   if(p.pos[1]<-10){
    const lost=p.carried;p.carried=0;p.flames--;p.respawn=p.flames>0?60:0;p.invuln=0;p.vel=[0,0,0];p.launch=null;p.dashTicks=0;inactive=true;
    emit('player_hit',{by:'fall',flames:p.flames,dropped:0,lost});
   }
  }
  if(!inactive&&!options.benchmark){
   g.motes=g.motes.filter(m=>{
    if(m.born<sim&&p.carried<p.capacity&&near(m.pos,p.pos,t.pickup_radius)&&Math.abs(m.pos[1]-p.pos[1])<=1.5+eps){p.carried++;emit('mote_picked',{carried:p.carried});return false;}return true;
   });
   for(const c of g.charms)if(c.available&&near(p.pos,c.pos,t.pickup_radius)&&Math.abs(p.pos[1]-c.pos[1])<=1.5){c.available=false;c.respawn=2700;p.charm=600;emit('charm_picked',{charm_id:c.id,charm_ticks:600});}
   if(press('interact')){
    const l=g.lanterns.filter(l=>(!l.lit||l.fuelUnits<t.fuel_max*60)&&near(l.pos,p.pos,t.interact_radius)).sort((a,b)=>dist(a.pos,p.pos)-dist(b.pos,p.pos)||compare(a,b))[0];
    if(l&&p.carried){
     if(l.lit){
      const amount=Math.min(p.carried,Math.ceil((t.fuel_max*60-l.fuelUnits)/(t.fuel_per_mote*60)));
      if(amount>0){p.carried-=amount;l.fuelUnits=Math.min(t.fuel_max*60,l.fuelUnits+amount*t.fuel_per_mote*60);g.score+=amount*t.score.per_mote;emit('refuel',{lantern_id:l.id,amount,fuel:Math.round(l.fuelUnits/6)/10});}
     }else{
      const cost=l.ever_lit?t.relight_cost:t.lantern_cost;
      const amount=Math.min(p.carried,cost-l.deposited);p.carried-=amount;l.deposited+=amount;g.score+=amount*t.score.per_mote;emit('deposit',{lantern_id:l.id,amount,deposited:l.deposited});
      if(l.deposited>=cost){
       const relight=l.ever_lit;l.lit=true;l.ever_lit=true;l.fuelUnits=t.fuel_max*60;
       if(relight)l.relit_count++;p.successfulLights++;g.score+=relight?t.score.per_relight:t.score.per_lantern;
       emit('lantern_lit',{lantern_id:l.id,relight});
      }
     }
    }
   }
  }
  for(const shade of g.shades)if(safe(shade.pos)){
   shade.pos=outside(shade.pos);shade.safeEscape=sim; // immediate escape is within the 30 tick limit
  }
  if(!inactive&&!options.benchmark&&press('pulse')&&p.carried>=t.pulse_cost&&p.pulseCd===0){
   p.carried-=t.pulse_cost;p.pulseCd=180;const stunned_ids=[];
   const reaches=e=>Math.hypot(p.pos[0]-e.pos[0],p.pos[1]+.8-e.pos[1],p.pos[2]-e.pos[2])<=t.pulse_radius+eps;
   for(const shade of g.shades)if(reaches(shade)){
    g.score+=shade.state==='drain'?t.score.per_drain_stun:t.score.per_stun;
    shade.state='stunned';shade.target_lantern_id=null;shade.timer=120;shade.pushTicks=16;shade.pushSpeed=4/(15*DT);shade.dir=direction(p.pos,shade.pos);stunned_ids.push(shade.id);
   }
   for(const d of g.drifters)if(reaches(d)){
    if(d.state==='chase'){d.state='flee';d.timer=240;d.dir=direction(p.pos,d.pos);}
    else if(d.state==='flee'&&d.stolen){dropped(d.stolen,d.pos);emit('drifter_drop',{drifter_id:d.id,amount:d.stolen});d.stolen=0;d.timer=120;}
   }
   emit('pulse',{stunned_ids});
  }
  const shadeSpeed=night===3?4.5:t.shade_speed;
  for(const shade of g.shades){
   if(shade.born>=sim)continue;
   if(shade.state==='spawning'){if(shade.timer>0)continue;shade.state='wander';}
   if(shade.state==='stunned'){
    if(shade.pushTicks>1)moveEntity(shade,shade.dir,shade.pushSpeed,true);
    if(shade.timer>0)continue;shade.state='wander';continue;
   }
   if(shade.state==='recoil'){
    moveEntity(shade,shade.dir,2,true);if(shade.timer===0)shade.state='wander';continue;
   }
   const d=dist(shade.pos,p.pos);
   if(shade.state==='drain'){
    const target=g.lanterns.find(l=>l.id===shade.target_lantern_id);
    if(d<=6&&!inactive){shade.state='chase';shade.target_lantern_id=null;}
    else if(!target||!target.lit||target.fuelUnits>=t.low_fuel_threshold*60||!near(shade.pos,target.pos,2)){shade.state='wander';shade.target_lantern_id=null;}
    else continue;
   }
   if(shade.state==='chase'&&(d>18||inactive))shade.state='wander';
   else if(shade.state==='wander'&&d<=12&&!inactive&&!options.benchmark)shade.state='chase';
   const angle=sim/180+(Number(shade.id.replace(/\D/g,''))||0);
   const weak=g.lanterns.filter(l=>l.lit&&l.fuelUnits<t.low_fuel_threshold*60);
   const targets=weak.length?weak:g.lanterns.filter(l=>!l.lit);
   const target=shade.state==='wander'?[...targets].sort((a,b)=>dist(shade.pos,a.pos)-dist(shade.pos,b.pos)||compare(a,b))[0]:null;
   shade.target_lantern_id=target?.id??(shade.state==='drain'?shade.target_lantern_id:null);
   if(target?.lit&&near(shade.pos,target.pos,2)){shade.state='drain';continue;}
   const dir=shade.state==='chase'?direction(shade.pos,p.pos):target?direction(shade.pos,target.pos):[Math.cos(angle),0,Math.sin(angle)];
   moveEntity(shade,dir,shade.state==='chase'?shadeSpeed:2,true);
   if(target?.lit&&near(shade.pos,target.pos,2))shade.state='drain';
  }
  for(const d of g.drifters){
   if(d.born>=sim)continue;
   if(d.state==='flee'){
    if(d.timer===0){d.state='removed';continue;}
    d.pos[0]+=d.dir[0]*7*DT;d.pos[2]+=d.dir[2]*7*DT;
   }else{
    const chase=!inactive&&p.carried>=5&&dist(d.pos,p.pos)<=15;
    d.state=chase?'chase':'idle';
    const dir=chase?direction(d.pos,p.pos):[Math.cos(sim/120),0,Math.sin(sim/120)];
    d.pos[0]+=dir[0]*(chase?7:2)*DT;d.pos[2]+=dir[2]*(chase?7:2)*DT;
   }
  }
  if(!inactive&&!options.benchmark){
   for(const d of [...g.drifters].sort(compare))if(d.state==='chase'&&near(d.pos,p.pos,1.2)){
    const amount=Math.min(3,p.carried);p.carried-=amount;d.stolen=amount;d.state='flee';d.timer=240;d.dir=direction(p.pos,d.pos);emit('drifter_steal',{drifter_id:d.id,amount,carried:p.carried});
   }
   if(p.invuln===0)for(const shade of [...g.shades].sort(compare)){
    if(['spawning','stunned','recoil'].includes(shade.state)||shade.safeEscape===sim||safe(p.pos))continue;
    if(near(p.pos,shade.pos,t.shade_hit_radius)&&Math.abs(p.pos[1]-shade.pos[1])<=1.5+eps){
     p.flames--;const amount=Math.floor(p.carried/2);p.carried-=amount;dropped(amount,p.pos);p.invuln=90;
     shade.state='recoil';shade.timer=60;shade.dir=direction(p.pos,shade.pos);emit('player_hit',{by:'shade',flames:p.flames,dropped:amount});break;
    }
   }
  }
  g.drifters=g.drifters.filter(d=>d.state!=='removed');
  if(!options.benchmark&&s.random_motes!==false&&sim%240===0&&g.motes.length<30){
   const points=map.motePoints.filter(pt=>!g.motes.some(m=>dist(pt,m.pos)<.01&&Math.abs(pt[1]-m.pos[1])<.1));
   if(points.length)addMote(choose(points));
  }
  const schedule=map.shadeSchedule,first=300;
  if(!options.benchmark&&s.random_shades!==false&&(sim===first||(sim>first&&(sim-first)%schedule.intervalTicks===0))){
   const count=sim===first?2:1;
   for(let i=0;i<count&&g.shades.length<schedule.max;i++){
    const points=map.shadePoints.filter(pt=>dist(pt,p.pos)>=15&&!safe(pt));
    if(points.length){const shade=makeShade({pos:choose(points),state:'spawning',state_ticks_left:30});shade.pos[1]+= .8;g.shades.push(shade);emit('shade_spawned',{id:shade.id});}
   }
  }
  if(!options.benchmark&&night>=2&&s.random_drifters!==false&&sim%1200===0&&g.drifters.length<2){
   const pos=[...choose(map.shadePoints)];pos[1]+=.8;g.drifters.push(makeDrifter({pos}));
  }
  if(options.benchmark)return events;
  let reason;
  if(p.flames<=0){g.state='lost';reason='no_flames';}
  else if(g.time_left_s<=0){
   const lit=g.lanterns.filter(l=>l.lit);
   if(lit.length>=Math.ceil(t.win_ratio*g.lanterns.length)){
    g.state='won';reason='dawn_survived';g.score+=lit.reduce((sum,l)=>sum+t.score.per_lit_at_dawn+Math.floor(l.fuelUnits/60),0)+p.flames*t.score.per_flame_left;
   }else{g.state='lost';reason='dawn';}
  }
  if(reason)emit('game_over',{result:g.state,reason});
  return events;
 }
 function snapshot(){
  return {type:'snapshot',tick:g.tick,sim_tick:g.sim_tick,night,state:g.state,time_left_s:g.time_left_s,score:g.score,wind:{active:g.wind.active,dir_deg:round(g.wind.dir_deg)},
   player:{pos:vec(p.pos),vel:vec(p.vel),flames:p.flames,carried:p.carried,capacity:p.capacity,grounded:p.grounded,invuln:p.invuln>0,dash_cd_s:p.dashCd/60,pulse_cd_s:p.pulseCd/60,charm_s:p.charm/60},
   lanterns:g.lanterns.map(l=>({id:l.id,pos:vec(l.pos),lit:l.lit,deposited:l.deposited,fuel:l.lit?Math.round(l.fuelUnits/6)/10:0,ever_lit:l.ever_lit,relit_count:l.relit_count})),shades:g.shades.map(x=>({id:x.id,pos:vec(x.pos),state:x.state,target_lantern_id:x.target_lantern_id})),
   motes_active:g.motes.length,motes:g.motes.map(m=>({id:m.id,pos:vec(m.pos),kind:m.kind,ttl_s:m.kind==='dropped'?m.ttl/60:null})),
   drifters:g.drifters.map(d=>({id:d.id,pos:vec(d.pos),state:d.state,stolen:d.stolen})),
   charms:g.charms.map(c=>({id:c.id,pos:vec(c.pos),available:c.available,respawn_s:c.respawn/60}))};
 }
 return {state:g,step,snapshot};
}
