import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {loadResource} from './load-resource.js';
import {assetUrl} from './asset-url.js';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export const STATUE_ASSETS={
 standing:{url:assetUrl('/assets/models/bodhisattva-compact.glb'),height:5.9,rotation:0},
};
const cache=new Map();

// Preserve the museum scan's original proportions and place its actual base
// on the altar. The same geometry and normal maps are shared by both attendants.
export function scanBounds(model){
 model.updateWorldMatrix(true,true);const bounds=new THREE.Box3(),point=new THREE.Vector3();
 model.traverse(object=>{if(!object.isMesh)return;const {position}=object.geometry.attributes,indices=object.geometry.index?.array;
  if(indices){for(const index of new Set(indices)){point.fromBufferAttribute(position,index).applyMatrix4(object.matrixWorld);bounds.expandByPoint(point);}}
  else for(let i=0;i<position.count;i++){point.fromBufferAttribute(position,i).applyMatrix4(object.matrixWorld);bounds.expandByPoint(point);}
 });return bounds;
}
export function fitStatue(model,{height,rotation=0}){
 const mount=new THREE.Group();mount.add(model);model.rotation.y+=rotation;
 let bounds=scanBounds(model);const scale=height/(bounds.max.y-bounds.min.y);model.scale.multiplyScalar(scale);
 bounds=scanBounds(model);
 model.position.sub(new THREE.Vector3((bounds.min.x+bounds.max.x)/2,bounds.min.y,(bounds.min.z+bounds.max.z)/2));
 mount.updateMatrixWorld(true);return mount;
}

function loadScan(asset){
 if(!cache.has(asset.url))cache.set(asset.url,loadResource(new GLTFLoader().setMeshoptDecoder(MeshoptDecoder),asset.url).then(gltf=>{
  gltf.scene.traverse(object=>{if(!object.isMesh)return;
   // Geometry and the attendant's baked normal/occlusion maps remain intact.
   // Replace the aged paint finish with restrained gold leaf, never self-lit.
   const source=object.material;
   object.material=new THREE.MeshPhysicalMaterial({color:0xb98a36,metalness:.68,roughness:.60,clearcoat:0,clearcoatRoughness:.55,normalMap:source.normalMap||null,normalScale:new THREE.Vector2(.65,.65),aoMap:source.aoMap||null,aoMapIntensity:.55,side:THREE.DoubleSide});
   object.castShadow=object.receiveShadow=true;
  });
  return gltf.scene;
 }).catch(error=>{cache.delete(asset.url);throw error;}));
 return cache.get(asset.url);
}

export function createStatue({loadAssets=true}={}){
 const root=new THREE.Group();root.name='standing-bodhisattva';
 const asset=STATUE_ASSETS.standing;
 // A thin pierced mandorla sits behind the scan, never across its silhouette.
 const gold=new THREE.MeshStandardMaterial({color:0x96702f,metalness:.72,roughness:.48});
 const radius=2.12,center=3.0;
 for(let i=0;i<2;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(radius+i*.12,.035,8,128),gold);ring.position.set(0,center,-1.12);root.add(ring);}
 if(loadAssets){
  root.userData.ready=loadScan(asset).then(model=>{const fitted=fitStatue(model.clone(true),asset);root.add(fitted);root.userData.loaded=true;return fitted;}).catch(error=>{
   root.userData.error=error.message;console.error('佛像扫描资源加载失败',asset.url,error);
   if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('statue-load-error'));
  });
 }
 return root;
}
