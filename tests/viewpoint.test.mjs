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

test('mobile visitor feet and incense stay above the action bar throughout the altar approach',async()=>{
 const {frameMobileVisitor}=await import('../src/viewpoint.js');
 for(const [width,height,hud] of [[390,680,510],[430,740,570],[375,560,390]])for(const z of [7,0,-5,-9.5]){
  const camera=new THREE.PerspectiveCamera(58,width/height,.1,160),controls={target:new THREE.Vector3(),update(){camera.lookAt(this.target);}};
  const visitor=new THREE.Vector3(0,0,z);resetEyeView(camera,controls,visitor,true);
  frameMobileVisitor(camera,visitor,{width,height,top:90,bottom:hud-18,landmark:z<3?new THREE.Vector3(0,12.5,-13.65):null});
  camera.updateMatrixWorld(true);
  for(const y of [0.01,.5,1,1.45]){const p=visitor.clone().add(new THREE.Vector3(0,y,0)).project(camera),screen=(1-p.y)*height/2;assert.ok(screen<=hud-17.5,`feet/action hidden at z=${z}, viewport=${width}x${height}`);assert.ok(screen>=89.5,'head and incense clear the header');}
  if(z<3){const crown=new THREE.Vector3(0,12.5,-13.65).project(camera);assert.ok((1-crown.y)*height/2>=89.5,'Buddha crown remains in the mobile composition');}
  assert.equal(camera.position.y,1.65,'framing preserves human eye height');
 }
});
