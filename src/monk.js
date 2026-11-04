import * as THREE from 'three';
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const smooth=t=>t*t*(3-2*t);
const mix=(a,b,t)=>a.clone().lerp(b,t);
const UP=V(0,1,0);
export const BOW_DURATION=6.4;
export const INCENSE_DURATION=7.2;

// All poses share a ground-space skeleton. The root never drops below the floor.
export function createMonk({detail='high'}={}){
  const segments=detail==='low'?16:36;
  const root=new THREE.Group();root.name='monk';
  const body=new THREE.Group();body.name='compact-body';body.scale.y=.78;root.add(body);
  const skin=new THREE.MeshStandardMaterial({color:0xe0ae86,roughness:.88});
  const innerSkin=new THREE.MeshStandardMaterial({color:0xc58c72,roughness:.9});
  const cloth=new THREE.MeshStandardMaterial({color:0x777e7a,roughness:1,side:THREE.DoubleSide});
  const trim=new THREE.MeshStandardMaterial({color:0x626a67,roughness:1});
  const sole=new THREE.MeshStandardMaterial({color:0x3b423c,roughness:1});
  const linen=new THREE.MeshStandardMaterial({color:0x9b9989,roughness:1});
  const dark=new THREE.MeshStandardMaterial({color:0x362a24,roughness:1});
  function mesh(geometry,material,parent=body){const m=new THREE.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function ellipsoid(material,scale,parent=body){const m=mesh(new THREE.SphereGeometry(1,segments,Math.round(segments*.7)),material,parent);m.scale.copy(scale);return m;}
  function segment(material,r1,r2){return mesh(new THREE.CylinderGeometry(r1,r2,1,24,3),material);}
  function placeSegment(m,a,b){m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(UP,b.clone().sub(a).normalize());m.scale.y=a.distanceTo(b);}
  const torso=mesh(new THREE.LatheGeometry([[0,0],[.215,0],[.23,.12],[.25,.32],[.265,.40],[.25,.46],[.20,.50],[.135,.545],[.095,.57],[0,.57]].map(([x,y])=>new THREE.Vector2(x,y)),64),cloth);
  torso.scale.z=.76;
  const neck=segment(skin,.082,.09);
  const headPivot=new THREE.Group();root.add(headPivot);headPivot.name='chibi-head';headPivot.scale.setScalar(1.0);
  // A single rounded face avoids overlapping jaw/cheek shapes during movement.
  const head=ellipsoid(skin,V(.290,.280,.250),headPivot);head.position.y=.015;head.name='round-chibi-head';
  const faceZ=(x,y,offset=.006)=>-.250*Math.sqrt(Math.max(.01,1-(x/.290)**2-((y-.015)/.280)**2))-offset;
  const eyeMaterial=new THREE.MeshStandardMaterial({color:0x30251f,roughness:.58});
  const sparkle=new THREE.MeshBasicMaterial({color:0xfff8e9});
  const blushMaterial=new THREE.MeshStandardMaterial({color:0xda8f77,roughness:1,transparent:true,opacity:.43,depthWrite:false});
  function faceLine(points,r,material=dark){const curve=new THREE.CatmullRomCurve3(points.map(([x,y])=>V(x,y,faceZ(x,y,.009))));for(const point of [curve.getPoint(0),curve.getPoint(1)]){const cap=ellipsoid(material,V(r,r,r),headPivot);cap.position.copy(point);}return mesh(new THREE.TubeGeometry(curve,20,r,8,false),material,headPivot);}
  for(const side of [-1,1]){
    const ear=ellipsoid(skin,V(.043,.064,.036),headPivot);ear.position.set(side*.282,-.029,0);
    const inner=ellipsoid(innerSkin,V(.020,.034,.009),headPivot);inner.position.set(side*.294,-.030,-.030);
    const x=side*.098,y=-.020;
    const eye=ellipsoid(eyeMaterial,V(.027,.039,.014),headPivot);eye.position.set(x,y,faceZ(x,y));eye.name=side<0?'left-chibi-eye':'right-chibi-eye';
    const glint=ellipsoid(sparkle,V(.008,.010,.004),headPivot);glint.position.set(x-.007,y+.014,faceZ(x,y)-.014);
    faceLine([[side*.069,.058],[side*.100,.069],[side*.128,.059]],.007);
    const cheekX=side*.176,cheekY=-.087,cheekZ=faceZ(cheekX,cheekY,.003);
    const blush=ellipsoid(blushMaterial,V(.046,.023,.004),headPivot);blush.position.set(cheekX,cheekY,cheekZ);
    blush.quaternion.setFromUnitVectors(V(0,0,-1),V(cheekX/(.290**2),(cheekY-.015)/(.280**2),cheekZ/(.250**2)).normalize());
  }
  const nose=ellipsoid(skin,V(.023,.022,.022),headPivot);nose.position.set(0,-.073,faceZ(0,-.073,.008));
  faceLine([[-.039,-.116],[-.020,-.127],[0,-.131],[.020,-.127],[.039,-.116]],.006,innerSkin);
  const collar=mesh(new THREE.TorusGeometry(.102,.022,10,48),trim);collar.rotation.x=Math.PI/2;
  // Deformable cloth: closed rings keep the skirt grounded during kneeling.
  const ringCount=14,sides=72,positions=new Float32Array((ringCount+1)*(sides+1)*3),indices=[];
  for(let r=0;r<ringCount;r++)for(let s=0;s<sides;s++){const a=r*(sides+1)+s,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const skirtGeometry=new THREE.BufferGeometry();skirtGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));skirtGeometry.setIndex(indices);
  const skirt=mesh(skirtGeometry,cloth);
  function sleeve(){const count=16,sides=24,vertices=new Float32Array((count+1)*(sides+1)*3),index=[];for(let r=0;r<count;r++)for(let i=0;i<sides;i++){const a=r*(sides+1)+i,b=a+sides+1;index.push(a,b,a+1,b,b+1,a+1);}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(vertices,3));geometry.setIndex(index);return mesh(geometry,cloth);}
  function updateSleeve(m,a,b,c){const curve=new THREE.CatmullRomCurve3([a,b,c]),vertices=m.geometry.attributes.position;for(let r=0;r<=16;r++){const u=r/16,center=curve.getPoint(u),tangent=curve.getTangent(u).normalize(),normal=V(0,0,1).cross(tangent).normalize(),binormal=tangent.clone().cross(normal).normalize(),radius=(.114-.040*u)*Math.min(1,Math.sin(Math.min(1,u/.20)*Math.PI/2));for(let i=0;i<=24;i++){const angle=i/24*Math.PI*2,point=center.clone().addScaledVector(normal,Math.cos(angle)*radius).addScaledVector(binormal,Math.sin(angle)*radius);vertices.setXYZ(r*25+i,point.x,point.y,point.z);}}vertices.needsUpdate=true;m.geometry.computeVertexNormals();}
  function hand(){const hand=new THREE.Group();body.add(hand);ellipsoid(skin,V(.040,.054,.026),hand);if(detail==='high')for(let i=0;i<4;i++){const finger=ellipsoid(skin,V(.008,.028+(i===1?.005:0),.009),hand);finger.position.set((i-1.5)*.017,-.058,-.002);finger.rotation.z=(i-1.5)*.045;}return hand;}
  const arms=[-1,1].map(side=>({side,sleeve:sleeve(),hand:hand(),thumb:ellipsoid(skin,V(.023,.04,.023)),cuff:segment(trim,.081,.081)}));
  const legs=[-1,1].map(side=>({side,thigh:segment(trim,.085,.103),shin:segment(cloth,.075,.088),shoe:ellipsoid(sole,V(.097,.058,.15)),top:ellipsoid(linen,V(.087,.037,.123))}));
  arms.forEach((arm,i)=>{arm.hand.name=i===0?'left-hand':'right-hand';});
  legs.forEach((leg,i)=>{leg.shoe.name=i===0?'left-foot':'right-foot';});
  const incense=new THREE.Group();body.add(incense);incense.position.set(0,1.1,-.3);const incenseWood=new THREE.MeshStandardMaterial({color:0x6b4024,roughness:1}),ember=new THREE.MeshBasicMaterial({color:0xff8c47});
  for(const x of [-.023,0,.023]){const rod=mesh(new THREE.CylinderGeometry(.009,.009,.42,10),incenseWood,incense);rod.position.set(x,.18,0);const tip=mesh(new THREE.SphereGeometry(.009,10,8),ember,incense);tip.position.set(x,.397,0);}
  const smokePixels=new Uint8Array(32*32*4);for(let y=0;y<32;y++)for(let x=0;x<32;x++){const index=(y*32+x)*4,d=Math.hypot((x-15.5)/16,(y-15.5)/16);smokePixels[index]=smokePixels[index+1]=smokePixels[index+2]=255;smokePixels[index+3]=Math.max(0,1-d)**2*200;}const smokeTexture=new THREE.DataTexture(smokePixels,32,32);smokeTexture.needsUpdate=true;
  const smoke=Array.from({length:10},()=>{const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTexture,color:0xe0dfcc,transparent:true,depthWrite:false,opacity:.35}));incense.add(sprite);return sprite;});
  const headAnchor=V();let previousMode='idle',blendTime=1,lastPose=null,transitionFrom=null;
  function basePose(t,walking){const stride=walking?Math.sin(t*7.2):0,lift=walking?Math.cos(t*7.2):0;return {hip:V(0,.81,0),neck:V(0,1.37,0),head:V(0,1.64,0),kneel:0,tilt:0,shoulders:[V(-.145,1.29,0),V(.145,1.29,0)],elbows:[V(-.29,.98,-stride*.07),V(.29,.98,stride*.07)],wrists:[V(-.285,.77,-stride*.12),V(.285,.77,stride*.12)],knees:[V(-.125,.43+Math.max(0,-lift)*.02,stride*.075-.025),V(.125,.43+Math.max(0,lift)*.02,-stride*.075-.025)],ankles:[V(-.125,.095+Math.max(0,-lift)*.065,stride*.15),V(.125,.095+Math.max(0,lift)*.065,-stride*.15)]};}
  function prayer(p){p.elbows=[V(-.30,1.03,-.15),V(.30,1.03,-.15)];p.wrists=[V(-.029,1.20,-.30),V(.029,1.20,-.30)];}
  function bowPose(time){const phase=(time%BOW_DURATION)/BOW_DURATION;
    // Rise and fall have separate phases: kneel, bow, remain grounded, rise.
    const kneel=phase<.20?smooth(phase/.20):phase<.80?1:1-smooth((phase-.80)/.20);
    const bow=phase<.26?0:phase<.45?smooth((phase-.26)/.19):phase<.59?1:phase<.78?1-smooth((phase-.59)/.19):0;
    const p=basePose(0,false);prayer(p);p.kneel=kneel;
    p.hip=V(0,THREE.MathUtils.lerp(.81,.43,kneel),-.10*kneel);
    p.neck=p.hip.clone().add(V(0,.56*Math.cos(bow*1.72),-.56*Math.sin(bow*1.72)));
    p.head=p.neck.clone().add(V(0,.27*Math.cos(bow*1.72),-.27*Math.sin(bow*1.72)));p.tilt=-bow*1.72;
    p.knees=[V(-.135,THREE.MathUtils.lerp(.43,.105,kneel),-.38*kneel),V(.135,THREE.MathUtils.lerp(.43,.105,kneel),-.38*kneel)];
    p.ankles=[V(-.135,.085,0),V(.135,.085,0)];
    p.shoulders=[V(-.145,p.neck.y-.08*Math.cos(bow*1.72),p.neck.z+.115*Math.sin(bow*1.72)),V(.145,p.neck.y-.08*Math.cos(bow*1.72),p.neck.z+.115*Math.sin(bow*1.72))];
    for(let i=0;i<2;i++){const side=i?1:-1;
      p.elbows[i]=mix(V(side*.30,p.hip.y+.22,-.15),V(side*.34,.24,-.53),bow);
      p.wrists[i]=mix(V(side*.029,p.hip.y+.39,-.30),V(side*.265,.075,-.93),bow);
    }return p;
  }
  function blendPose(a,b,t){const out={};for(const k of Object.keys(b)){out[k]=b[k] instanceof THREE.Vector3?mix(a[k],b[k],t):Array.isArray(b[k])?b[k].map((v,i)=>mix(a[k][i],v,t)):THREE.MathUtils.lerp(a[k],b[k],t);}return out;}
  function update(t,dt,mode,ritualTime,walking,reduce=false){
    let p=mode==='bow'?bowPose(ritualTime):basePose(t,walking);
    if(mode==='palms')prayer(p);if(mode==='incense'){prayer(p);const phase=Math.min(1,ritualTime/INCENSE_DURATION),raise=Math.sin(Math.min(1,phase/.25)*Math.PI/2),bow=Math.sin(Math.max(0,Math.min(1,(phase-.32)/.48))*Math.PI)*.20;p.tilt=-bow;p.neck.z-=bow*.4;p.head.z-=bow*.55;p.wrists=[V(-.025,1.10+raise*.27-bow*.25,-.33),V(.025,1.10+raise*.27-bow*.25,-.33)];p.elbows=[V(-.26,1.02+raise*.16,-.14),V(.26,1.02+raise*.16,-.14)];}
    if(mode!==previousMode){transitionFrom=lastPose;blendTime=0;previousMode=mode;}
    blendTime=Math.min(1,blendTime+dt/.35);if(transitionFrom&&blendTime<1)p=blendPose(transitionFrom,p,smooth(blendTime));lastPose=p;
    const axis=p.neck.clone().sub(p.hip).normalize();torso.position.copy(p.hip);torso.quaternion.setFromUnitVectors(UP,axis);
    placeSegment(neck,p.neck.clone().add(V(0,-.04,0)),p.head.clone().add(V(0,-.14,0)));
    collar.position.copy(p.neck).addScaledVector(axis,-.015);collar.quaternion.copy(torso.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(V(1,0,0),Math.PI/2));
    headPivot.position.copy(p.head);headPivot.position.y=p.head.y*.78+.060+.075*p.kneel*Math.sin(Math.abs(p.tilt));
    headPivot.rotation.x=p.tilt;headAnchor.copy(headPivot.position).add(V(0,.39,0));
    // Rings fold down toward knees rather than rotating through the ground.
    for(let r=0;r<=ringCount;r++){const u=r/ringCount,hem=V(0,THREE.MathUtils.lerp(.24,.085,p.kneel),-.035-.07*p.kneel),center=mix(p.hip,hem,u),rx=THREE.MathUtils.lerp(.218,.312,u),rz=THREE.MathUtils.lerp(.17,.255+.13*p.kneel,u);
      const drapeRotation=new THREE.Quaternion().slerpQuaternions(torso.quaternion,new THREE.Quaternion(),smooth(u));
      for(let s=0;s<=sides;s++){const a=s/sides*Math.PI*2,fold=Math.sin(a*12+u*.28)*(.004+u*.014),index=(r*(sides+1)+s)*3;const offset=V(Math.cos(a)*(rx+fold),Math.sin(a*12)*.004*u,Math.sin(a)*(rz+fold)).applyQuaternion(drapeRotation);positions[index]=center.x+offset.x;positions[index+1]=Math.max(.035,center.y+offset.y);positions[index+2]=center.z+offset.z;}}
    skirtGeometry.attributes.position.needsUpdate=true;skirtGeometry.computeVertexNormals();
    arms.forEach((arm,i)=>{updateSleeve(arm.sleeve,p.shoulders[i],p.elbows[i],p.wrists[i].clone().lerp(p.elbows[i],.10));const wrist=p.wrists[i];arm.hand.position.copy(wrist);arm.hand.rotation.set(p.tilt*.6,0,mode==='palms'||mode==='bow'&&p.tilt>-.3?-arm.side*.10:arm.side*.12);if(mode==='palms'||mode==='incense'||mode==='bow'&&p.tilt>-.3)arm.hand.rotation.z=arm.side*Math.PI;if(mode==='bow'&&p.tilt<-.3){arm.hand.rotation.x=-Math.PI/2;arm.hand.position.y=.055+(wrist.y-.075);}const dir=p.elbows[i].clone().sub(wrist).normalize();placeSegment(arm.cuff,wrist.clone().addScaledVector(dir,.07),wrist.clone().addScaledVector(dir,.095));arm.thumb.position.copy(wrist).add(V(-arm.side*.035,-.01,-.012));});
    incense.visible=mode==='incense'&&ritualTime<6.8;if(incense.visible){incense.position.copy(p.wrists[0]).add(p.wrists[1]).multiplyScalar(.5).add(V(0,.07,-.025));for(let i=0;i<smoke.length;i++){const age=(t*.25+i/smoke.length)%1;smoke[i].position.set(Math.sin(age*7+i)*age*.075,.42+age*.65,Math.cos(age*6+i)*age*.06);smoke[i].scale.setScalar(.08+age*.24);smoke[i].material.opacity=(1-age)*.55;}}
    legs.forEach((leg,i)=>{const hip=p.hip.clone().add(V(leg.side*.125,0,0));placeSegment(leg.thigh,hip,p.knees[i]);placeSegment(leg.shin,p.knees[i],p.ankles[i]);leg.shoe.position.copy(p.ankles[i]).add(V(0,-.027,-.035));leg.shoe.rotation.x=p.kneel*.45;leg.shoe.position.y=Math.hypot(.058*Math.cos(leg.shoe.rotation.x),.15*Math.sin(leg.shoe.rotation.x))+.006+Math.max(0,p.ankles[i].y-.095);leg.top.position.copy(leg.shoe.position).add(V(0,.026,-.012));leg.top.rotation.copy(leg.shoe.rotation);});
  }
  update(0,1,'idle',0,false);
  return {root,update,headAnchor};
}
