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
export function frameMobileVisitor(camera,position,{width,height,top=90,bottom=height-160,landmark=null}){
 camera.clearViewOffset();camera.zoom=1;camera.updateProjectionMatrix();
 if(width>=600)return;
 camera.updateMatrixWorld(true);
 const foot=position.clone().add(new THREE.Vector3(0,.01,0));
 const tip=position.clone().add(new THREE.Vector3(0,1.45,0));
 const pixels=point=>{const p=point.clone().project(camera);return (1-p.y)*height/2;};
 const points=[tip,foot];
 if(landmark){const p=landmark.clone().project(camera);if(p.z<1&&Math.abs(p.x)<1.5)points.push(landmark);}
 const extent=()=>{const ys=points.map(pixels);return [Math.min(...ys),Math.max(...ys)];};
 let [a,b]=extent();if(!Number.isFinite(a+b))return;
 const available=Math.max(120,bottom-top),span=Math.abs(b-a);
 if(span>available){camera.zoom=Math.max(.12,available/span);camera.updateProjectionMatrix();[a,b]=extent();}
 const low=top-Math.min(a,b),high=bottom-Math.max(a,b);
 const shift=THREE.MathUtils.clamp(0,Math.min(low,high),Math.max(low,high));
 if(Math.abs(shift)>.5)camera.setViewOffset(width,height,0,-shift,width,height);
}
