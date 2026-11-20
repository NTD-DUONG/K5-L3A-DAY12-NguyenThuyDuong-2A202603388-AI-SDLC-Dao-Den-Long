import {createNightMap} from './night-maps.mjs';
export const distanceXZ=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
export function terrainHeight(map,x,z){
 let h=map.islands.some(i=>Math.hypot(x-i.center[0],z-i.center[2])<=i.radius+1e-9)?0:-Infinity;
 for(const bridge of map.bridges)if(x>=bridge.minX&&x<=bridge.maxX&&z>=bridge.minZ&&z<=bridge.maxZ)h=Math.max(h,bridge.y);
 const r=Math.hypot(x,z);
 for(const level of map.levels??[])if(r>=level.minRadius&&r<=level.maxRadius&&(!level.positiveZ||z>0))h=Math.max(h,level.y);
 for(const ramp of map.ramps){
  const a=ramp.angle*Math.PI/180,u=x*Math.cos(a)+z*Math.sin(a),v=-x*Math.sin(a)+z*Math.cos(a);
  if(Math.abs(v)<=ramp.width/2&&u>=ramp.topRadius-1e-8&&u<=ramp.footRadius+1e-8)h=Math.max(h,(ramp.footRadius-u)/(ramp.footRadius-ramp.topRadius)*ramp.topY);
 }
 return h;
}
export function blocked(map,old,next,grounded=false){
 const a=terrainHeight(map,old[0],old[2]),b=terrainHeight(map,next[0],next[2]);
 if(Number.isFinite(b)&&b>old[1]+(grounded?.12:0)+1e-8&&a<=old[1]+.12)return true;
 return map.towers.some(t=>distanceXZ(next,t.pos)<t.radius&&next[1]>=t.pos[1]-.1&&next[1]<t.pos[1]+t.height);
}
export {createNightMap};
