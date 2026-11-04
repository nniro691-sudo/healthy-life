import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {createPrincipalBuddha,PRINCIPAL_HEIGHT,PRINCIPAL_IMAGE} from '../src/principal-buddha.js';
import {resetEyeView} from '../src/viewpoint.js';

test('the tall principal image has transparent portrait pixels and fits the visitor view',async()=>{
 const image=await readFile(new URL('../public'+PRINCIPAL_IMAGE,import.meta.url));
 assert.equal(image.subarray(0,4).toString(),'RIFF');assert.equal(image.subarray(8,12).toString(),'WEBP');
 assert.equal(image.subarray(12,16).toString(),'VP8X');assert.ok(image[20]&0x10,'transparent alpha must be retained');
 assert.ok(1+image.readUIntLE(24,3)>=1024);assert.ok(1+image.readUIntLE(27,3)>=1536);assert.ok(image.length<600000,'high resolution principal stays below 600 KB');
 const principal=createPrincipalBuddha({loadTextures:false});principal.position.set(0,.90,-13.9);principal.updateMatrixWorld(true);
 const figure=principal.getObjectByName('high-resolution-shakyamuni');assert.ok(figure.material.transparent);assert.ok(PRINCIPAL_HEIGHT>11);
 const camera=new THREE.PerspectiveCamera(58,1280/720,.1,160),controls={target:new THREE.Vector3(),update(){camera.lookAt(this.target);}};
 resetEyeView(camera,controls,new THREE.Vector3(0,0,7));camera.updateMatrixWorld(true);
 const crown=new THREE.Vector3(0,.9+PRINCIPAL_HEIGHT,-13.65).project(camera),base=new THREE.Vector3(0,.9,-13.65).project(camera);
 assert.ok(crown.y<.82&&crown.y>0,'crown must clear the header and stay in view');assert.ok(base.y>-.8&&base.y<crown.y);
});
