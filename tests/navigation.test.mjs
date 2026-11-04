import test from 'node:test';
import assert from 'node:assert/strict';
import {regionAt,clampToWalkable,needsEntrance} from '../src/navigation.js';
import {createTemple} from '../src/temple.js';
import {MATS,CHARACTER_SCALE} from '../src/mats.js';
test('a continuous world contains all four areas and constrains walls and tree trunks',()=>{
 assert.equal(regionAt(0,7),'hall');assert.equal(regionAt(0,22),'court');assert.equal(regionAt(0,34),'gate');assert.equal(regionAt(15,22),'tree');
 assert.equal(clampToWalkable({x:18,z:5}).x,10.3);assert.equal(clampToWalkable({x:18,z:22}).x,18);assert.ok(clampToWalkable({x:15,z:22}).x>=16.1);
 assert.equal(needsEntrance({x:15,z:22},{x:0,z:5}),true);assert.equal(needsEntrance({x:0,z:20},{x:0,z:5}),false);
 assert.equal(MATS.length,64);assert.ok(CHARACTER_SCALE<1);
});
test('panoramic architecture consists of real merged geometry rather than a background image',()=>{
 const temple=createTemple({loadTextures:false});let meshes=0;temple.group.traverse(o=>{if(o.isMesh)meshes++;});assert.ok(meshes>10&&meshes<100,`static draw count ${meshes}`);assert.ok(temple.floor.isMesh);assert.ok(temple.anchors.gate.distanceTo(temple.anchors.hall)>20);
});
