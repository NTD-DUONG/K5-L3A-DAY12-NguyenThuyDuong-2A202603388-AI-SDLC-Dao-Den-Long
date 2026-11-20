export class FormatError extends Error {}
const fail=m=>{throw new FormatError(m);};
const obj=(v,n)=>{if(!v||typeof v!=='object'||Array.isArray(v))fail(n+' must be object');};
const num=(v,n)=>{if(typeof v!=='number'||!Number.isFinite(v))fail(n+' must be finite');};
const int=(v,min,max,n)=>{if(!Number.isSafeInteger(v)||v<min||v>max)fail(n+' out of range');};
const bool=(v,n)=>{if(typeof v!=='boolean')fail(n+' must be boolean');};
const arr=(v,n)=>{if(!Array.isArray(v))fail(n+' must be array');};
const vec=(v,n,label)=>{arr(v,label);if(v.length!==n)fail(label+' wrong length');v.forEach(x=>num(x,label));};
export function validateInputs(v){
  obj(v,'inputs');arr(v.frames,'frames');let last=-1;
  for(const f of v.frames){
    obj(f,'frame');int(f.tick,0,Number.MAX_SAFE_INTEGER,'tick');if(f.tick<=last)fail('ticks must strictly increase');last=f.tick;
    if(f.move!==undefined){vec(f.move,2,'move');if(f.move.some(x=>Math.abs(x)>1))fail('move out of range');}
    if(f.cam_yaw_deg!==undefined)num(f.cam_yaw_deg,'yaw');
    for(const k of ['jump','interact','pulse','dash'])if(f[k]!==undefined)bool(f[k],k);
  }return v;
}
export function validateScenario(s,t){
  obj(s,'scenario');
  if(s.player!==undefined){obj(s.player,'player');if(s.player.pos!==undefined)vec(s.player.pos,3,'player.pos');if(s.player.carried!==undefined)int(s.player.carried,0,t.carry_capacity,'carried');if(s.player.flames!==undefined)int(s.player.flames,0,t.flames,'flames');}
  for(const k of ['random_motes','random_shades'])if(s[k]!==undefined)bool(s[k],k);
  if(s.time_left_s!==undefined){num(s.time_left_s,'time');if(s.time_left_s<0)fail('negative time');}
  if(s.motes!==undefined){arr(s.motes,'motes');s.motes.forEach(p=>vec(p,3,'mote'));}
  if(s.shades!==undefined){arr(s.shades,'shades');const ids=new Set();for(const x of s.shades){obj(x,'shade');vec(x.pos,3,'shade.pos');if(x.id!==undefined){if(typeof x.id!=='string'||!x.id||ids.has(x.id))fail('invalid shade id');ids.add(x.id);}}}
  if(s.lanterns!==undefined){arr(s.lanterns,'lanterns');const ids=new Set();for(const l of s.lanterns){obj(l,'lantern');if(typeof l.id!=='string'||!/^L[1-5]$/.test(l.id)||ids.has(l.id))fail('invalid lantern id');ids.add(l.id);if(l.pos!==undefined)vec(l.pos,3,'lantern.pos');if(l.deposited!==undefined)int(l.deposited,0,t.lantern_cost,'deposited');if(l.lit!==undefined)bool(l.lit,'lit');if(l.lit===false&&l.deposited===t.lantern_cost)fail('full lantern cannot be unlit');}}
  return s;
}
