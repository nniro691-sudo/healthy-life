import test from 'node:test';
import assert from 'node:assert/strict';
import {regionAt,clampToWalkable,needsEntrance} from '../src/navigation.js';
import {createTemple} from '../src/temple.js';
import {MATS,CHARACTER_SCALE} from '../src/mats.js';
test('a continuous world contains all four areas and constrains walls and tree trunks',()=>{
 assert.equal(regionAt(0,7),'hall');assert.equal(regionAt(0,22),'court');assert.equal(regionAt(0,34),'gate');assert.equal(regionAt(15,22),'tree');
 assert.equal(clampToWalkable({x:18,z:5}).x,18);assert.ok(clampToWalkable({x:11.8,z:5}).x>12);assert.equal(clampToWalkable({x:18,z:22}).x,18);assert.ok(clampToWalkable({x:15,z:22}).x>=16.1);
 assert.equal(needsEntrance({x:15,z:22},{x:0,z:5}),true);assert.equal(needsEntrance({x:0,z:20},{x:0,z:5}),false);
 assert.equal(MATS.length,124);assert.ok(CHARACTER_SCALE<1);
});
test('panoramic architecture consists of real merged geometry rather than a background image',()=>{
 const errors=[],originalError=console.error;let temple;try{console.error=(...args)=>{if(String(args[0]).includes('mergeGeometries'))errors.push(args);else originalError(...args);};temple=createTemple({loadTextures:false});}finally{console.error=originalError;}assert.equal(errors.length,0,'curved shrine panels must survive geometry batching');let meshes=0;temple.group.traverse(o=>{if(o.isMesh)meshes++;});assert.ok(meshes>10&&meshes<100,`static draw count ${meshes}`);assert.ok(temple.floor.isMesh);assert.ok(temple.anchors.gate.distanceTo(temple.anchors.hall)>20);
});

import {HALLS} from '../src/halls.js';
import {pathBetween,walkable} from '../src/navigation.js';
test('all five new halls are reachable through real doors and every prayer mat has a clear route',()=>{for(const h of HALLS){assert.equal(regionAt(h.x,h.z+5.5),h.id);for(const target of [{x:h.x,z:h.z+5.5},...MATS.filter(m=>m.scene===h.id)]){const route=pathBetween({x:0,z:22},target);assert.ok(route.length,`no path to ${h.id}`);for(const p of route)assert.ok(walkable(p.x,p.z));}}});
