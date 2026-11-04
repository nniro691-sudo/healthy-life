import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer,request} from 'node:http';
import {once} from 'node:events';
import {MATS,MAT_FOOT_OFFSET} from '../src/mats.js';
import {createRoomService} from '../server/rooms.js';
async function guest(base){const abort=new AbortController(),response=await fetch(`${base}/api/room/events?room=test`,{signal:abort.signal}),reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',queue=[],waiter;
 const pump=(async()=>{try{while(true){const {value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});let end;while((end=buffer.indexOf('\n\n'))>=0){const frame=buffer.slice(0,end);buffer=buffer.slice(end+2);if(!frame.startsWith('event:'))continue;const [event,data]=frame.split('\n');queue.push({type:event.slice(7),data:JSON.parse(data.slice(6))});waiter?.();}}}catch{}})();
 async function next(type,match=()=>true){const deadline=Date.now()+2000;while(Date.now()<deadline){const i=queue.findIndex(e=>e.type===type&&match(e.data));if(i>=0)return queue.splice(i,1)[0].data;await new Promise(resolve=>{waiter=resolve;setTimeout(resolve,30);});}throw Error(`Missing event ${type}`);}
 const welcome=await next('welcome');return {welcome,next,close:async()=>{abort.abort();await pump;},post:state=>fetch(`${base}/api/room/state?room=test`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:welcome.id,token:welcome.token,state})})};}
test('independent clients see each other, synchronize prayer, and cannot reserve the same mat',async()=>{
 const service=createRoomService(),server=createServer(service.middleware);server.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;let a,b;
 try{a=await guest(base);b=await guest(base);assert.equal(b.welcome.actors.length,2);await a.next('actor',x=>x.id===b.welcome.id);
 const pose={scene:'hall',x:MATS[12].x,z:MATS[12].z+MAT_FOOT_OFFSET,rotation:0,mode:'bow',phase:2.3,mat:'mat-12'};
 assert.equal((await a.post(pose)).status,200);const remote=await b.next('actor',x=>x.id===a.welcome.id&&x.mode==='bow');assert.equal(remote.mat,'mat-12');assert.equal(remote.phase,2.3);
 await new Promise(r=>setTimeout(r,60));assert.equal((await a.post({...pose,mode:'incense',phase:7.1})).status,200);const incense=await b.next('actor',x=>x.id===a.welcome.id&&x.mode==='incense');assert.equal(incense.phase,7.1);
 assert.equal((await b.post(pose)).status,409);assert.equal((await b.post({...pose,mat:'mat-11',x:MATS[11].x,z:MATS[11].z+MAT_FOOT_OFFSET})).status,200);
 const greeting=await fetch(`${base}/api/room/greet?room=test`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:a.welcome.id,token:a.welcome.token,target:b.welcome.id})});assert.equal(greeting.status,200);assert.equal((await b.next('greeting')).from,a.welcome.id);
 await a.close();a=null;await b.next('leave');await new Promise(r=>setTimeout(r,60));assert.equal((await b.post(pose)).status,200);
 await new Promise(r=>setTimeout(r,60));assert.equal((await b.post({...pose,scene:'gate',x:15,z:33,mat:null,mode:'walk'})).status,200);const moved=await b.next('actor',x=>x.scene==='gate');assert.equal(moved.x,15);assert.equal(moved.z,33);
 const invalid=await fetch(`${base}/api/room/state?room=test`,{method:'POST',body:JSON.stringify({id:b.welcome.id,token:'wrong',state:pose})});assert.equal(invalid.status,401);
 }finally{await a?.close();await b?.close();service.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
});

 test('invitation URL uses HTTPS behind a hosting proxy',async()=>{
 const service=createRoomService(),server=createServer(service.middleware);server.listen(0,'127.0.0.1');await once(server,'listening');
 try{const data=await new Promise((resolve,reject)=>{const req=request({hostname:'127.0.0.1',port:server.address().port,path:'/api/room/info?room=friends',headers:{host:'temple.example.com','x-forwarded-proto':'https'}},res=>{let body='';res.on('data',chunk=>body+=chunk);res.on('end',()=>resolve(JSON.parse(body)));});req.on('error',reject);req.end();});assert.equal(data.url,'https://temple.example.com/?room=friends');}finally{service.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
 });
