import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,stat} from 'node:fs/promises';
async function bytes(path){let size=0;for(const entry of await readdir(path,{withFileTypes:true})){const child=new URL(entry.name+(entry.isDirectory()?'/':''),path);size+=entry.isDirectory()?await bytes(child):(await stat(child)).size;}return size;}
test('public scene resources fit the mobile download budget',async()=>{
 assert.ok(await bytes(new URL('../public/',import.meta.url))<4_500_000,'six sanctuaries must keep total public assets below 4.5 MB');
 for(const name of ['shakyamuni-gold-hd.webp','pine-canopy.webp'])assert.ok((await stat(new URL('../public/assets/'+name,import.meta.url))).size<1_000_000,`${name} must remain below 1 MB`);
});

test('five additional devotional surfaces share one compressed transparent atlas',async()=>{const {readFile}=await import('node:fs/promises');const b=await readFile(new URL('../public/assets/five-halls-devotional-atlas.webp',import.meta.url));assert.equal(b.subarray(8,12).toString(),'WEBP');assert.equal(b.subarray(12,16).toString(),'VP8X');assert.ok(b[20]&0x10);assert.ok(b.length<500000);assert.ok(1+b.readUIntLE(24,3)>=1536);});
