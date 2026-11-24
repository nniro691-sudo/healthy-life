import * as THREE from 'three';
import {assetUrl} from './asset-url.js';
import {loadResource} from './load-resource.js';
// Like the retained main Buddha, this is explicitly a devotional image surface,
// mounted inside real architecture. The shared atlas is downloaded only once.
export function mountHallArt(group,index,texture){
 const t=texture.clone();t.needsUpdate=true;const image=texture.image;
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,image.width,image.height).data;
 const start=Math.round(index*image.width/5),end=Math.round((index+1)*image.width/5);let minX=end,maxX=start,minY=image.height,maxY=0;
 for(let y=0;y<image.height;y++)for(let x=start;x<end;x++)if(pixels[(y*image.width+x)*4+3]>32){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
 if(maxX<=minX||maxY<=minY)throw Error('Empty shrine art');
 const w=maxX-minX+1,h=maxY-minY+1;t.offset.set(minX/image.width,1-(maxY+1)/image.height);t.repeat.set(w/image.width,h/image.height);t.anisotropy=4;
 const height=6.35,width=Math.min(5.3,height*w/h);const m=new THREE.MeshBasicMaterial({map:t,transparent:true,alphaTest:.18,side:THREE.DoubleSide,toneMapped:false});const figure=new THREE.Mesh(new THREE.PlaneGeometry(width,height),m);figure.name='devotional-image-'+index;figure.position.set(0,.63+height/2,-5.8);group.add(figure);return figure;
}
export function loadHallArt(){return loadResource(new THREE.TextureLoader(),assetUrl('/assets/five-halls-devotional-atlas.webp')).then(t=>{t.colorSpace=THREE.SRGBColorSpace;return t;});}
