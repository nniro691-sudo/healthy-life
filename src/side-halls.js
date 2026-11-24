import {createShrineBackdrop} from './shrine-backdrop.js';
import {loadHallArt,mountHallArt} from './hall-art.js';
import * as THREE from 'three';
import {HALLS} from './halls.js';
// Original geometric shrine designs: no remote assets or additional model downloads.
export function createSideHalls({labels=true}={}){
 const root=new THREE.Group();root.name='five-side-halls';const mounts=[];let pending=null;
 const mat=(color,metalness=0,roughness=.65)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const gold=mat(0xd8ae59,.62,.38),wood=mat(0x5e251e),dark=mat(0x271e19),stone=mat(0x8c8472),roof=mat(0x344a43);
 function mesh(g,m,x,y,z,p){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o;}
 const box=(w,h,d,m,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,p);
 const cyl=(rt,rb,h,m,x,y,z,p)=>mesh(new THREE.CylinderGeometry(rt,rb,h,32),m,x,y,z,p);
 function ell(rx,ry,rz,m,x,y,z,p){const o=mesh(new THREE.SphereGeometry(1,32,24),m,x,y,z,p);o.scale.set(rx,ry,rz);return o;}
 function rod(a,b,r,m,p){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const o=cyl(r,r,v.length(),m,...new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5).toArray(),p);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 function plaque(text,w,h,x,y,z,p){box(w+.24,h+.20,.20,gold,x,y,z-.06,p);box(w,h,.24,dark,x,y,z,p);if(!labels||typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#efd38e';ctx.font='600 120px "Songti SC",serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,132,970);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;mesh(new THREE.PlaneGeometry(w*.94,h*.9),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide}),x,y,z+.135,p);}
 for(const h of HALLS){const p=new THREE.Group();p.name=h.id+'-hall';p.position.set(h.x,0,h.z);root.add(p);const accent=mat(h.color,.16);
  box(14.8,.14,18.8,stone,0,-.09,0,p);box(14,9,.5,wood,0,4.5,-9,p);for(const s of [-1,1]){box(.5,9,18,wood,s*7,4.5,0,p);for(let z=-6;z<=6;z+=4){box(.54,3,2.4,dark,s*6.98,3.5,z,p);for(let k=0;k<5;k++)box(.58,2.8,.035,gold,s*6.98,3.5,z-.95+k*.48,p);}box(4.2,8,.5,wood,s*4.9,4,9,p);for(const z of [-7,0,8.5]){cyl(.26,.34,8.8,wood,s*6.5,4.4,z,p);cyl(.42,.44,.20,stone,s*6.5,.1,z,p);cyl(.30,.30,.10,gold,s*6.5,8,z,p);}}
  box(14.4,.3,19.3,dark,0,9.1,0,p);for(let x=-5;x<=5;x+=2.5)for(let z=-6;z<=6;z+=3){box(2.2,.08,2.7,accent,x,8.91,z,p);box(2.3,.10,.08,gold,x,8.85,z+1.35,p);}
  for(const s of [-1,1])for(let i=0;i<7;i++){const a=i/7,b=(i+1)/7,xa=s*a*8.2,xb=s*b*8.2,ya=11.8-a*2+Math.pow(a,6)*.7,yb=11.8-b*2+Math.pow(b,6)*.7;const strip=box(Math.hypot(xb-xa,yb-ya)+.04,.18,21,roof,(xa+xb)/2,(ya+yb)/2,0,p);strip.rotation.z=Math.atan2(yb-ya,xb-xa);rod([xa,ya+.12,10.5],[xb,yb+.12,10.5],.08,gold,p);}
  rod([0,11.94,-10.5],[0,11.94,10.5],.13,gold,p);plaque(h.name,5.0,1.2,0,7.7,9.34,p);
  box(7.5,.5,4,wood,0,.25,-6,p);box(7.8,.12,4.2,gold,0,.56,-6,p);p.add(createShrineBackdrop(h.id,{textures:labels}));mounts.push(p);
  box(6,.60,1.1,wood,0,.30,-3.8,p);box(6.3,.12,1.3,gold,0,.66,-3.8,p);cyl(.40,.26,.38,gold,0,.98,-3.8,p);for(let j=-1;j<=1;j++)rod([j*.12,1.1,-3.8],[j*.12,1.9,-3.8],.012,dark,p);for(const s of [-1,1]){cyl(.18,.3,.4,gold,s*2.2,.95,-3.8,p);cyl(.07,.07,.5,mat(0xa62823),s*2.2,1.4,-3.8,p);ell(.045,.09,.045,gold,s*2.2,1.72,-3.8,p);}
  for(const s of [-1,1]){cyl(.32,.32,.75,mat(0xca823a,.05),s*4.2,5.8,6,p);cyl(.4,.4,.09,gold,s*4.2,6.2,6,p);rod([s*4.2,6.2,6],[s*4.2,8.9,6],.025,dark,p);}
  const light=new THREE.SpotLight(0xffdca3,145,22,.8,.65,1.4);light.position.set(0,7,1);light.target.position.set(0,4,-6);p.add(light,light.target);
  // Broad, level paths connect every open doorway to the central garden walk.
  box(5,.035,15,stone,h.x===0?0:-h.x/2,.02,16,p);if(h.x!==0)box(Math.abs(h.x)+4,.036,4,stone,-h.x/2,.023,12,p);
 }
 root.userData.load=()=>{if(!labels)return Promise.resolve();if(!pending)pending=loadHallArt().then(t=>{mounts.forEach((p,i)=>mountHallArt(p,i,t));}).catch(error=>{pending=null;console.error('殿内造像加载失败',error);window.dispatchEvent(new CustomEvent('statue-load-error'));});return pending;};return root;
}
