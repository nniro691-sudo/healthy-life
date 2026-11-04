import {randomUUID,randomBytes} from 'node:crypto';
import {networkInterfaces} from 'node:os';
import {MATS,WORLD_BOUNDS} from '../src/mats.js';
const SCENES=new Set(['hall','court','gate','tree']);
const MODES=new Set(['idle','walk','palms','bow','incense']);
const MAT_IDS=new Set(MATS.map(m=>m.id));
export function createRoomService(){
 const rooms=new Map();
 const send=(res,type,data)=>res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
 const publicActor=c=>({id:c.id,name:c.name,...c.state});
 const publish=(room,type,data)=>{for(const c of room.values())send(c.res,type,data);};
 const reply=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 function middleware(req,res,next=()=>reply(res,404,{error:'not-found'})){
  const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith('/api/room/'))return next();
  if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host)return reply(res,403,{error:'origin'});}catch{return reply(res,403,{error:'origin'});}}
  const roomId=url.searchParams.get('room')||'mountain-temple';
  if(!/^[a-zA-Z0-9_-]{1,32}$/.test(roomId))return reply(res,400,{error:'invalid-room'});
  if(req.method==='GET'&&url.pathname==='/api/room/info'){
   const host=req.headers.host||'localhost:5173',local=/^(localhost|127\.0\.0\.1)(:|$)/.test(host);let sharedHost=host;
   if(local){const address=Object.values(networkInterfaces()).flat().find(a=>a&&a.family==='IPv4'&&!a.internal&&(/^(192\.168\.|10\.)/.test(a.address)||/^172\.(1[6-9]|2[0-9]|3[01])\./.test(a.address)));if(address)sharedHost=address.address+(host.includes(':')?':'+host.split(':').pop():'');}
   return reply(res,200,{url:`${req.socket.encrypted?'https':'http'}://${sharedHost}/?room=${encodeURIComponent(roomId)}`});
  }
  if(req.method==='GET'&&url.pathname==='/api/room/events'){
   let room=rooms.get(roomId);if(!room){room=new Map();rooms.set(roomId,room);}if(room.size>=64)return reply(res,503,{error:'room-full'});
   const id=randomUUID(),token=randomBytes(24).toString('hex');let index=0;while([...room.values()].some(c=>c.slot===index))index++;
   const client={id,token,res,slot:index,name:`同修 ${id.slice(0,4)}`,state:{scene:'hall',x:[0,-1.1,1.1,-2.2,2.2][index%5],z:7+Math.floor(index/5)*.55,rotation:0,mode:'idle',phase:0,mat:null},lastPost:0};
   res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});res.write(': connected\n\n');
   room.set(id,client);send(res,'welcome',{id,token,actors:[...room.values()].map(publicActor)});publish(room,'actor',publicActor(client));
   const heartbeat=setInterval(()=>res.write(': heartbeat\n\n'),15000);heartbeat.unref();
   req.on('close',()=>{clearInterval(heartbeat);room.delete(id);publish(room,'leave',{id});if(!room.size)rooms.delete(roomId);});return;
  }
  if(req.method==='POST'&&['/api/room/state','/api/room/greet'].includes(url.pathname)){
   let body='',oversized=false;req.on('data',chunk=>{body+=chunk;if(body.length>4096){oversized=true;body='';}});
   req.on('end',()=>{if(oversized)return reply(res,413,{error:'too-large'});let data;try{data=JSON.parse(body);}catch{return reply(res,400,{error:'invalid-json'});}
    const room=rooms.get(roomId),client=room?.get(data.id);if(!client||data.token!==client.token)return reply(res,401,{error:'session-expired'});
    if(url.pathname==='/api/room/greet'){
     const target=room.get(data.target);if(!target||target===client)return reply(res,404,{error:'guest-not-found'});
     if(Date.now()-(client.lastGreeting||0)<1500)return reply(res,429,{error:'greet-too-frequent'});
     if(Math.hypot(client.state.x-target.state.x,client.state.z-target.state.z)>12)return reply(res,409,{error:'too-far'});
     client.lastGreeting=Date.now();send(target.res,'greeting',{from:client.id,name:client.name});return reply(res,200,{ok:true});
    }
    if(Date.now()-client.lastPost<50)return reply(res,429,{error:'too-frequent'});
    const s=data.state;if(!s||!SCENES.has(s.scene)||!MODES.has(s.mode)||![s.x,s.z,s.rotation,s.phase].every(Number.isFinite))return reply(res,400,{error:'invalid-state'});
    const mat=s.scene==='hall'&&MAT_IDS.has(s.mat)?s.mat:null;
    if(mat&&[...room.values()].some(c=>c.id!==client.id&&c.state.scene==='hall'&&c.state.mat===mat))return reply(res,409,{error:'mat-occupied'});
    client.lastPost=Date.now();client.state={scene:s.scene,x:Math.max(WORLD_BOUNDS.minX,Math.min(WORLD_BOUNDS.maxX,s.x)),z:Math.max(WORLD_BOUNDS.minZ,Math.min(WORLD_BOUNDS.maxZ,s.z)),rotation:s.rotation%(Math.PI*2),mode:s.mode,phase:Math.max(0,Math.min(7.2,s.phase)),mat};
    publish(room,'actor',publicActor(client));reply(res,200,{ok:true});
   });return;
  }reply(res,405,{error:'method'});
 }
 return {middleware,close(){for(const room of rooms.values())for(const client of room.values())client.res.end();rooms.clear();}};
}
