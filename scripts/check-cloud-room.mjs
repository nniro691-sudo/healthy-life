import assert from 'node:assert/strict';
const base=process.argv[2]||'https://shan-si-multiplayer.tingzhang1119.chatgpt.site',room='check-'+Date.now().toString(36);
const post=(path,data)=>fetch(base+'/api/room/'+path+'?room='+room,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://nniro691-sudo.github.io'},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
const pause=()=>new Promise(r=>setTimeout(r,130));
let a,b;
try{
 for(const label of ['a','b']){const res=await post('join',{});assert.equal(res.status,200,'join '+label);const data=await res.json();if(label==='a')a=data;else b=data;}
 assert.equal(b.actors.length,2);const pose={scene:'hall',x:0,z:7,rotation:0,mode:'bow',phase:2.3,mat:'mat-12'};
 await pause();assert.equal((await post('sync',{...a,state:pose})).status,200);
 await pause();assert.equal((await post('sync',{...b,state:pose})).status,409);
 const data=await (await post('sync',{...b,state:{...pose,mat:null,mode:'palms'}})).json();assert.equal(data.actors.find(x=>x.id===a.id).mode,'bow');
 assert.equal((await post('greet',{...a,target:b.id})).status,200);await pause();
 let sync=await (await post('sync',{...b,state:{...pose,mat:null}})).json();assert.equal(sync.greetings[0].from,a.id);
 assert.equal((await post('greet',{...b,target:a.id})).status,200);await pause();sync=await (await post('sync',{...a,state:pose})).json();assert.equal(sync.greetings[0].from,b.id);
 await pause();assert.equal((await post('sync',{...a,state:{...pose,mode:'incense',phase:6.2}})).status,200);
 await pause();sync=await (await post('sync',{...b,state:{...pose,mat:null}})).json();assert.equal(sync.actors.find(x=>x.id===a.id).mode,'incense');
 await post('leave',a);a=null;await pause();assert.equal((await post('sync',{...b,state:pose})).status,200);
 console.log('PASS: public anonymous clients, bow/incense sync, mat exclusion, mutual greeting and disconnect release');
}finally{if(a)await post('leave',a).catch(()=>{});if(b)await post('leave',b).catch(()=>{});}
