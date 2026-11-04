import {connectCloudRoom} from './cloud-multiplayer.js';
export function connectRoom({getState,onActors,onStatus,onSpawn,onOccupied,onGreeting}){
 const room=new URLSearchParams(location.search).get('room')||'mountain-temple';
 if(import.meta.env?.VITE_ROOM_API)return connectCloudRoom({getState,onActors,onStatus,onSpawn,onOccupied,onGreeting},room);
 if(import.meta.env?.VITE_STATIC_DEMO==='true'){onStatus('local',1);return {room,greet:async()=>false,close(){}};}
 const suffix=`?room=${encodeURIComponent(room)}`,actors=new Map();let session=null,busy=false,closed=false,lastPayload='',lastSent=0;
 const events=new EventSource(`/api/room/events${suffix}`);
 const notify=()=>onActors([...actors.values()].filter(a=>a.id!==session?.id));
 events.addEventListener('welcome',event=>{const data=JSON.parse(event.data);session={id:data.id,token:data.token};actors.clear();data.actors.forEach(a=>actors.set(a.id,a));lastPayload='';onSpawn(actors.get(session.id));notify();onStatus('online',actors.size);});
 events.addEventListener('actor',event=>{const actor=JSON.parse(event.data);actors.set(actor.id,actor);notify();onStatus('online',actors.size);});
 events.addEventListener('leave',event=>{actors.delete(JSON.parse(event.data).id);notify();onStatus('online',actors.size);});
 events.addEventListener('greeting',event=>onGreeting?.(JSON.parse(event.data)));
 events.onerror=()=>{session=null;actors.clear();notify();onStatus('reconnecting',0);};
 const timer=setInterval(async()=>{if(!session||busy||closed)return;const state=getState();const payload=JSON.stringify(state);if(payload===lastPayload&&Date.now()-lastSent<3000)return;busy=true;try{const response=await fetch(`/api/room/state${suffix}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...session,state})});if(response.status===409)onOccupied();else if(response.ok){lastPayload=payload;lastSent=Date.now();}else if(response.status===401){session=null;onStatus('reconnecting',0);}}catch{onStatus('reconnecting',0);}finally{busy=false;}},120);
 return {async greet(target){if(!session)return false;try{const response=await fetch(`/api/room/greet${suffix}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...session,target})});return response.ok;}catch{return false;}},close(){closed=true;clearInterval(timer);events.close();},room};
}
