import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {fitStatue,scanBounds,STATUE_ASSETS} from '../src/statues.js';

// Decode the shipped scan geometry without browser-only image decoding.
async function scanGeometry(file){
 const bytes=await readFile(file),jsonLength=bytes.readUInt32LE(12);
 const doc=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
 const original=structuredClone(doc);
 delete doc.images;delete doc.textures;delete doc.materials;
 for(const mesh of doc.meshes)for(const primitive of mesh.primitives)delete primitive.material;
 let json=Buffer.from(JSON.stringify(doc));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
 const binary=bytes.subarray(20+jsonLength),header=Buffer.alloc(20);
 header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(20+json.length+binary.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);
 const output=Buffer.concat([header,json,binary]);
 const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(output.buffer.slice(output.byteOffset,output.byteOffset+output.byteLength),'');
 return {scene:gltf.scene,metadata:original};
}

test('museum scans preserve detailed volumetric geometry and fit the altar without distortion',async()=>{
 for(const [kind,asset] of Object.entries(STATUE_ASSETS)){
  const {scene,metadata}=await scanGeometry(new URL('../public'+asset.url,import.meta.url));
  assert.match(metadata.asset.extras.author,kind==='seated'?/Miguel Bandera/:/Minneapolis Institute of Art/);
  assert.match(metadata.asset.extras.license,kind==='seated'?/CC-BY-4.0/:/CC-BY-SA/);
  let triangles=0;scene.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n));}});
  assert.ok(triangles>(kind==='seated'?15000:60000),'actual detailed scan, not a coarse procedural substitute');
  const fitted=fitStatue(scene,asset),bounds=scanBounds(fitted),size=bounds.getSize(new THREE.Vector3());
  assert.ok(Math.abs(size.y-asset.height)<1e-5);
  assert.ok(Math.abs(bounds.min.y)<1e-5,'scan base touches the altar');
  assert.ok(size.z>1&&size.x>1);
  assert.ok(Math.abs(bounds.getCenter(new THREE.Vector3()).x)<1e-5);
 }
});
