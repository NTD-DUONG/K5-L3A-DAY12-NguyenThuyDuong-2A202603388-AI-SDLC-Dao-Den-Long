export const TICK_RATE = 60;
export const DT = 1 / TICK_RATE;
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const near=(a,b,r)=>dist(a,b)<=r+1e-10;
const out=p=>p.map(n=>Math.round(n*1000)/1000);
export function createGame(t,seed=1,s={}) {
  let rng=seed>>>0,mid=1,sid=1;
  const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
  const randomPos=()=>{const a=random()*Math.PI*2,r=5+27*random();return [Math.cos(a)*r,0,Math.sin(a)*r];};
  const ids=new Set((s.shades??[]).filter(x=>x.id!==undefined).map(x=>x.id));
  const makeShade=x=>{while(ids.has('S'+sid))sid++;const id=x.id??'S'+sid++;ids.add(id);return {id,pos:[...x.pos],state:'chase',until:0};};
  const g={tick:0,state:'playing',score:0,time_left_s:s.time_left_s??t.night1_duration_s,
    player:{pos:[...(s.player?.pos??[0,0,0])],carried:s.player?.carried??0,flames:s.player?.flames??t.flames},
    lanterns:Array.from({length:5},(_,i)=>({id:'L'+(i+1),pos:[25*Math.sin(i*2*Math.PI/5),0,25*Math.cos(i*2*Math.PI/5)],lit:false,deposited:0})),
    motes:[],shades:[],input:{move:[0,0],cam_yaw_deg:0,jump:false,interact:false,pulse:false},vy:0,immune:0,ready:0};
  const start=g.time_left_s;
  for(const u of s.lanterns??[]){const l=g.lanterns.find(l=>l.id===u.id);Object.assign(l,u);l.pos=[...l.pos];if(l.lit)l.deposited=t.lantern_cost;if(l.deposited===t.lantern_cost)l.lit=true;}
  const addMote=p=>g.motes.push({id:'M'+mid++,pos:[...p]});
  if(s.motes!==undefined)s.motes.forEach(addMote);
  else if(s.random_motes!==false)for(let i=0;i<100;i++)addMote(randomPos());
  if(s.shades!==undefined)g.shades=s.shades.map(makeShade);
  else if(s.random_shades!==false)for(let i=0;i<3;i++)g.shades.push(makeShade({pos:randomPos()}));
  const safe=p=>g.lanterns.some(l=>l.lit&&near(p,l.pos,t.safe_radius));
  function repel(p) {
    for(let pass=0;pass<10;pass++){
      let changed=false;
      for(const l of g.lanterns)if(l.lit&&near(p,l.pos,t.safe_radius)){
        let dx=p[0]-l.pos[0],dz=p[2]-l.pos[2],d=Math.hypot(dx,dz);
        if(d<1e-12){dx=1;dz=0;d=1;}
        p[0]=l.pos[0]+dx/d*(t.safe_radius+1e-8);p[2]=l.pos[2]+dz/d*(t.safe_radius+1e-8);changed=true;
      }
      if(!changed)break;
    }
    // Overlapping circles can cycle under sequential projection.
    // A point east of every lit circle is guaranteed outside their union.
    if(safe(p))p[0]=Math.max(...g.lanterns.filter(l=>l.lit).map(l=>l.pos[0]+t.safe_radius))+0.002;
    return p;
  }
  function step(patch={}) {
    if(g.state!=='playing')return [];
    const prev=g.input;g.input={...prev,...patch};const input=g.input,pressed=k=>input[k]&&!prev[k];
    const events=[];g.tick++;const emit=(name,data)=>events.push({type:'event',tick:g.tick,name,data});
    let [x,z]=input.move;const len=Math.hypot(x,z);if(len>1){x/=len;z/=len;}
    const yaw=input.cam_yaw_deg*Math.PI/180,p=g.player;
    p.pos[0]+=(x*Math.cos(yaw)+z*Math.sin(yaw))*t.player_speed*DT;
    p.pos[2]+=(-x*Math.sin(yaw)+z*Math.cos(yaw))*t.player_speed*DT;
    const r=Math.hypot(p.pos[0],p.pos[2]);
    if(r>35&&(x!==0||z!==0)){p.pos[0]*=35/r;p.pos[2]*=35/r;}
    if(pressed('jump')&&p.pos[1]<=0)g.vy=7;
    if(p.pos[1]>0||g.vy>0){p.pos[1]=Math.max(0,p.pos[1]+g.vy*DT);g.vy-=20*DT;if(p.pos[1]===0)g.vy=0;}
    g.motes=g.motes.filter(m=>{
      if(p.carried<t.carry_capacity&&near(m.pos,p.pos,t.pickup_radius)){p.carried++;g.score+=t.score.per_mote;emit('mote_picked',{carried:p.carried});return false;}return true;
    });
    if(pressed('interact')){
      const l=g.lanterns.filter(l=>!l.lit&&near(l.pos,p.pos,t.interact_radius)).sort((a,b)=>dist(a.pos,p.pos)-dist(b.pos,p.pos)||a.id.localeCompare(b.id))[0];
      if(l&&p.carried>0){const amount=Math.min(p.carried,t.lantern_cost-l.deposited);p.carried-=amount;l.deposited+=amount;emit('deposit',{lantern_id:l.id,amount,deposited:l.deposited});
        if(l.deposited===t.lantern_cost){l.lit=true;g.score+=t.score.per_lantern;emit('lantern_lit',{lantern_id:l.id});}}
    }
    if(pressed('pulse')&&p.carried>=t.pulse_cost&&g.tick>=g.ready){
      p.carried-=t.pulse_cost;g.ready=g.tick+Math.ceil(t.pulse_cooldown_s*60);const stunned_ids=[];
      for(const shade of g.shades)if(near(shade.pos,p.pos,t.pulse_radius)){
        stunned_ids.push(shade.id);shade.until=g.tick+Math.ceil(t.pulse_stun_s*60);shade.state='stunned';
        let dx=shade.pos[0]-p.pos[0],dz=shade.pos[2]-p.pos[2],d=Math.hypot(dx,dz);if(d===0){dx=1;dz=0;d=1;}
        shade.pos[0]+=dx/d*t.pulse_push_m;shade.pos[2]+=dz/d*t.pulse_push_m;g.score+=t.score.per_stun;
      }
      emit('pulse',{stunned_ids});
    }
    for(const shade of g.shades){
      repel(shade.pos);
      if(g.tick<shade.until){shade.state='stunned';continue;}
      shade.state='chase';const d=dist(shade.pos,p.pos),delta=Math.min(d,t.shade_speed*DT);
      if(d>0){shade.pos[0]+=(p.pos[0]-shade.pos[0])/d*delta;shade.pos[2]+=(p.pos[2]-shade.pos[2])/d*delta;repel(shade.pos);}
      if(p.flames>0&&!safe(p.pos)&&g.tick>=g.immune&&near(shade.pos,p.pos,t.shade_hit_radius)){
        p.flames--;g.immune=g.tick+Math.ceil(t.invuln_s*60);emit('player_hit',{by:'shade',flames:p.flames,dropped:0});
      }
    }
    if(s.random_motes!==false&&g.tick%120===0&&g.motes.length<100)addMote(randomPos());
    if(s.random_shades!==false&&g.tick%600===0&&g.shades.length<8){const shade=makeShade({pos:randomPos()});g.shades.push(shade);emit('shade_spawned',{id:shade.id});}
    g.time_left_s=Math.max(0,start-g.tick/60);let reason;
    if(p.flames<=0){g.state='lost';reason='no_flames';}
    else if(g.lanterns.every(l=>l.lit)){g.state='won';reason='all_lit';g.score+=Math.floor(g.time_left_s)*t.score.per_second_left+p.flames*t.score.per_flame_left;}
    else if(g.time_left_s<=0){g.state='lost';reason='dawn';}
    if(reason)emit('game_over',{result:g.state,reason});return events;
  }
  const snapshot=()=>({type:'snapshot',tick:g.tick,sim_tick:g.tick,state:g.state,time_left_s:g.time_left_s,score:g.score,
    player:{...g.player,pos:out(g.player.pos)},lanterns:g.lanterns.map(l=>({...l,pos:out(l.pos)})),
    shades:g.shades.map(x=>({id:x.id,pos:out(x.pos),state:x.state})),motes_active:g.motes.length,motes:g.motes.map(m=>({id:m.id,pos:out(m.pos)}))});
  return {state:g,step,snapshot};
}
