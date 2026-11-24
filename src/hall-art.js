import {ART_LAYOUT} from './art-layout.js';
import * as THREE from 'three';
import {assetUrl} from './asset-url.js';
import {loadResource} from './load-resource.js';
// Like the retained main Buddha, this is explicitly a devotional image surface,
// mounted inside real architecture. The shared atlas is downloaded only once.
export function mountHallArt(group,index,texture){
 const t=texture.clone();t.needsUpdate=true;const bounds=ART_LAYOUT.halls[index];t.offset.fromArray(bounds.offset);t.repeat.fromArray(bounds.repeat);t.anisotropy=4;
 const height=6.35,width=Math.min(5.3,height*bounds.aspect);const m=new THREE.MeshBasicMaterial({map:t,transparent:true,alphaTest:.18,side:THREE.DoubleSide,toneMapped:false});const figure=new THREE.Mesh(new THREE.PlaneGeometry(width,height),m);figure.name='devotional-image-'+index;figure.position.set(0,.63+height/2,-5.8);group.add(figure);return figure;
}
export function loadHallArt(){return loadResource(new THREE.TextureLoader(),assetUrl('/assets/five-halls-devotional-atlas.webp')).then(t=>{t.colorSpace=THREE.SRGBColorSpace;return t;});}
