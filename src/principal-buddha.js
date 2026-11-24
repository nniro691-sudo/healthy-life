import {ART_LAYOUT} from './art-layout.js';
import {loadResource} from './load-resource.js';
import {assetUrl} from './asset-url.js';
import * as THREE from 'three';

export const PRINCIPAL_HEIGHT=11.6;
export const PRINCIPAL_IMAGE=assetUrl('/assets/shakyamuni-gold-hd.webp');

// A high-resolution transparent devotional image inside the real 3D sanctuary.
// It is deliberately a fixed image surface, not presented as a scanned 3D statue.
export function createPrincipalBuddha({loadTextures=true}={}){
 const group=new THREE.Group();group.name='principal-buddha-image';
 const gold=new THREE.MeshStandardMaterial({color:0xb58b3f,metalness:.55,roughness:.46});
 for(let i=0;i<3;i++){
  const halo=new THREE.Mesh(new THREE.TorusGeometry(3.62+i*.12,.035,10,144),gold);
  halo.position.set(0,5.85,-.95);halo.scale.y=1.50;group.add(halo);
 }
 function mount(texture){
  const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.15,side:THREE.DoubleSide,toneMapped:false});
  const figure=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);figure.name='high-resolution-shakyamuni';
  figure.position.set(0,PRINCIPAL_HEIGHT/2,.25);figure.scale.set(PRINCIPAL_HEIGHT*2/3,PRINCIPAL_HEIGHT,1);group.add(figure);
  const bounds=ART_LAYOUT.principal[0];texture.offset.fromArray(bounds.offset);texture.repeat.fromArray(bounds.repeat);figure.scale.x=Math.min(7.9,PRINCIPAL_HEIGHT*bounds.aspect);

  return figure;
 }
 if(loadTextures){group.userData.ready=loadResource(new THREE.TextureLoader(),PRINCIPAL_IMAGE).then(texture=>{texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;mount(texture);return group;}).catch(error=>{console.error('主佛图像加载失败',error);if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('statue-load-error'));});}
 else{mount(new THREE.Texture());group.userData.ready=Promise.resolve(group);}
 return group;
}
