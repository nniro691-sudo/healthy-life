import {ART_LAYOUT} from './art-layout.js';
import * as THREE from 'three';
import {assetUrl} from './asset-url.js';
import {loadResource} from './load-resource.js';
// Like the retained main Buddha, this is explicitly a devotional image surface,
// mounted inside real architecture. The shared atlas is downloaded only once.
export function mountHallArt(group,index,texture){
 const bounds=index===1 ? null : ART_LAYOUT.halls[index];
 const map=bounds ? texture.clone() : texture;
 if(bounds){
  map.offset.fromArray(bounds.offset);
  map.repeat.fromArray(bounds.repeat);
  map.needsUpdate=true;
 }
 map.anisotropy=4;
 const aspect=bounds?.aspect ?? map.image.width/map.image.height;
 const height=Math.min(6.35,5.3/aspect);
 const material=new THREE.MeshBasicMaterial({map,transparent:true,alphaTest:.18,side:THREE.DoubleSide,toneMapped:false});
 const figure=new THREE.Mesh(new THREE.PlaneGeometry(height*aspect,height),material);
 figure.name='devotional-image-'+index;
 figure.position.set(0,.63+height/2,-5.8);
 group.add(figure);
}

export function loadHallArt(id){
 const asset=id==='wenchang' ? 'samantabhadra.webp' : 'five-halls-devotional-atlas.webp';
 return loadResource(new THREE.TextureLoader(),assetUrl('/assets/'+asset)).then(texture=>{
  texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
 });
}
