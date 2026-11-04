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


test('entire palms and bow geometry stays above mobile HUD through every movement phase',async()=>{
 const {frameMobileVisitor}=await import('../src/viewpoint.js');
 const {createMonk,BOW_DURATION}=await import('../src/monk.js');
 const {CHARACTER_SCALE}=await import('../src/mats.js');
 for(const [width,height] of [[375,560],[390,680],[430,740]])for(const z of [7,-5,-9.5])for(const angle of [0,Math.PI/4,Math.PI/2]){
  const visitor=new THREE.Vector3(0,0,z),camera=new THREE.PerspectiveCamera(58,width/height,.1,160),controls={target:new THREE.Vector3(),update(){camera.lookAt(this.target);}};
  resetEyeView(camera,controls,visitor,true);camera.position.sub(controls.target).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(controls.target);keepEyeHeight(camera);camera.lookAt(controls.target);
  const bottom=height-170;frameMobileVisitor(camera,visitor,{width,height,top:90,bottom,landmark:z<3?new THREE.Vector3(0,12.5,-13.65):null});camera.updateMatrixWorld(true);
  for(const mode of ['palms','bow']){const monk=createMonk();monk.root.position.copy(visitor);monk.root.scale.setScalar(CHARACTER_SCALE);
   for(let t=0;t<=BOW_DURATION;t+=.4){monk.update(t,.4,mode,t,false,false);monk.root.updateMatrixWorld(true);
    monk.root.traverseVisible(o=>{if(!o.isMesh)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const box=o.geometry.boundingBox;
     for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new THREE.Vector3(x,y,z).applyMatrix4(o.matrixWorld).project(camera),screen=(1-p.y)*height/2;assert.ok(screen<=bottom+.5,`${mode} at ${t.toFixed(1)}s hidden below HUD (${width}x${height})`);assert.ok(screen>=89.5,'whole head and body clear the header');}
    });
   }
  }
 }
});

test('mobile drag through 360 degrees and both zoom limits keep the full action footprint in the safe viewport',async()=>{
 const {frameMobileVisitor}=await import('../src/viewpoint.js');
 for(const [width,height] of [[375,560],[390,680],[430,740],[844,390],[740,280],[568,260]])for(const z of [7,-5,-9.5])for(const distance of [2.2,3.5,6.4,9])for(let angle=0;angle<Math.PI*2;angle+=Math.PI/4)for(const polar of [1.2,2.3]){
  const visitor=new THREE.Vector3(0,0,z),camera=new THREE.PerspectiveCamera(58,width/height,.1,160),target=visitor.clone().add(new THREE.Vector3(0,lookHeight(visitor),0));
  camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(new THREE.Spherical(distance,polar,angle)));keepEyeHeight(camera);camera.position.z=Math.max(camera.position.z,-10.6);camera.lookAt(target);
  const landscape=width>height;const safe={width,height,top:landscape?62:90,bottom:height-(landscape?90:170),left:72,right:width-(landscape?110:82),landmark:z<3?new THREE.Vector3(0,12.5,-13.65):null};frameMobileVisitor(camera,visitor,safe);camera.updateMatrixWorld(true);
  for(const x of [-.7,.7])for(const y of [-.02,1.45])for(const dz of [-.7,.7]){const p=visitor.clone().add(new THREE.Vector3(x,y,dz)).project(camera),px=(p.x+1)*width/2,py=(1-p.y)*height/2;
   assert.ok(p.z<1&&p.z>-1,'whole visitor stays in front of the camera');
   assert.ok(px>=safe.left-.5&&px<=safe.right+.5,`horizontal clipping: angle=${angle} distance=${distance}, x=${px}`);
   assert.ok(py>=safe.top-.5&&py<=safe.bottom+.5,`HUD overlap: angle=${angle} distance=${distance}, y=${py}`);
  }
 }
});

test('rotating between portrait and compact landscape recalculates framing without losing the visitor',async()=>{
 const {frameMobileVisitor,compactViewport}=await import('../src/viewpoint.js');
 const visitor=new THREE.Vector3(0,0,-9.5),camera=new THREE.PerspectiveCamera(58,1,.1,160),controls={target:new THREE.Vector3(),update(){camera.lookAt(this.target);}};
 resetEyeView(camera,controls,visitor,true);
 for(const [width,height] of [[390,680],[844,390],[740,280],[568,260],[390,680],[932,430],[430,740],[1143,720]]){
  camera.aspect=width/height;camera.updateProjectionMatrix();
  const landscape=width>height,top=landscape?62:90,bottom=height-(landscape?90:170);
  frameMobileVisitor(camera,visitor,{width,height,top,bottom,left:72,right:width-(landscape?110:82),landmark:new THREE.Vector3(0,12.5,-13.65)});camera.updateMatrixWorld(true);
  if(!compactViewport(width,height)){assert.equal(camera.zoom,1);assert.ok(!camera.view?.enabled);continue;}
  for(const x of [-.7,.7])for(const y of [-.02,1.45])for(const z of [-.7,.7]){const p=visitor.clone().add(new THREE.Vector3(x,y,z)).project(camera),py=(1-p.y)*height/2;assert.ok(py>=top-.5&&py<=bottom+.5,`rotation clipping at ${width}x${height}: ${py}`);}
 }
});
