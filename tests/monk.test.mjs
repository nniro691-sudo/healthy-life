import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createMonk,BOW_DURATION} from '../src/monk.js';

test('a full bow keeps every mesh above the temple floor and returns to standing',()=>{
 const monk=createMonk();let lowest=Infinity;
 for(let frame=0;frame<=384;frame++){
  const t=frame/60;monk.update(t,1/60,'bow',t,false);monk.root.updateMatrixWorld(true);
  monk.root.traverse(object=>{if(!object.isMesh)return;const position=object.geometry.attributes.position;const point=new THREE.Vector3();for(let i=0;i<position.count;i++){point.fromBufferAttribute(position,i).applyMatrix4(object.matrixWorld);lowest=Math.min(lowest,point.y);assert.ok(Number.isFinite(point.y));}});
 }
 assert.ok(lowest>=-.012,`geometry crossed floor: ${lowest}`);
 monk.update(0,1,'idle',0,false);const standing=monk.headAnchor.clone();
 monk.update(BOW_DURATION,1,'bow',BOW_DURATION,false);
 assert.ok(monk.headAnchor.distanceTo(standing)<.001,'cycle must end in the standing pose');
});

test('switching between prayer, bow and walking never moves the world root',()=>{
 const monk=createMonk();monk.root.position.set(1,0,-2);
 for(const mode of ['palms','bow','walk','idle'])for(let i=0;i<30;i++)monk.update(i/60,1/60,mode,i/60,mode==='walk');
 assert.deepEqual(monk.root.position.toArray(),[1,0,-2]);
});

test('walking swings each hand with the opposite foot across a complete stride',()=>{
 const monk=createMonk();
 const leftHand=monk.root.getObjectByName('left-hand'),rightHand=monk.root.getObjectByName('right-hand');
 const leftFoot=monk.root.getObjectByName('left-foot'),rightFoot=monk.root.getObjectByName('right-foot');
 for(let frame=0;frame<180;frame++){
  monk.update(frame/60,1/60,'walk',0,true);
  if(frame<30||Math.abs(leftFoot.position.z+.035)<.03)continue;
  assert.ok(leftHand.position.z*(leftFoot.position.z+.035)<0,'same-side limbs must swing in opposite directions');
  assert.ok(rightHand.position.z*(rightFoot.position.z+.035)<0);
  assert.ok(leftHand.position.z*(rightFoot.position.z+.035)>0,'opposite limbs advance together');
 }
});
