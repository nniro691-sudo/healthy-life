import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {resetEyeView,keepEyeHeight,lookHeight} from '../src/viewpoint.js';

test('eye-level view follows the visitor across the temple and looks upward near the Buddha',()=>{
 const camera=new THREE.PerspectiveCamera(58,16/9,.1,160),controls={target:new THREE.Vector3(),update(){camera.lookAt(this.target);}};
 for(const z of [-9.5,7,22,33])for(const mobile of [false,true]){
  const visitor=new THREE.Vector3(0,0,z);resetEyeView(camera,controls,visitor,mobile);
  assert.equal(camera.position.y,1.65);
  assert.ok(camera.position.distanceTo(visitor)<7,'viewer stays near the visitor');
  assert.ok(controls.target.y>=1.4&&controls.target.y<=4.2);
 }
 assert.ok(lookHeight(new THREE.Vector3(0,0,-9.5))>lookHeight(new THREE.Vector3(0,0,7)));
 for(const height of [-10,0,6,20]){camera.position.y=height;keepEyeHeight(camera);assert.ok(camera.position.y>=1.5&&camera.position.y<=1.85);}
});
