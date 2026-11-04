import * as THREE from 'three';

export const EYE_HEIGHT=1.65;
export function lookHeight(position){
 // A person naturally looks upward on approaching the tall sanctuary.
 const hallGaze=THREE.MathUtils.lerp(1.85,1.40,THREE.MathUtils.smoothstep(position.z,12,18));
 return THREE.MathUtils.lerp(4.2,hallGaze,THREE.MathUtils.smoothstep(position.z,-9.5,5));
}
export function resetEyeView(camera,controls,position,mobile=false){
 controls.target.copy(position).add(new THREE.Vector3(0,lookHeight(position),0));
 camera.position.copy(position).add(new THREE.Vector3(0,EYE_HEIGHT,mobile?6.4:5.6));
 controls.update();
}
export function keepEyeHeight(camera){camera.position.y=THREE.MathUtils.clamp(camera.position.y,1.50,1.85);}

// Reserve the actual HUD area on narrow screens. Shift the projection rather
// than raising the visitor's eye level or changing their orbit direction.
export function frameMobileVisitor(camera,position,{width,height,top=90,bottom=height-160,left=16,right=width-16,landmark=null}){
 camera.clearViewOffset();camera.zoom=1;camera.updateProjectionMatrix();
 if(width>=600)return;
 camera.updateMatrixWorld(true);
 // A stable envelope includes standing, hands, incense and the forward reach
 // of a full prostration, so the framing does not pulse with the animation.
 const points=[];
 for(const x of [-.70,.70])for(const z of [-.70,.70])for(const y of [-.02,1.45])points.push(position.clone().add(new THREE.Vector3(x,y,z)));
 // Extreme zoom plus a wall constraint can put the visitor behind an upward
 // gaze. Keep the orbit's azimuth and eye height, but lower that unsafe gaze.
 if(points.some(p=>p.clone().applyMatrix4(camera.matrixWorldInverse).z>=-.2)){
  camera.lookAt(position.clone().add(new THREE.Vector3(0,.65,0)));camera.updateMatrixWorld(true);
 }
 const pixels=point=>{const p=point.clone().project(camera);return {x:(1+p.x)*width/2,y:(1-p.y)*height/2};};
 const yPoints=[...points];
 if(landmark){const p=landmark.clone().project(camera);if(p.z<1&&Math.abs(p.x)<1.5)yPoints.push(landmark);}
 const extent=()=>{const xs=points.map(p=>pixels(p).x),ys=yPoints.map(p=>pixels(p).y);return {minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)};};
 let box=extent();if(!Object.values(box).every(Number.isFinite))return;
 const scale=Math.min(1,Math.max(80,right-left)/(box.maxX-box.minX),Math.max(120,bottom-top)/(box.maxY-box.minY));
 if(scale<1){camera.zoom=Math.max(.01,scale);camera.updateProjectionMatrix();box=extent();}
 const shiftX=THREE.MathUtils.clamp(0,left-box.minX,right-box.maxX),shiftY=THREE.MathUtils.clamp(0,top-box.minY,bottom-box.maxY);
 if(Math.abs(shiftX)>.25||Math.abs(shiftY)>.25)camera.setViewOffset(width,height,-shiftX,-shiftY,width,height);
}
