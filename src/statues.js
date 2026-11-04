import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {loadResource} from './load-resource.js';
import {assetUrl} from './asset-url.js';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export const STATUE_ASSETS={
 seated:{url:assetUrl('/assets/models/tiantan-buddha.glb'),height:7.2,rotation:0},
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
   const principal=asset===STATUE_ASSETS.seated;
   object.material=new THREE.MeshPhysicalMaterial({color:principal?0xb98b36:0xb98a36,metalness:principal?.62:.68,roughness:principal?.57:.60,clearcoat:principal?.025:0,clearcoatRoughness:.55,map:principal?source.map:null,normalMap:principal?null:source.normalMap||null,normalScale:new THREE.Vector2(.65,.65),aoMap:principal?null:source.aoMap||null,aoMapIntensity:.55,side:THREE.DoubleSide});
   if(principal&&source.map){
    // Cancel low-frequency photographic illumination/patina rather than painting
    // those shadows onto the gold. Retain only gentle, filtered local relief.
    object.material.onBeforeCompile=shader=>{
     shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vStatueLocal;').replace('#include <begin_vertex>','#include <begin_vertex>\nvStatueLocal=position;');
     shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vStatueLocal;').replace('#include <map_fragment>',`#ifdef USE_MAP
     vec3 luminanceWeights=vec3(.2126,.7152,.0722);
     float fineLuma=dot(texture2D(map,vMapUv).rgb,luminanceWeights);
     float broadLuma=dot(texture2D(map,vMapUv,4.5).rgb,luminanceWeights);
     float relief=clamp(log2((fineLuma+.035)/(broadLuma+.035)),-1.0,.40);
     float face=smoothstep(7.75,8.0,vStatueLocal.y)*(1.0-smoothstep(8.75,8.95,vStatueLocal.y))*(1.0-smoothstep(.45,.80,abs(vStatueLocal.x-.7)))*smoothstep(2.5,2.9,vStatueLocal.z);
     float raisedHand=(1.0-smoothstep(-.25,.1,vStatueLocal.x))*smoothstep(6.65,6.9,vStatueLocal.y)*(1.0-smoothstep(7.65,7.9,vStatueLocal.y));
     float restingHand=smoothstep(1.0,1.25,vStatueLocal.x)*(1.0-smoothstep(6.4,6.7,vStatueLocal.y));
     float detailStrength=max(.075,max(face*.42,max(raisedHand,restingHand)*.24));
     float localRelief=1.0+relief*detailStrength;
     float facialTone=clamp(pow(max(fineLuma,.015)/.32,.62),.48,1.05);
     float featureMask=max(face,max(raisedHand,restingHand)*.65);
     diffuseColor.rgb*=mix(localRelief,facialTone,featureMask*.75);
     #endif`);
    };
    object.material.customProgramCacheKey=()=> 'clean-gold-relief-v3';
   }
   object.castShadow=object.receiveShadow=true;
  });
  return gltf.scene;
 }).catch(error=>{cache.delete(asset.url);throw error;}));
 return cache.get(asset.url);
}

export function createStatue({standing=false,loadAssets=true}={}){
 const root=new THREE.Group();root.name=standing?'standing-bodhisattva':'seated-buddha';
 const asset=STATUE_ASSETS[standing?'standing':'seated'];
 // A thin pierced mandorla sits behind the scan, never across its silhouette.
 const gold=new THREE.MeshStandardMaterial({color:0x96702f,metalness:.72,roughness:.48});
 const radius=standing?2.12:3.28,center=standing?3.0:3.65;
 for(let i=0;i<2;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(radius+i*.12,.035,8,128),gold);ring.position.set(0,center,-1.12);root.add(ring);}
 if(loadAssets){
  root.userData.ready=loadScan(asset).then(model=>{const fitted=fitStatue(model.clone(true),asset);root.add(fitted);root.userData.loaded=true;return fitted;}).catch(error=>{
   root.userData.error=error.message;console.error('佛像扫描资源加载失败',asset.url,error);
   if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('statue-load-error'));
  });
 }
 return root;
}
