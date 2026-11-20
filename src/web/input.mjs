export const defaultBindings=Object.freeze({up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',jump:'Space',dash:'ShiftLeft',interact:'KeyE',pulse:'KeyQ',pause:'Escape'});
export const actionLabels={up:'Đi lên',down:'Đi xuống',left:'Sang trái',right:'Sang phải',jump:'Nhảy',dash:'Lướt',interact:'Tương tác',pulse:'Tỏa sáng',pause:'Tạm dừng'};
export function bindingErrors(bindings){
 const errors=[],seen=new Map();
 for(const action of Object.keys(defaultBindings)){
  const key=bindings[action];if(typeof key!=='string'||!key)errors.push('Thiếu phím: '+actionLabels[action]);
  else if(seen.has(key))errors.push('Trùng '+key+': '+actionLabels[seen.get(key)]+' / '+actionLabels[action]);else seen.set(key,action);
 }
 return errors;
}
export function loadPreferences(storage){
 const defaults={volume:.5,sensitivity:1,colorblind:false,reducedMotion:false,largeText:false,bindings:{...defaultBindings}};
 try{const v=JSON.parse(storage.getItem('lantern-settings'));if(!v)return defaults;
 return {...defaults,volume:Math.max(0,Math.min(1,Number(v.volume)||0)),sensitivity:Math.max(.2,Math.min(3,Number(v.sensitivity)||1)),
 colorblind:v.colorblind===true,reducedMotion:v.reducedMotion===true,largeText:v.largeText===true,
 bindings:v.bindings&&!bindingErrors(v.bindings).length?{...v.bindings}:{...defaultBindings}};
 }catch{return defaults;}
}
