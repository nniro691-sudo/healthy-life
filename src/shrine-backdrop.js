import * as THREE from 'three';

const standard=(color,metalness=0,roughness=.6)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
const SHARED={gilt:standard(0xb9924e,.53,.43),edge:standard(0xe0bb73,.48,.45),wood:standard(0x35201b),ink:standard(0x151714)};
const THEMES={
 guanyin:{color:0x193f37,motif:'lotus'},
 wenchang:{color:0x192f45,motif:'scroll'},
 wenshu:{color:0x49381d,motif:'lotus'},
 dizang:{color:0x39252e,motif:'lotus'},
 caishen:{color:0x53251a,motif:'coin'}
};
// A deep architectural niche, with its crown above the sculpture's full silhouette.
// Ornament is geometry, so it retains perspective when the visitor turns.
export function createShrineBackdrop(id,{textures=true}={}){
 const root=new THREE.Group();root.name=id+'-arched-shrine';const theme=THEMES[id];
 const {gilt,edge,wood,ink}=SHARED,lacquer=standard(theme.color,.1,.72);
 function add(geometry,material,x,y,z){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);root.add(m);return m;}
 function box(w,h,d,material,x,y,z){return add(new THREE.BoxGeometry(w,h,d),material,x,y,z);}
 function rod(a,b,r,material){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),mid=new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5),o=add(new THREE.CylinderGeometry(r,r,v.length(),12),material,...mid.toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 function arch(width,bottom,spring){const r=width/2,s=new THREE.Shape();s.moveTo(-r,bottom);s.lineTo(r,bottom);s.lineTo(r,spring);s.absarc(0,spring,r,0,Math.PI,false);s.lineTo(-r,bottom);return s;}
 function panel(width,bottom,spring,depth,material,z){return add(new THREE.ExtrudeGeometry(arch(width,bottom,spring),{depth,bevelEnabled:true,bevelSize:.04,bevelThickness:.035,bevelSegments:2,curveSegments:48}),material,0,0,z);}
 panel(8.0,.36,4.75,.38,wood,-8.15);
 panel(7.66,.48,4.75,.14,gilt,-7.72);
 panel(7.38,.60,4.75,.12,ink,-7.53);
 panel(7.20,.68,4.75,.10,edge,-7.37);
 panel(7.04,.74,4.75,.10,lacquer,-7.22);
 // Repeated arch mouldings follow the silhouette, instead of crossing the crown.
 const border=[];border.push(new THREE.Vector3(-3.42,.83,-7.06),new THREE.Vector3(-3.42,4.75,-7.06));for(let i=0;i<=72;i++){const a=Math.PI-i*Math.PI/72;border.push(new THREE.Vector3(Math.cos(a)*3.42,4.75+Math.sin(a)*3.42,-7.06));}border.push(new THREE.Vector3(3.42,.83,-7.06));
 add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(border),150,.025,6,false),edge,0,0,0);
 // The halo sits behind the head, clear of the upper arch and canopy.
 for(const [r,t,z]of [[1.27,.033,-6.42],[1.36,.018,-6.48]])add(new THREE.TorusGeometry(r,t,8,100),gilt,0,5.66,z);
 for(let i=0;i<40;i++){const a=i*Math.PI/20;rod([Math.cos(a)*1.43,5.66+Math.sin(a)*1.43,-6.49],[Math.cos(a)*1.52,5.66+Math.sin(a)*1.52,-6.49],.012,gilt);}
 if(textures&&typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),gradient=ctx.createRadialGradient(128,128,5,128,128,128);gradient.addColorStop(0,'rgba(238,186,91,0.26)');gradient.addColorStop(.55,'rgba(218,160,65,0.13)');gradient.addColorStop(1,'rgba(218,160,65,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const glow=add(new THREE.PlaneGeometry(4.6,4.6),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}),0,5.66,-6.58);glow.userData.keepSeparate=true;
 }
 // Open cloud scrolls flank the shoulders without sitting on the head.
 for(const side of [-1,1])for(let tier=0;tier<3;tier++){
  const points=[];for(let i=0;i<=32;i++){const a=i/32*Math.PI*2.8,r=.05+i/32*.32;points.push(new THREE.Vector3(side*(2.36+Math.cos(a)*r),3.10+tier*1.20+Math.sin(a)*r,-6.98));}add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),60,.016,6,false),gilt,0,0,0);
 }
 // Carved outer columns, capitals and a stepped lintel give the shrine depth.
 for(const side of [-1,1]){
  add(new THREE.CylinderGeometry(.21,.27,6.25,24),wood,side*4.15,3.63,-7.7);
  for(const y of [.57,.82,6.5,6.7])add(new THREE.CylinderGeometry(.31,.34,.11,24),gilt,side*4.15,y,-7.7);
  for(let j=0;j<8;j++){const a=j*Math.PI/4;rod([side*4.15+Math.cos(a)*.215,1.0,-7.7+Math.sin(a)*.215],[side*4.15+Math.cos(a)*.215,6.3,-7.7+Math.sin(a)*.215],.013,gilt);}
  for(let level=0;level<3;level++){box(.75+level*.22,.15,.56+level*.2,gilt,side*4.15,6.85+level*.18,-7.7);}
 }
 for(let level=0;level<3;level++){box(8.5+level*.24,.16,.70+level*.18,wood,0,8.62+level*.14,-7.66);box(8.55+level*.24,.035,.75+level*.18,gilt,0,8.72+level*.14,-7.66);}
 // Low relief ornament stays at the plinth, distinct from facial details.
 for(let i=-3;i<=3;i++){
  if(theme.motif==='coin'){const coin=add(new THREE.TorusGeometry(.16,.025,8,32),gilt,i*.72,1.04,-7.02);box(.105,.105,.016,lacquer,i*.72,1.04,-6.99);}
  else if(theme.motif==='scroll'){box(.42,.24,.03,gilt,i*.72,1.04,-7.02);box(.34,.18,.035,wood,i*.72,1.04,-6.99);}
  else{for(let petal=-1;petal<=1;petal++){const o=add(new THREE.SphereGeometry(1,12,8),gilt,i*.72+petal*.09,1.04,-7.02);o.scale.set(.065,.16,.025);o.rotation.z=petal*-.45;}}
 }
 return root;
}
