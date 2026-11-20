// Standard map geometry from Ticket-02.
// Angles start at +X. XZ coordinates use (cos(angle), sin(angle)).
const ring=(cx,cz,r,count,start=0,y=0)=>Array.from({length:count},(_,i)=>{
 const a=(start+i*360/count)*Math.PI/180;return [cx+r*Math.cos(a),y,cz+r*Math.sin(a)];
});
const lamps=positions=>positions.map((pos,i)=>({id:'L'+(i+1),pos}));
export function createNightMap(night){
 if(night===1)return {
  night,islands:[{center:[0,0,0],radius:40}],bridges:[],ramps:[],towers:[],pads:[],charms:[],
  lanterns:lamps([[0,0,25],[23.8,0,7.7],[14.7,0,-20.2],[-14.7,0,-20.2],[-23.8,0,7.7]]),
  motePoints:[...ring(0,0,12,8),...ring(0,0,33,16)],
  shadePoints:ring(0,0,37,12,15),shadeSchedule:{firstTick:300,intervalTicks:480,batch:1,max:6}
 };
 if(night===2)return {
  night,islands:[{center:[0,0,0],radius:28},{center:[70,0,0],radius:28}],
  bridges:[{minX:26,maxX:44,minZ:-2,maxZ:2,y:0}],ramps:[],towers:[],
  pads:[{pos:[20,0,18],radius:1,verticalSpeed:14,horizontalSpeed:24,target:[70,0,0]},
        {pos:[50,0,-18],radius:1,verticalSpeed:14,horizontalSpeed:24,target:[0,0,0]}],
  charms:[{id:'C1',pos:[35,0,0]}],
  lanterns:lamps([[0,0,20],[17,0,-10],[-17,0,-10],[70,0,20],[87,0,-10],[53,0,-10]]),
  motePoints:[0,70].flatMap(x=>[...ring(x,0,10,4),...ring(x,0,22,8)]),
  shadePoints:[0,70].flatMap(x=>ring(x,0,26,8,22.5)),
  shadeSchedule:{firstTick:300,intervalTicks:420,max:8}
 };
 if(night===3)return {
  night,islands:[{center:[0,0,0],radius:45}],bridges:[],
  levels:[{y:3,minRadius:12,maxRadius:24,positiveZ:true},{y:6,minRadius:0,maxRadius:8}],
  ramps:[30,150].map(angle=>({angle,width:3,footRadius:30,topRadius:24,footY:0,topY:3})),
  towers:[{pos:[0,6,0],radius:2,height:8}],
  pads:[{pos:[0,3,13],radius:1,verticalSpeed:12,horizontalSpeed:8,direction:[0,0,-1]}],
  charms:[{id:'C1',pos:[30,0,25]},{id:'C2',pos:[-30,0,25]}],
  lanterns:lamps([[0,6,6],[18,3,10],[-18,3,10],[35,0,-10],[-35,0,-10],[20,0,-35],[-20,0,-35]]),
  motePoints:[...ring(0,0,34,18),...Array.from({length:8},(_,i)=>{
   const a=(i+1)*20*Math.PI/180;return [18*Math.cos(a),3,18*Math.sin(a)];
  }),...ring(0,0,5,4,45,6)],
  shadePoints:ring(0,0,43,16),
  shadeSchedule:{firstTick:300,intervalTicks:360,max:10},
  wind:{intervalTicks:1800,durationTicks:300,warningTicks:120,speed:2}
 };
 throw new RangeError('night must be 1, 2 or 3');
}
