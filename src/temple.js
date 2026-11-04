import {assetUrl} from './asset-url.js';
import * as THREE from 'three';
import {createPrincipalBuddha} from './principal-buddha.js';
import {createStatue} from './statues.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const material=(color,roughness=.85,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
export function createTemple({loadTextures=true}={}){
 const statueLoads=[];
 const group=new THREE.Group(),wood=material(0x57251d),darkWood=material(0x2b2019),stone=material(0x8a8779),gold=material(0xb58a3c,.32,.72),roof=material(0x303c38),wall=material(0xb4ac91),leaf=material(0x526947),red=material(0x9e3026);
 // Fine-grained procedural surface maps remain continuous from every camera angle.
 function surface(kind){const size=128,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const noise=Math.sin(x*12.9898+y*78.233)*43758.5453;const random=noise-Math.floor(noise);const value=kind==='wood'?.64+.13*Math.sin(x*.42+Math.sin(y*.032)*1.6)+random*.13:.62+random*.22+.06*Math.sin(x*.1)*Math.cos(y*.17);const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=Math.round(value*255);data[i+3]=255;}const texture=new THREE.DataTexture(data,size,size);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;return texture;}
 stone.map=surface('stone');wood.map=surface('wood');darkWood.map=wood.map;gold.metalness=.42;gold.emissive=new THREE.Color(0x50300c);gold.emissiveIntensity=.24;
 function mesh(g,m,x=0,y=0,z=0,parent=group){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(w,h,d,m,x,y,z,parent){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);}
 function sphere(rx,ry,rz,m,x,y,z,parent){const o=mesh(new THREE.SphereGeometry(1,32,20),m,x,y,z,parent);o.scale.set(rx,ry,rz);return o;}
 function cylinder(rt,rb,h,m,x,y,z,parent){return mesh(new THREE.CylinderGeometry(rt,rb,h,24),m,x,y,z,parent);}
 function beam(a,b,r,m,parent=group){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),o=mesh(new THREE.CylinderGeometry(r,r,v.length(),12),m,...new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5).toArray(),parent);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 // Continuous stone floor, with geometric paving: moving and orbiting preserve real perspective.
 const floor=mesh(new THREE.PlaneGeometry(100,110),material(0x393b33),0,-.025,14);floor.rotation.x=-Math.PI/2;
 const tiles=new THREE.InstancedMesh(new THREE.BoxGeometry(1.94,.035,1.94),stone,36*44),matrix=new THREE.Matrix4();let n=0;for(let x=-18;x<18;x++)for(let z=-17;z<27;z++){matrix.makeTranslation(x*2+.98,-.006,z*2+.98);tiles.setMatrixAt(n,matrix);tiles.setColorAt(n,new THREE.Color().setHSL(.12,.07,.32+((x*7+z*11+2000)%7)*.017));n++;}tiles.receiveShadow=true;group.add(tiles);
 // Dark dressed stone distinguishes the sanctuary from the rough courtyard paving.
 const polishedStone=material(0x514b3e,.42,.12);
 for(let x=-5;x<=5;x++)for(let z=-8;z<=6;z++)box(1.975,.014,1.975,polishedStone,x*2,.019,z*2);
 for(const x of [-10.65,-.72,.72,10.65])box(.025,.012,30,gold,x,.032,-1);
 for(const z of [-10.4,13.7])box(21.3,.012,.035,gold,0,.032,z);
 // Main hall: a real 24 × 34 metre timber volume open toward the courtyard.
 box(25,.28,35,darkWood,0,-.18,-2);
 // Vermilion columns, layered capitals and continuous enclosed galleries.
 const lacquer=material(0x72251d,.36),jade=material(0x244c43,.58),gilt=material(0xdbad52,.28,.58);
 gilt.emissive=new THREE.Color(0x79501c);gilt.emissiveIntensity=.18;
 function lotus(x,y,z,r,parent=group){
  for(let i=0;i<12;i++){const angle=i*Math.PI/6,petal=sphere(r*.19,r*.055,r*.44,gilt,x+Math.sin(angle)*r*.48,y,z+Math.cos(angle)*r*.48,parent);petal.rotation.y=angle;}
  cylinder(r*.19,r*.22,.065,gold,x,y-.03,z,parent);
 }
 for(const x of [-11,11])for(const z of [-15,-8,-1,6,13]){
  cylinder(.46,.52,16.7,lacquer,x,8.35,z);cylinder(.70,.76,.28,stone,x,.14,z);cylinder(.60,.67,.22,gold,x,.39,z);
  for(const y of [.60,1.05,15.85,16.1])cylinder(.49,.49,.10,gilt,x,y,z);
  for(let level=0;level<3;level++){const y=16.1+level*.27,w=.95+level*.52;box(w,.20,.45,gold,x,y,z);box(.45,.20,w,gold,x,y+.12,z);for(const sign of [-1,1]){box(.18,.28,.48,lacquer,x+sign*(w/2-.08),y+.15,z);box(.48,.28,.18,lacquer,x,y+.15,z+sign*(w/2-.08));}}
 }
 for(const z of [-15,-8,-1,6,13]){box(23,.55,.50,lacquer,0,16.64,z);for(const y of [16.38,16.88])box(23,.065,.57,gilt,0,y,z);}
 for(const x of [-11.8,11.8]){
  box(.4,17.3,32,lacquer,x,8.65,-2);
  for(let z=-14;z<=10;z+=3){box(.46,4.6,2.65,darkWood,x,3.55,z);for(let k=0;k<6;k++)box(.51,4.2,.035,gilt,x,3.55,z-1.12+k*.45);for(let h=0;h<7;h++)box(.52,.035,2.5,gilt,x,1.75+h*.60,z);box(.57,.18,2.85,gold,x,1.22,z);box(.57,.18,2.85,gold,x,5.9,z);}
 }
 box(24.2,18.5,.6,lacquer,0,9.25,-18);
 // Upper clerestory and horizontal cornices make the raised hall a continuous volume.
 for(const x of [-11.8,11.8])for(let z=-14;z<=10;z+=3){
  box(.48,7.6,2.65,darkWood,x,11.65,z);
  for(let i=0;i<6;i++)box(.54,7.3,.035,gilt,x,11.65,z-1.12+i*.45);
  for(const y of [7.75,15.55])box(.58,.12,2.86,gold,x,y,z);
 }
 // Recessed coffers create an architectural ceiling rather than bare roof planks.
 box(23,.18,32,darkWood,0,17.28,-2);
 for(let x=-9;x<=9;x+=3)for(let z=-15;z<=12;z+=3){
  box(2.76,.10,2.76,jade,x,17.12,z);
  for(const side of [-1,1]){box(2.86,.16,.10,gold,x,17.01,z+side*1.38);box(.10,.16,2.86,gold,x+side*1.38,17.01,z);box(2.5,.07,.035,gilt,x,16.98,z+side*1.20);box(.035,.07,2.5,gilt,x+side*1.20,16.98,z);}
  lotus(x,16.97,z,.66);
 }
 // An octagonal, stepped golden caisson crowns the central sanctuary.
 for(let i=0;i<5;i++){const ring=mesh(new THREE.TorusGeometry(2.7-i*.37,.09,8,8),gilt,0,16.93-i*.11,-7);ring.rotation.x=Math.PI/2;ring.rotation.z=Math.PI/8;}
 lotus(0,16.42,-7,1.0);
 // Tall side shrines give the altar a monumental three-bay composition.
 for(const side of [-1,1]){
  const x=side*7.4;
  box(4.4,7.4,.45,darkWood,x,4.2,-15.8);
  for(const dx of [-2,2]){cylinder(.18,.23,6.6,gold,x+dx,3.9,-15.2);box(.48,.20,.6,gilt,x+dx,7.25,-15.2);}
  box(4.9,.35,1.25,gold,x,7.5,-15.4);box(5.25,.16,1.5,lacquer,x,7.77,-15.4);
  box(4.2,.5,2.3,lacquer,x,.40,-14.4);box(4.45,.13,2.5,gold,x,.72,-14.4);
  const attendant=createStatue({standing:true,loadAssets:loadTextures});attendant.position.set(x,.84,-14.1);group.add(attendant);statueLoads.push(attendant.userData.ready);

 }
 // The curved roof is built as sloping strips with raised eaves, not a backdrop.
 for(const sign of [-1,1])for(let i=0;i<10;i++){const a=i/10,b=(i+1)/10,xa=sign*a*13,xb=sign*b*13,ya=19.4-a*3+Math.pow(a,6)*1.1,yb=19.4-b*3+Math.pow(b,6)*1.1;const strip=box(Math.hypot(xb-xa,yb-ya)+.03,.18,37,roof,(xa+xb)/2,(ya+yb)/2,-2);strip.rotation.z=Math.atan2(yb-ya,xb-xa);for(let z=-20;z<17;z+=3)beam([xa,ya+.13,z],[xb,yb+.13,z],.055,roof);}
 beam([0,19.56,-20],[0,19.56,16],.16,gold);
 // Altar and a sculpted seated Buddha, visible from the sides and from behind.
 box(8.5,.65,3.5,darkWood,0,.325,-13);box(8.9,.18,3.8,gold,0,.74,-13);
 const buddha=createPrincipalBuddha({loadTextures});buddha.position.set(0,.90,-13.9);group.add(buddha);statueLoads.push(buddha.userData.ready);
 // A recessed architectural niche replaces the old photographic Buddha panel.
 box(8.1,11.9,.40,darkWood,0,6.65,-16.5);
 for(const x of [-3.85,3.85])box(.11,11.5,.12,gold,x,6.65,-16.25);
 // Warm modelling light and cooler rim light give the gold readable depth.
 function shrineLight(position,target,color,power,angle){const light=new THREE.SpotLight(color,power,24,angle,.65,1.5);light.position.set(...position);light.target.position.set(...target);group.add(light,light.target);return light;}
 const key=shrineLight([-3.4,9.4,-8.0],[0,5.6,-13.7],0xffdfae,105,.65);
 key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0004;key.shadow.normalBias=.015;key.shadow.radius=4;
 shrineLight([2.4,8.2,-8.2],[0,6.4,-13.9],0xffe9c8,78,.62);
 shrineLight([0,7.8,-7.5],[0,6.9,-13.7],0xffe8bd,26,.38);
 shrineLight([0,10.5,-16.0],[0,6.8,-13.8],0xffae45,100,.60);
 for(const side of [-1,1]){shrineLight([side*5.3,6.6,-10.8],[side*7.4,4.4,-14.1],0xffd18a,110,.50);shrineLight([side*8.8,6.8,-15.5],[side*7.4,4.2,-14.1],0xffb654,65,.46);}
 // Deep, tiered gilded surround integrates the central sculpture into the physical shrine.
 for(const side of [-1,1]){
  for(let tier=0;tier<3;tier++){box(.18,11.9-tier*.22,.32,gilt,side*(4.20+tier*.19),6.65,-12.75-tier*.16);}
  cylinder(.23,.29,11.7,gold,side*4.96,6.47,-13.0);
  for(let j=0;j<28;j++){const ornament=mesh(new THREE.TorusGeometry(.17,.035,6,16),gilt,side*4.96,1+j*.40,-12.72);ornament.scale.x=.8;}
 }
 for(let tier=0;tier<3;tier++){box(10.7+tier*.48,.22,.90+tier*.32,gold,0,12.65+tier*.25,-13.1);box(10.8+tier*.48,.055,1.0+tier*.32,lacquer,0,12.79+tier*.25,-13.1);}
 for(let x=-5;x<=5;x+=.4){sphere(.07,.16,.07,gilt,x,12.31,-12.55);}
 box(10.4,.30,1.15,lacquer,0,.44,-11.7);box(10.7,.12,1.3,gold,0,.63,-11.7);
 for(let x=-4.8;x<=4.8;x+=.6){box(.42,.34,.07,gold,x,.35,-11.08);}
 for(const x of [-3.2,3.2]){cylinder(.24,.35,.7,gold,x,1.15,-11.8);for(let i=-1;i<=1;i++){const candle=box(.075,.45,.075,red,x+i*.15,1.65,-11.8);sphere(.04,.09,.04,material(0xffd37a,.3),x+i*.15,1.94,-11.8);}}
 const incense=cylinder(.5,.30,.32,gold,0,1.03,-11.5);for(const x of [-.14,0,.14])beam([x,1.12,-11.5],[x,1.95,-11.5],.012,wood);
 function lantern(x,y,z){const glow=material(0xe5bd76,.5);glow.emissive=new THREE.Color(0xe9ae50);glow.emissiveIntensity=.55;cylinder(.36,.36,.72,glow,x,y,z);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;beam([x+Math.sin(a)*.37,y-.4,z+Math.cos(a)*.37],[x+Math.sin(a)*.37,y+.4,z+Math.cos(a)*.37],.025,darkWood);}cylinder(.43,.43,.08,gold,x,y+.42,z);cylinder(.43,.43,.08,gold,x,y-.42,z);beam([x,y+.4,z],[x,y+1.4,z],.02,darkWood);const light=new THREE.PointLight(0xffc47d,100,18,2);light.position.set(x,y-.2,z);if(z===-8)group.add(light);}
 for(const x of [-8,8])for(const z of [-8,2,11])lantern(x,5.5,z);
 // Courtyard, wish tree, temple gate and mountain enclosure inhabit the same space.
 const foliageTexture=loadTextures?new THREE.TextureLoader().load(assetUrl('/assets/pine-canopy.png')):new THREE.Texture();foliageTexture.colorSpace=THREE.SRGBColorSpace;
 const foliageMaterial=new THREE.MeshStandardMaterial({map:foliageTexture,alphaTest:.42,side:THREE.DoubleSide,roughness:1,color:0xd5dda5});
 foliageMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>','diffuseColor.a *= smoothstep(1.8,4.6,length(vViewPosition));\n#include <alphatest_fragment>');};
 const grass=material(0x677649);grass.map=surface('stone');for(const x of [-24,24]){const lawn=mesh(new THREE.PlaneGeometry(22,46),grass,x,.026,24);lawn.rotation.x=-Math.PI/2;}
 function pine(x,z,height=6,wide=1){const tree=new THREE.Group();tree.position.set(x,0,z);group.add(tree);cylinder(.16,.32,height,darkWood,0,height/2,0,tree);
  for(let i=0;i<9;i++){const angle=i*2.4,reach=(1.4+(i%3)*.55)*wide,yy=height*.50+(i%4)*height*.11,xx=Math.sin(angle)*reach,zz=Math.cos(angle)*reach;beam([0,yy-.65,0],[xx,yy,zz],.07,darkWood,tree);for(let k=0;k<2;k++){const canopy=mesh(new THREE.PlaneGeometry(4.4*wide,3.1*wide),foliageMaterial,xx,yy+.65,zz,tree);canopy.rotation.y=angle+k*Math.PI/2;canopy.rotation.x=-.12+(i%3)*.12;}}
  return tree;}
 for(const x of [-16,16])for(const z of [19,29,39])pine(x,z,5.6+(z%3),.85);
 const treeX=15,treeZ=22;pine(treeX,treeZ,8,1.25);for(let i=0;i<14;i++){const angle=i*2.4,xx=treeX+Math.sin(angle)*2.6,zz=treeZ+Math.cos(angle)*2.6,yy=4.7+(i%4)*.5;const ribbon=box(.10,1.2+(i%3)*.14,.018,red,xx,yy-.4,zz);ribbon.rotation.z=Math.sin(i)*.16;}
 for(let i=0;i<18;i++){const side=i%2?1:-1;const rock=sphere(.45+(i%3)*.15,.3+(i%4)*.12,.58,stone,side*(12.8+(i%3)*.8),.18,17+i*1.4);rock.rotation.y=i;}
 for(const x of [-4,4]){cylinder(.3,.38,5.5,wood,x,2.75,36);box(1,.3,1,darkWood,x,5.5,36);}box(11,.5,2.5,darkWood,0,5.7,36);box(10,.25,3.2,roof,0,6.1,36);box(12,.25,3.7,roof,0,6.25,36);
 // Merge static architecture by material to keep the panoramic room affordable on mobile.
 group.updateMatrixWorld(true);const batches=new Map(),originals=[];group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o===floor)return;const key=o.material.uuid;let entry=batches.get(key);if(!entry){entry={material:o.material,geometries:[]};batches.set(key,entry);}entry.geometries.push(o.geometry.clone().applyMatrix4(o.matrixWorld));originals.push(o);});
 for(const entry of batches.values()){const geometry=mergeGeometries(entry.geometries,false);if(geometry){const combined=new THREE.Mesh(geometry,entry.material);combined.castShadow=true;combined.receiveShadow=true;group.add(combined);}for(const geometry of entry.geometries)geometry.dispose();}
 for(const object of originals){object.parent.remove(object);object.geometry.dispose();}
 return {group,floor,ready:Promise.all(statueLoads),anchors:{hall:new THREE.Vector3(0,0,7),court:new THREE.Vector3(0,0,22),gate:new THREE.Vector3(0,0,33),tree:new THREE.Vector3(13,0,22)}};
}
