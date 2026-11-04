import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,stat} from 'node:fs/promises';
async function bytes(path){let size=0;for(const entry of await readdir(path,{withFileTypes:true})){const child=new URL(entry.name+(entry.isDirectory()?'/':''),path);size+=entry.isDirectory()?await bytes(child):(await stat(child)).size;}return size;}
test('public scene resources fit the mobile download budget',async()=>{
 assert.ok(await bytes(new URL('../public/',import.meta.url))<5_000_000,'keep public assets below 5 MB; remove unused files before adding heavy art');
 for(const name of ['shakyamuni-gold-hd.webp','pine-canopy.webp','hall.webp'])assert.ok((await stat(new URL('../public/assets/'+name,import.meta.url))).size<1_000_000,`${name} must remain below 1 MB`);
});
