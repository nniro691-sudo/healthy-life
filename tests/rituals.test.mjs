import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createRitualModel} from '../src/ritual-viewer.js';
import {createMonk,INCENSE_DURATION} from '../src/monk.js';
test('prayer beads flow continuously and advancing moves the physical beads',()=>{const model=createRitualModel('beads');const before=model.beads[0].position.clone();model.update(1,.05);assert.ok(before.distanceTo(model.beads[0].position)>.01);const flow=model.beads[0].position.clone();model.advance();for(let i=0;i<30;i++)model.update(1+i/60,1/60);assert.ok(flow.distanceTo(model.beads[0].position)>.10);});
test('incense has a complete grounded animation and returns cleanly to idle',()=>{const monk=createMonk();const point=new THREE.Vector3();for(let frame=0;frame<=Math.round(INCENSE_DURATION*30);frame++){monk.update(frame/30,1/30,'incense',frame/30,false);monk.root.updateMatrixWorld(true);monk.root.traverse(o=>{if(!o.isMesh||!o.visible)return;const attr=o.geometry.attributes.position;for(let i=0;i<attr.count;i++){point.fromBufferAttribute(attr,i).applyMatrix4(o.matrixWorld);assert.ok(Number.isFinite(point.y));assert.ok(point.y>=-.012);}});}monk.update(0,1,'idle',0,false);assert.equal(monk.root.position.y,0);});
