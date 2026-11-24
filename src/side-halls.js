import {createShrineBackdrop} from './shrine-backdrop.js';
import {loadHallArt,mountHallArt} from './hall-art.js';
import * as THREE from 'three';
import {HALLS} from './halls.js';
// Original geometric shrine designs: no remote assets or additional model downloads.
export function createSideHalls({labels=true}={}){
 const root=new THREE.Group();root.name='five-side-halls';const art=labels?loadHallArt():null,loads=[];
 const mat=(color,metalness=0,roughness=.65)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const gold=mat(0xd8ae59,.62,.38),wood=mat(0x5e251e),dark=mat(0x271e19),stone=mat(0x8c8472),roof=mat(0x344a43),ivory=mat(0xd8cba4,.15),skin=mat(0xd2a65e,.46,.45);
 function mesh(g,m,x,y,z,p){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o;}
 const box=(w,h,d,m,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,p);
 const cyl=(rt,rb,h,m,x,y,z,p)=>mesh(new THREE.CylinderGeometry(rt,rb,h,32),m,x,y,z,p);
 function ell(rx,ry,rz,m,x,y,z,p){const o=mesh(new THREE.SphereGeometry(1,32,24),m,x,y,z,p);o.scale.set(rx,ry,rz);return o;}
 function rod(a,b,r,m,p){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const o=cyl(r,r,v.length(),m,...new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5).toArray(),p);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 function ring(r,t,m,x,y,z,p){return mesh(new THREE.TorusGeometry(r,t,10,64),m,x,y,z,p);}
 function plaque(text,w,h,x,y,z,p){box(w+.24,h+.20,.20,gold,x,y,z-.06,p);box(w,h,.24,dark,x,y,z,p);if(!labels||typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#efd38e';ctx.font='600 120px "Songti SC",serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,132,970);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;mesh(new THREE.PlaneGeometry(w*.94,h*.9),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide}),x,y,z+.135,p);}
 function statue(h,p){const figure=new THREE.Group();figure.position.set(0,1.2,-5.8);p.add(figure);figure.name=h.id+'-devotional-sculpture';const robe=mat(h.id==='guanyin'?0xcfc7a4:h.color,.25,.53);
  cyl(2.25,2.5,.3,gold,0,.15,0,figure);for(let tier=0;tier<2;tier++)for(let i=0;i<20;i++){const a=i*Math.PI/10;const petal=ell(.32,.19,.7,gold,Math.sin(a)*(1.7-tier*.15),.4+tier*.3,Math.cos(a)*(1.7-tier*.15),figure);petal.rotation.y=a;}
  ell(1.7,.52,1.1,robe,0,1.04,.1,figure);ell(.9,1.3,.62,robe,0,2.2,0,figure);
  // Draped garment follows smooth lathed curves rather than angular primitives.
  const profile=[[.35,.8],[1.25,1],[1.08,1.4],[.77,2],[.84,2.75],[.55,3.25]].map(([r,y])=>new THREE.Vector2(r,y));mesh(new THREE.LatheGeometry(profile,64),robe,0,0,0,figure);
  for(let j=0;j<10;j++){const a=j/9*Math.PI-.5*Math.PI;const points=[new THREE.Vector3(Math.sin(a)*.50,3.0,.56),new THREE.Vector3(Math.sin(a)*.63,2.25,.64),new THREE.Vector3(Math.sin(a)*1.18,1.18,.81)];const curve=new THREE.CatmullRomCurve3(points);mesh(new THREE.TubeGeometry(curve,22,.025,6,false),gold,0,0,0,figure);}
  cyl(.24,.3,.3,skin,0,3.35,.06,figure);ell(.56,.75,.5,skin,0,4.04,.07,figure);for(const s of [-1,1]){ell(.13,.28,.13,skin,s*.53,3.96,.05,figure);const eye=ell(.16,.021,.025,dark,s*.23,4.10,.516,figure);eye.rotation.z=s*.08;const brow=ell(.19,.023,.028,gold,s*.24,4.25,.49,figure);brow.rotation.z=s*.12;}
  ell(.09,.17,.13,skin,0,4.04,.55,figure);ell(.17,.028,.035,wood,0,3.83,.533,figure);ell(.27,.16,.13,skin,0,3.64,.36,figure);
  for(const s of [-1,1]){rod([s*.67,2.85,0],[s*1.01,2.12,.48],.24,robe,figure);rod([s*1.01,2.12,.48],[s*.82,2.52,.88],.17,robe,figure);ell(.18,.23,.13,skin,s*.82,2.58,.9,figure);for(let k=0;k<4;k++)rod([s*.91+k*.055,2.56,.98],[s*.91+k*.055,2.81,.98],.024,skin,figure);}
  const halo=ring(1.2,.055,gold,0,4.05,-.53,figure);halo.scale.y=1.26;
  if(h.id==='guanyin'||h.id==='wenshu'){cyl(.5,.55,.22,gold,0,4.70,.06,figure);for(let i=0;i<5;i++){const x=(i-2)*.22;ell(.11,.25+(.1-Math.abs(x)*.1),.10,gold,x,4.94,.18,figure);}ell(.07,.10,.06,mat(0x7e2f28,.5),0,4.92,.31,figure);}
  if(h.id==='guanyin'){cyl(.14,.23,.48,ivory,.82,2.95,.91,figure);cyl(.1,.1,.16,gold,.82,3.26,.91,figure);rod([.82,3.34,.91],[1.18,4.1,.84],.018,mat(0x54704a),figure);for(let j=0;j<6;j++)ell(.12,.03,.045,mat(0x54704a),.95+j*.04,3.55+j*.08,.88,figure);}
  if(h.id==='wenchang'||h.id==='caishen'){box(1.0,.52,.8,dark,0,4.78,.08,figure);for(const s of [-1,1]){const wing=box(.78,.10,.4,gold,s*.86,4.76,.05,figure);wing.rotation.z=s*.12;}for(let j=0;j<7;j++)rod([0,3.80,.53],[(j-3)*.06,3.05,.68],.035,dark,figure);}
  if(h.id==='wenchang'){box(.9,.52,.10,ivory,.85,2.92,1.03,figure);box(.95,.06,.16,gold,.85,3.20,1.03,figure);rod([-.85,2.75,.98],[-.55,3.6,.98],.035,gold,figure);}
  if(h.id==='wenshu'){rod([-.86,2.6,.96],[-1.30,4.65,.96],.055,gold,figure);const blade=box(.16,1.25,.07,ivory,-1.22,4.17,.96,figure);blade.rotation.z=.21;box(.66,.10,.14,gold,-1.07,3.49,.96,figure);box(.7,.15,.48,ivory,.83,2.99,1.04,figure);for(let i=0;i<3;i++)box(.72,.018,.5,gold,.83,2.95+i*.07,1.04,figure);}
  if(h.id==='dizang'){const crown=new THREE.Group();figure.add(crown);for(let i=-2;i<=2;i++){const a=i*.45;const panel=box(.32,.65,.10,gold,Math.sin(a)*.53,4.82,Math.cos(a)*.4,crown);panel.rotation.y=a;ell(.085,.12,.05,skin,Math.sin(a)*.55,4.85,Math.cos(a)*.47,crown);}rod([-1.16,.7,.5],[-1.16,5.4,.5],.05,gold,figure);ring(.33,.045,gold,-1.16,5.48,.5,figure);for(let j=0;j<6;j++)ring(.12,.025,gold,-1.16+Math.cos(j*Math.PI/3)*.32,5.48+Math.sin(j*Math.PI/3)*.32,.5,figure);ell(.22,.22,.22,ivory,.82,2.98,.97,figure);}
  if(h.id==='caishen'){const ingot=ell(.65,.25,.3,gold,0,2.68,1.08,figure);for(const s of [-1,1])ell(.17,.30,.28,gold,s*.52,2.86,1.08,figure);for(let i=0;i<7;i++){const c=cyl(.22,.22,.08,gold,(i-3)*.38,.95,1.4,figure);c.rotation.x=Math.PI/2;}}
 }
 for(const h of HALLS){const p=new THREE.Group();p.name=h.id+'-hall';p.position.set(h.x,0,h.z);root.add(p);const accent=mat(h.color,.16);
  box(14.8,.14,18.8,stone,0,-.09,0,p);box(14,9,.5,wood,0,4.5,-9,p);for(const s of [-1,1]){box(.5,9,18,wood,s*7,4.5,0,p);for(let z=-6;z<=6;z+=4){box(.54,3,2.4,dark,s*6.98,3.5,z,p);for(let k=0;k<5;k++)box(.58,2.8,.035,gold,s*6.98,3.5,z-.95+k*.48,p);}box(4.2,8,.5,wood,s*4.9,4,9,p);for(const z of [-7,0,8.5]){cyl(.26,.34,8.8,wood,s*6.5,4.4,z,p);cyl(.42,.44,.20,stone,s*6.5,.1,z,p);cyl(.30,.30,.10,gold,s*6.5,8,z,p);}}
  box(14.4,.3,19.3,dark,0,9.1,0,p);for(let x=-5;x<=5;x+=2.5)for(let z=-6;z<=6;z+=3){box(2.2,.08,2.7,accent,x,8.91,z,p);box(2.3,.10,.08,gold,x,8.85,z+1.35,p);}
  for(const s of [-1,1])for(let i=0;i<7;i++){const a=i/7,b=(i+1)/7,xa=s*a*8.2,xb=s*b*8.2,ya=11.8-a*2+Math.pow(a,6)*.7,yb=11.8-b*2+Math.pow(b,6)*.7;const strip=box(Math.hypot(xb-xa,yb-ya)+.04,.18,21,roof,(xa+xb)/2,(ya+yb)/2,0,p);strip.rotation.z=Math.atan2(yb-ya,xb-xa);rod([xa,ya+.12,10.5],[xb,yb+.12,10.5],.08,gold,p);}
  rod([0,11.94,-10.5],[0,11.94,10.5],.13,gold,p);plaque(h.name,5.0,1.2,0,7.7,9.34,p);
  box(7.5,.5,4,wood,0,.25,-6,p);box(7.8,.12,4.2,gold,0,.56,-6,p);p.add(createShrineBackdrop(h.id,{textures:labels}));if(art){loads.push(art.then(t=>mountHallArt(p,HALLS.indexOf(h),t)).catch(e=>{console.error('殿内造像加载失败',e);statue(h,p);}));}else statue(h,p);
  box(6,.60,1.1,wood,0,.30,-3.8,p);box(6.3,.12,1.3,gold,0,.66,-3.8,p);cyl(.40,.26,.38,gold,0,.98,-3.8,p);for(let j=-1;j<=1;j++)rod([j*.12,1.1,-3.8],[j*.12,1.9,-3.8],.012,dark,p);for(const s of [-1,1]){cyl(.18,.3,.4,gold,s*2.2,.95,-3.8,p);cyl(.07,.07,.5,mat(0xa62823),s*2.2,1.4,-3.8,p);ell(.045,.09,.045,gold,s*2.2,1.72,-3.8,p);}
  for(const s of [-1,1]){cyl(.32,.32,.75,mat(0xca823a,.05),s*4.2,5.8,6,p);cyl(.4,.4,.09,gold,s*4.2,6.2,6,p);rod([s*4.2,6.2,6],[s*4.2,8.9,6],.025,dark,p);}
  const light=new THREE.SpotLight(0xffdca3,145,22,.8,.65,1.4);light.position.set(0,7,1);light.target.position.set(0,4,-6);p.add(light,light.target);
  // Broad, level paths connect every open doorway to the central garden walk.
  box(5,.035,15,stone,h.x===0?0:-h.x/2,.02,16,p);if(h.x!==0)box(Math.abs(h.x)+4,.036,4,stone,-h.x/2,.023,12,p);
 }
 root.userData.ready=Promise.all(loads);return root;
}
