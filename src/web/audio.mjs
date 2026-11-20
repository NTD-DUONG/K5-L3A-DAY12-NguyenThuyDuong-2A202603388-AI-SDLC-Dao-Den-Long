export function createAudio(settings){
 let context=null,background=null;
 function init(){
  if(!context){context=new AudioContext();background=setInterval(()=>{if(context.state==='running'){tone(130.81,.7,.025);tone(196,.9,.018);}},2500);}
  if(context.state==='suspended')context.resume();
 }
 function tone(frequency,duration=.15,gain=.12){
  if(!context||context.state!=='running')return;
  const osc=context.createOscillator(),amp=context.createGain(),now=context.currentTime;
  osc.type='sine';osc.frequency.setValueAtTime(frequency,now);amp.gain.setValueAtTime(Math.max(.00001,gain*settings.volume),now);
  amp.gain.exponentialRampToValueAtTime(.00001,now+duration);osc.connect(amp);amp.connect(context.destination);osc.start();osc.stop(now+duration);
 }
 const sounds={mote_picked:880,lantern_lit:523.25,pulse:220,player_hit:110,jump:330,dash:440,won:659.25,lost:130.81,shade_spawned:82.4,countdown:1046.5,charm_picked:740,wind:160,drifter_steal:146.8};
 return {init,play:name=>tone(sounds[name]??440,name==='lantern_lit'?.6:.17),setPaused:paused=>{if(context){if(paused)context.suspend();else context.resume();}},dispose:()=>{clearInterval(background);context?.close();}};
}
