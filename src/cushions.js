import * as THREE from 'three';
import {MATS,MAT_HEIGHT,MAT_SCALE} from './mats.js';
function rounded(width,depth,radius){const s=new THREE.Shape(),x=-width/2,y=-depth/2;s.moveTo(x+radius,y);s.lineTo(x+width-radius,y);s.quadraticCurveTo(x+width,y,x+width,y+radius);s.lineTo(x+width,y+depth-radius);s.quadraticCurveTo(x+width,y+depth,x+width-radius,y+depth);s.lineTo(x+radius,y+depth);s.quadraticCurveTo(x,y+depth,x,y+depth-radius);s.lineTo(x,y+radius);s.quadraticCurveTo(x,y,x+radius,y);return s;}
export function createCushions(){
 const group=new THREE.Group(),targets=[],items=new Map();
 const geometry=new THREE.ExtrudeGeometry(rounded(.84,1.55,.13),{depth:.035,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.015,bevelThickness:.015,curveSegments:12});geometry.rotateX(-Math.PI/2);
 const base=new THREE.MeshStandardMaterial({color:0x342c25,roughness:1});
 const lineGeometry=new THREE.BufferGeometry().setFromPoints(rounded(.76,1.46,.11).getPoints(60).map(p=>new THREE.Vector3(p.x,.077,-p.y)));
 for(const mat of MATS){const cushion=new THREE.Group();cushion.position.set(mat.x,0,mat.z);cushion.scale.setScalar(MAT_SCALE);const body=new THREE.Mesh(geometry,base);body.position.y=.025;body.castShadow=true;body.receiveShadow=true;body.userData.matId=mat.id;cushion.add(body);targets.push(body);
 const piping=new THREE.LineLoop(lineGeometry,new THREE.LineBasicMaterial({color:0xa68d62,transparent:true,opacity:.65}));cushion.add(piping);
 // A small woven central motif stays flush with the cushion, never part of the UI.
 const motif=new THREE.Mesh(new THREE.RingGeometry(.075,.079,40),new THREE.MeshBasicMaterial({color:0xab966d,transparent:true,opacity:.45,side:THREE.DoubleSide}));motif.rotation.x=-Math.PI/2;motif.position.y=.078;cushion.add(motif);
 group.add(cushion);items.set(mat.id,{piping,body});}
 return {group,targets,highlight(selected,occupied){for(const [id,item] of items){item.piping.material.color.setHex(id===selected?0xf1d08e:occupied.has(id)?0x767e70:0xa68d62);item.piping.material.opacity=id===selected?1:.60;}}};
}
