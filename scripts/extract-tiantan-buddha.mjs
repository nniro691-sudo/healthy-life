import {readFile,writeFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {subdivideScan} from './subdivide-scan.mjs';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
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
 const gltf=await new GLTFLoader().parseAsync(output.buffer.slice(output.byteOffset,output.byteOffset+output.byteLength),'');
 return {scene:gltf.scene,metadata:original};
}



const {scene,metadata}=await scanGeometry(process.argv[2]);scene.updateMatrixWorld(true);
const positions=[],uvs=[],p=new THREE.Vector3(),tri=[],uv=[];
scene.traverse(o=>{if(!o.isMesh)return;const g=o.geometry,vertices=g.attributes.position,tex=g.attributes.uv,index=g.index;
 for(let i=0;i<index.count;i+=3){tri.length=0;uv.length=0;for(let k=0;k<3;k++){const id=index.getX(i+k);tri.push(new THREE.Vector3().fromBufferAttribute(vertices,id).applyMatrix4(o.matrixWorld));uv.push(new THREE.Vector2().fromBufferAttribute(tex,id));}
  if(tri.some(v=>v.y<5.25||Math.hypot(v.x-.7,v.z-2.5)>2.55))continue;
  for(let k=0;k<3;k++){positions.push(...tri[k].toArray());uvs.push(...uv[k].toArray());}
 }
});
let geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry=mergeVertices(geometry,.00001);geometry=subdivideScan(geometry,2);
const doc={asset:{version:'2.0',generator:'Temple scan crop',extras:{...metadata.asset.extras,adaptation:'Statue and lotus extracted from surrounding terrain; no replacement hands or face. Two Loop subdivision passes smooth coarse scan facets; gold material applied at runtime.'}},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0,NORMAL:1,TEXCOORD_0:2},indices:3,material:0}]}],materials:[{name:'Gold body',pbrMetallicRoughness:{baseColorFactor:[.485,.254,.037,1],metallicFactor:.68,roughnessFactor:.56}}],accessors:[],bufferViews:[],buffers:[]};
const chunks=[];let offset=0;
function add(array,target){const raw=Buffer.from(array.buffer,array.byteOffset,array.byteLength),padding=Buffer.alloc((-raw.length%4+4)%4);doc.bufferViews.push({buffer:0,byteOffset:offset,byteLength:raw.length,target});chunks.push(raw,padding);offset+=raw.length+padding.length;return doc.bufferViews.length-1;}
for(const [name,type] of [['position','VEC3'],['normal','VEC3'],['uv','VEC2']]){const a=geometry.attributes[name];const accessor={bufferView:add(a.array,34962),componentType:5126,count:a.count,type};if(name==='position'){accessor.min=geometry.boundingBox.min.toArray();accessor.max=geometry.boundingBox.max.toArray();}doc.accessors.push(accessor);}
const index=new Uint32Array(geometry.index.array);doc.accessors.push({bufferView:add(index,34963),componentType:5125,count:index.length,type:'SCALAR'});
const originalBytes=await readFile(process.argv[2]),originalJsonSize=originalBytes.readUInt32LE(12),originalBinary=originalBytes.subarray(28+originalJsonSize);
const originalImage=metadata.images[0],imageView=metadata.bufferViews[originalImage.bufferView];
const imageData=originalBinary.subarray(imageView.byteOffset||0,(imageView.byteOffset||0)+imageView.byteLength);
doc.images=[{mimeType:'image/webp',bufferView:add(imageData)}];doc.textures=[{extensions:{EXT_texture_webp:{source:0}}}];doc.extensionsUsed=doc.extensionsRequired=['EXT_texture_webp'];doc.materials[0].pbrMetallicRoughness.baseColorTexture={index:0};
doc.buffers=[{byteLength:offset}];let json=Buffer.from(JSON.stringify(doc));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const binary=Buffer.concat(chunks),head=Buffer.alloc(20),binHead=Buffer.alloc(8);head.writeUInt32LE(0x46546c67,0);head.writeUInt32LE(2,4);head.writeUInt32LE(28+json.length+binary.length,8);head.writeUInt32LE(json.length,12);head.writeUInt32LE(0x4e4f534a,16);binHead.writeUInt32LE(binary.length,0);binHead.writeUInt32LE(0x004e4942,4);
await writeFile('public/assets/models/tiantan-buddha.glb',Buffer.concat([head,json,binHead,binary]));console.log({triangles:index.length/3,bounds:geometry.boundingBox,bytes:28+json.length+binary.length});
