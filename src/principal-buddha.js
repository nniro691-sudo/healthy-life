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
  if(texture.image&&typeof document!=='undefined'){
   // Fit the actual alpha silhouette, not the transparent image margins.
   const img=texture.image,canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
   const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(img,0,0);
   const data=context.getImageData(0,0,img.width,img.height).data;let minX=img.width,minY=img.height,maxX=0,maxY=0;
   for(let y=0;y<img.height;y++)for(let x=0;x<img.width;x++)if(data[(y*img.width+x)*4+3]>12){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
   if(maxY>minY){const width=maxX-minX+1,height=maxY-minY+1;texture.offset.set(minX/img.width,1-(maxY+1)/img.height);texture.repeat.set(width/img.width,height/img.height);figure.scale.x=Math.min(7.9,PRINCIPAL_HEIGHT*width/height);}
  }
  return figure;
 }
 if(loadTextures){group.userData.ready=loadResource(new THREE.TextureLoader(),PRINCIPAL_IMAGE).then(texture=>{texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;mount(texture);return group;}).catch(error=>{console.error('主佛图像加载失败',error);if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('statue-load-error'));});}
 else{mount(new THREE.Texture());group.userData.ready=Promise.resolve(group);}
 return group;
}
