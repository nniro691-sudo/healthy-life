export function connectCloudRoom({getState,onActors,onStatus,onSpawn,onOccupied,onGreeting},room){
 const base=import.meta.env.VITE_ROOM_API.replace(/\/$/,''),suffix='?room='+encodeURIComponent(room);
 let session=null,closed=false,timer,busy=false,retry=0;const seen=new Set();
 async function post(path,payload){return fetch(base+'/api/room/'+path+suffix,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(10000)});}
 async function tick(){
  if(closed||busy)return;busy=true;
  try{
   if(!session){
    const response=await post('join',{});if(!response.ok)throw Error('join');
    const data=await response.json();if(closed){post('leave',{id:data.id,token:data.token}).catch(()=>{});return;}
    session={id:data.id,token:data.token};seen.clear();onSpawn(data.actors.find(a=>a.id===data.id));onActors(data.actors.filter(a=>a.id!==data.id));onStatus('online',data.actors.length);
   }else{
    const response=await post('sync',{...session,state:getState()});
    if(response.status===401){session=null;onActors([]);throw Error('expired');}
    if(response.status===409){onOccupied();retry=0;return;}
    if(!response.ok)throw Error('sync');
    const data=await response.json();if(closed)return;
    onActors(data.actors.filter(a=>a.id!==session.id));onStatus('online',data.actors.length);
    for(const greeting of data.greetings){if(!seen.has(greeting.id)){seen.add(greeting.id);onGreeting?.(greeting);}}
    if(seen.size>256){const current=new Set(data.greetings.map(g=>g.id));for(const id of seen)if(!current.has(id))seen.delete(id);}
   }retry=0;
  }catch{if(!closed){retry=Math.min(retry+1,4);onStatus('reconnecting',0);}}
  finally{busy=false;if(!closed)timer=setTimeout(tick,retry?Math.min(4000,500*2**retry):300);}
 }
 tick();
 return {room,async greet(target){if(!session||closed)return false;try{return (await post('greet',{...session,target})).ok;}catch{return false;}},close(){closed=true;clearTimeout(timer);if(session)fetch(base+'/api/room/leave'+suffix,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(session),keepalive:true}).catch(()=>{});}};
}
