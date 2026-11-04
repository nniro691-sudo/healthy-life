import {MATS,WORLD_BOUNDS} from './mats.js';
const scenes=new Set(['hall','court','gate','tree']),modes=new Set(['idle','walk','palms','bow','incense']),mats=new Set(MATS.map(m=>m.id));
const WEB='https://nniro691-sudo.github.io/healthy-life/',TTL=15000;
const actor=row=>({id:row.id,name:row.name,...JSON.parse(row.state)});
export async function roomFetch(request,env){
 const origin=request.headers.get('origin'),allowed=origin==='https://nniro691-sudo.github.io'||origin===new URL(request.url).origin||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin||'');
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(allowed?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}:{})};
 const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers});
 if(origin&&!allowed)return reply(403,{error:'origin'});
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 const url=new URL(request.url),room=url.searchParams.get('room')||'mountain-temple',path=url.pathname;
 if(!/^[a-zA-Z0-9_-]{1,32}$/.test(room))return reply(400,{error:'invalid-room'});
 if(path==='/api/room/info'&&request.method==='GET')return reply(200,{url:WEB+'?room='+encodeURIComponent(room)});
 if(path==='/api/room/health')return reply(200,{ok:true,transport:'poll',storage:'shared'});
 if(!env.DB)return reply(503,{error:'database-unavailable'});
 const db=env.DB,now=Date.now(),cutoff=now-TTL;
 let data={};
 if(request.method==='POST'){
  if(Number(request.headers.get('content-length'))>4096)return reply(413,{error:'too-large'});
  try{const body=await request.text();if(body.length>4096)return reply(413,{error:'too-large'});data=JSON.parse(body);}catch{return reply(400,{error:'invalid-json'});}
 }else return reply(405,{error:'method'});
 try{
  if(path==='/api/room/join'){
   await db.prepare('DELETE FROM actors WHERE updated < ?').bind(cutoff).run();
   const id=crypto.randomUUID(),token=crypto.randomUUID()+crypto.randomUUID(),name='同修 '+id.slice(0,4);
   const count=await db.prepare('SELECT COUNT(*) AS count FROM actors WHERE room=?').bind(room).first();
   const slot=count.count,state={scene:'hall',x:[0,-1.1,1.1,-2.2,2.2][slot%5],z:7+Math.floor(slot/5)*.55,rotation:0,mode:'idle',phase:0,mat:null};
   const result=await db.prepare('INSERT INTO actors(id,token,room,name,state,mat,updated) SELECT ?,?,?,?,?,NULL,? WHERE (SELECT COUNT(*) FROM actors WHERE room=?) < 64').bind(id,token,room,name,JSON.stringify(state),now,room).run();
   if(!result.meta.changes)return reply(503,{error:'room-full'});
   const rows=await db.prepare('SELECT id,name,state FROM actors WHERE room=? AND updated>=?').bind(room,cutoff).all();
   return reply(200,{id,token,actors:rows.results.map(actor)});
  }
  const client=await db.prepare('SELECT * FROM actors WHERE id=? AND token=? AND room=? AND updated>=?').bind(data.id||'',data.token||'',room,cutoff).first();
  if(!client)return reply(401,{error:'session-expired'});
  if(path==='/api/room/leave'){
   await db.prepare('DELETE FROM actors WHERE id=? AND token=?').bind(client.id,client.token).run();return reply(200,{ok:true});
  }
  if(path==='/api/room/sync'){
   const s=data.state;if(!s||!scenes.has(s.scene)||!modes.has(s.mode)||![s.x,s.z,s.rotation,s.phase].every(Number.isFinite))return reply(400,{error:'invalid-state'});
   if(now-client.updated<100)return reply(429,{error:'too-frequent'});
   const mat=s.scene==='hall'&&mats.has(s.mat)?s.mat:null;
   const state={scene:s.scene,x:Math.max(WORLD_BOUNDS.minX,Math.min(WORLD_BOUNDS.maxX,s.x)),z:Math.max(WORLD_BOUNDS.minZ,Math.min(WORLD_BOUNDS.maxZ,s.z)),rotation:s.rotation%(Math.PI*2),mode:s.mode,phase:Math.max(0,Math.min(7.2,s.phase)),mat};
   const results=await db.batch([
    db.prepare('DELETE FROM actors WHERE room=? AND updated<?').bind(room,cutoff),
    db.prepare('UPDATE actors SET state=?,mat=?,updated=? WHERE id=?').bind(JSON.stringify(state),mat,now,client.id),
    db.prepare('SELECT id,name,state FROM actors WHERE room=? AND updated>=?').bind(room,cutoff),
    db.prepare('SELECT id,sender AS "from",name FROM greetings WHERE target=? AND created>=? ORDER BY created').bind(client.id,cutoff)
   ]);
   return reply(200,{actors:results[2].results.map(actor),greetings:results[3].results});
  }
  if(path==='/api/room/greet'){
   if(now-client.last_greet<1500)return reply(429,{error:'greet-too-frequent'});
   const target=await db.prepare('SELECT * FROM actors WHERE id=? AND room=? AND updated>=?').bind(data.target||'',room,cutoff).first();
   if(!target||target.id===client.id)return reply(404,{error:'guest-not-found'});
   const a=JSON.parse(client.state),b=JSON.parse(target.state);
   if(Math.hypot(a.x-b.x,a.z-b.z)>12)return reply(409,{error:'too-far'});
   await db.batch([
    db.prepare('DELETE FROM greetings WHERE created<?').bind(cutoff),
    db.prepare('UPDATE actors SET last_greet=? WHERE id=?').bind(now,client.id),
    db.prepare('INSERT INTO greetings(id,room,sender,target,name,created) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),room,client.id,target.id,client.name,now)
   ]);return reply(200,{ok:true});
  }
  return reply(404,{error:'not-found'});
 }catch(error){if(String(error).includes('UNIQUE constraint failed: actors.room, actors.mat'))return reply(409,{error:'mat-occupied'});console.error('room database error',String(error));return reply(503,{error:'room-unavailable'});}
}
