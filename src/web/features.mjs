import {defaultBindings,actionLabels,bindingErrors} from '/input.mjs';
export function installFeatures({settings,keys,pause,onPreferences,onLeaderboard,onRecord}){
 const $=id=>document.getElementById(id),save=()=>{try{localStorage.setItem('lantern-settings',JSON.stringify(settings));}catch{}onPreferences();};
 let waiting=null;
 function redraw(){
  $('bindings').replaceChildren();
  for(const action of Object.keys(defaultBindings)){
   const label=document.createElement('label');label.textContent=actionLabels[action];
   const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent=settings.bindings[action];button.onclick=()=>{waiting=action;button.textContent='Nhấn phím…';};
   label.append(button);$('bindings').append(label);
  }
  $('controls-hint').textContent=Object.entries(settings.bindings).map(([a,k])=>actionLabels[a]+': '+k).join(' · ');
 }
 $('restore-bindings').onclick=()=>{settings.bindings={...defaultBindings};waiting=null;$('binding-status').textContent='Đã khôi phục mặc định.';save();redraw();};
 for(const key of ['reducedMotion','largeText']){
  $(key).checked=settings[key];$(key).onchange=()=>{settings[key]=$(key).checked;save();};
 }
 $('leaderboard').onclick=onLeaderboard;$('record-demo').onclick=onRecord;
 addEventListener('keydown',e=>{
  if(waiting){
   e.preventDefault();const candidate={...settings.bindings,[waiting]:e.code},errors=bindingErrors(candidate);
   if(errors.length){$('binding-status').textContent=errors.join('; ');return;}
   settings.bindings=candidate;waiting=null;$('binding-status').textContent='Đã lưu phím.';keys.clear();save();redraw();return;
  }
  if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
  const mapped=Object.values(settings.bindings).includes(e.code);
  if(!mapped&&!['ArrowLeft','ArrowRight'].includes(e.code))return;e.preventDefault();
  if(e.code===settings.bindings.pause){if(!e.repeat)pause();return;}keys.add(e.code);
 });
 addEventListener('keyup',e=>keys.delete(e.code));redraw();save();
 return action=>keys.has(settings.bindings[action]);
}
export async function loadLeaderboard(){
 const response=await fetch('/api/leaderboard');if(!response.ok)throw new Error('Không đọc được bảng xếp hạng');return response.json();
}
export async function saveScore(entry){
 const response=await fetch('/api/leaderboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(entry)});
 const data=await response.json();if(!response.ok)throw new Error(data.error??'Không lưu được điểm');return data;
}
