import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile,readdir} from 'node:fs/promises';
import {roomFetch} from '../cloud-deployment/worker/rooms.js';
class D1 {
 constructor(){this.sql=new DatabaseSync(':memory:');}
 prepare(sql){const db=this;return {values:[],bind(...values){this.values=values;return this;},async run(){const r=db.sql.prepare(sql).run(...this.values);return {meta:{changes:Number(r.changes)}};},async all(){return {results:db.sql.prepare(sql).all(...this.values)};},async first(){return db.sql.prepare(sql).get(...this.values)||null;}};}
 async batch(statements){this.sql.exec('BEGIN');try{const values=[];for(const s of statements)values.push(await (/^SELECT/.test(s.sql||'')?s.all():null));this.sql.exec('COMMIT');return values;}catch(e){this.sql.exec('ROLLBACK');throw e;}}
}
// Match D1's ordered, atomic batch using SQLite's real unique constraint enforcement.
D1.prototype.prepare=function(sql){const db=this;return {sql,values:[],bind(...values){this.values=values;return this;},async run(){const r=db.sql.prepare(sql).run(...this.values);return {meta:{changes:Number(r.changes)}};},async all(){return {results:db.sql.prepare(sql).all(...this.values)};},async first(){return db.sql.prepare(sql).get(...this.values)||null;}};};
D1.prototype.batch=async function(statements){this.sql.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await (/^SELECT/.test(s.sql)?s.all():s.run()));this.sql.exec('COMMIT');return out;}catch(e){this.sql.exec('ROLLBACK');throw e;}};
test('shared cloud rooms synchronize actions, enforce mats, deliver greetings and expire visitors',async()=>{
 const DB=new D1(),dir=new URL('../cloud-deployment/drizzle/',import.meta.url);for(const name of (await readdir(dir)).filter(n=>n.endsWith('.sql')).sort())DB.sql.exec(await readFile(new URL(name,dir),'utf8'));
 const call=(path,data={},room='test',origin='https://nniro691-sudo.github.io')=>roomFetch(new Request(`https://temple.test/api/room/${path}?room=${room}`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(data)}),{DB});
 const a=await (await call('join')).json(),b=await (await call('join')).json();assert.equal(b.actors.length,2);assert.ok(!('token' in b.actors[0]));
 const pose={scene:'hall',x:0,z:7,rotation:0,mode:'bow',phase:2.3,mat:'mat-12'};
 DB.sql.exec('UPDATE actors SET updated=updated-200');
 assert.equal((await call('sync',{...a,state:pose})).status,200);
 assert.equal((await call('sync',{...b,state:pose})).status,409);
 DB.sql.exec('UPDATE actors SET updated=updated-200');
 const seen=await (await call('sync',{...b,state:{...pose,mat:null,mode:'palms'}})).json();assert.equal(seen.actors.find(x=>x.id===a.id).mode,'bow');
 assert.equal((await call('greet',{...a,target:b.id})).status,200);
 DB.sql.exec('UPDATE actors SET updated=updated-200');
 assert.equal((await (await call('sync',{...b,state:{...pose,mat:null}})).json()).greetings[0].from,a.id);
 assert.equal((await call('greet',{...a,target:b.id})).status,429);
 assert.equal((await call('sync',{...a,token:'invalid',state:pose})).status,401);
 assert.equal((await call('sync',{...a,state:pose},'other')).status,401);
 assert.equal((await call('join',{},'test','https://evil.example')).status,403);
 await call('leave',a);DB.sql.exec('UPDATE actors SET updated=updated-200');assert.equal((await call('sync',{...b,state:pose})).status,200);
 DB.sql.exec('UPDATE actors SET updated=updated-16000');assert.equal((await call('sync',{...b,state:pose})).status,401);
 DB.sql.close();
});
