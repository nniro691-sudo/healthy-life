import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
function grain(){const size=128,bytes=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const n=Math.sin(x*12.8+y*63.7)*43758.54;const value=.72+.10*Math.sin(x*.95+Math.sin(y*.045)*2)+.08*(n-Math.floor(n));const i=(y*size+x)*4;bytes[i]=Math.min(255,value*255);bytes[i+1]=bytes[i];bytes[i+2]=bytes[i];bytes[i+3]=255;}const texture=new THREE.DataTexture(bytes,size,size);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;return texture;}
export function createRitualModel(mode){
 const root=new THREE.Group(),texture=grain(),wood=new THREE.MeshPhysicalMaterial({color:0xb98448,map:texture,bumpMap:texture,bumpScale:.018,roughness:.43,clearcoat:.18,clearcoatRoughness:.4});
 const dark=new THREE.MeshStandardMaterial({color:0x29170e,roughness:.9}),stringMaterial=new THREE.MeshStandardMaterial({color:0x856738,roughness:1});
 function mesh(g,m,parent=root){const object=new THREE.Mesh(g,m);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;}
 const beadPath=new THREE.EllipseCurve(0,0,.68,1.15,0,Math.PI*2,false,0);
 const beads=[],body=new THREE.Group(),mallet=new THREE.Group();let travel=0,target=0,hitAge=10;
 if(mode==='wood'){
 root.add(body);const top=mesh(new THREE.SphereGeometry(1,64,36,0,Math.PI*2,0,Math.PI*.51),wood,body);top.scale.set(1.04,.70,.81);
 const bottom=mesh(new THREE.SphereGeometry(1,64,36,0,Math.PI*2,Math.PI*.545,Math.PI*.455),wood,body);bottom.scale.set(1.04,.70,.81);
 const opening=mesh(new THREE.SphereGeometry(1,48,16),dark,body);opening.scale.set(.98,.064,.77);opening.position.y=-.048;
 const handle=mesh(new THREE.TorusGeometry(.31,.093,20,64),wood,body);handle.position.set(.68,.45,-.02);handle.rotation.y=.12;
 for(const side of [-1,1]){const eye=mesh(new THREE.SphereGeometry(.045,20,16),dark,body);eye.position.set(side*.48,.19,.66);}
 for(let i=0;i<5;i++){const arc=new THREE.EllipseCurve(0,0,.61+i*.045,.42+i*.035,.05,Math.PI-.05,false,0);const points=arc.getPoints(50).map(p=>new THREE.Vector3(p.x,.39+i*.018,p.y-.15));mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),48,.007,6,false),stringMaterial,body);}
 root.add(mallet);mallet.position.set(1.08,.06,.45);mallet.rotation.z=-.5;
 const stick=mesh(new THREE.CylinderGeometry(.045,.045,1.006,24),wood,mallet);stick.position.set(.32,.25,0);stick.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(.76,-.66,0).normalize());
 const tip=mesh(new THREE.SphereGeometry(.16,32,24),wood,mallet);tip.position.set(-.06,.58,0);
 }else{
 const beadGeometry=new THREE.SphereGeometry(.075,32,24);for(let i=0;i<36;i++){const material=wood.clone();material.color.setHSL(.095+(i%4)*.004,.48,.48+(i%5)*.018);const bead=mesh(beadGeometry,material);beads.push(bead);}
 const curve=new THREE.EllipseCurve(0,0,.68,1.15,0,Math.PI*2,false,0);mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curve.getPoints(120).map(p=>new THREE.Vector3(p.x,p.y,0)),true),120,.012,8,true),stringMaterial);
 const guru=mesh(new THREE.SphereGeometry(.125,32,24),wood);guru.position.set(0,-1.29,0);
 for(let i=0;i<12;i++){const points=[new THREE.Vector3(0,-1.35,0),new THREE.Vector3((i-5.5)*.012,-1.50,.015),new THREE.Vector3((i-5.5)*.017,-1.78,.02)];mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),16,.005,5,false),stringMaterial);}
 }
 function update(t,dt){hitAge+=dt;if(mode==='wood'){const bump=hitAge<.35?Math.sin(hitAge/.35*Math.PI)*Math.exp(-hitAge*6):0;body.scale.setScalar(1-bump*.045);mallet.rotation.z=-.5-bump*.65;root.rotation.y=.13+Math.sin(t*.2)*.08;}else{travel=THREE.MathUtils.damp(travel,target,9,dt);const flow=t*.12;beads.forEach((bead,i)=>{const a=i/36*Math.PI*2+travel+flow;const point=beadPath.getPointAt(THREE.MathUtils.euclideanModulo(a/(Math.PI*2),1));bead.position.set(point.x,point.y,Math.sin(a*2)*.025);bead.rotation.set(a*.3,a,0);});root.rotation.y=Math.sin(t*.35)*.22;root.rotation.z=.06;}}
 update(0,1);return {root,beads,update,strike(){hitAge=0;},advance(){target+=Math.PI*2/36;}};
}
export function createRitualViewer(canvas,mode,onTap){
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
 const scene=new THREE.Scene(),model=createRitualModel(mode);scene.add(model.root);scene.add(new THREE.HemisphereLight(0xffe8bf,0x5f4631,3));const key=new THREE.DirectionalLight(0xffe2b5,4);key.position.set(-3,5,4);scene.add(key);const rim=new THREE.DirectionalLight(0xffffff,2);rim.position.set(3,2,-3);scene.add(rim);
 const camera=new THREE.PerspectiveCamera(40,1,.1,30);camera.position.set(mode==='wood'?2.1:0,mode==='wood'?1.5:0,mode==='wood'?3.4:4.6);camera.lookAt(0,mode==='wood'?0:-.18,0);
 const controls=mode==='wood'?new OrbitControls(camera,canvas):null;if(controls){controls.enableZoom=false;controls.enablePan=false;controls.enableDamping=true;controls.minPolarAngle=.35;controls.maxPolarAngle=1.7;}
 let alive=true,frame,down=null,dragged=false;const clock=new THREE.Clock();
 canvas.onpointerdown=e=>{down={x:e.clientX,y:e.clientY,last:e.clientY};dragged=false;canvas.setPointerCapture(e.pointerId);};
 canvas.onpointermove=e=>{if(!down)return;if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>8)dragged=true;if(mode==='beads'&&e.clientY-down.last>23){onTap();down.last=e.clientY;}};
 canvas.onpointerup=()=>{if(down&&!dragged)onTap();down=null;};canvas.onpointercancel=()=>{down=null;};canvas.onkeydown=e=>{if(e.key==='Enter'||e.code==='Space'){e.preventDefault();e.stopPropagation();onTap();}};
 function resize(){const width=canvas.clientWidth,height=canvas.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}resize();const observer=new ResizeObserver(resize);observer.observe(canvas);
 function animate(){if(!alive)return;frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.06);model.update(clock.elapsedTime,dt);controls?.update();renderer.render(scene,camera);}animate();
 return {strike:model.strike,advance:model.advance,dispose(){alive=false;cancelAnimationFrame(frame);observer.disconnect();controls?.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}});renderer.dispose();}};
}
