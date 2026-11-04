import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createCushions} from '../src/cushions.js';
import {resetEyeView} from '../src/viewpoint.js';
import {MATS,MAT_HEIGHT} from '../src/mats.js';
test('all prayer mats can be picked through the same panoramic perspective used by the characters',()=>{
 const cushions=createCushions();cushions.group.updateMatrixWorld(true);const camera=new THREE.PerspectiveCamera(58,1280/720,.1,100);resetEyeView(camera,{target:new THREE.Vector3(),update(){camera.lookAt(this.target);}},new THREE.Vector3(0,0,7));camera.updateMatrixWorld(true);
 for(const mat of MATS){const screen=new THREE.Vector3(mat.x,MAT_HEIGHT,mat.z).project(camera),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(screen.x,screen.y),camera);const hits=ray.intersectObjects(cushions.targets);assert.ok(hits.length,`no hit for ${mat.id}`);assert.equal(hits[0].object.userData.matId,mat.id);}
});
