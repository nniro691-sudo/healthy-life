import * as THREE from 'three';

// Loop subdivision keeps the full scan's anatomy and rounds coarse scan facets.
// UV seams share geometric adjacency while retaining their own texture coordinates.
export function subdivideScan(geometry,iterations=2){
 for(let iteration=0;iteration<iterations;iteration++){
  const p=geometry.attributes.position,uv=geometry.attributes.uv,idx=geometry.index.array;
  const keys=new Map(),geo=[],ids=[],neighbors=[],edges=new Map();
  for(let i=0;i<p.count;i++){
   const v=new THREE.Vector3().fromBufferAttribute(p,i),key=v.toArray().map(n=>Math.round(n*1e5)).join(',');
   if(!keys.has(key)){keys.set(key,geo.length);geo.push(v);neighbors.push(new Set());}
   ids.push(keys.get(key));
  }
  const edgeKey=(a,b)=>a<b?a+','+b:b+','+a;
  for(let i=0;i<idx.length;i+=3){const triangle=[ids[idx[i]],ids[idx[i+1]],ids[idx[i+2]]];
   for(let k=0;k<3;k++){const a=triangle[k],b=triangle[(k+1)%3],c=triangle[(k+2)%3];if(a===b)continue;neighbors[a].add(b);neighbors[b].add(a);const key=edgeKey(a,b);if(!edges.has(key))edges.set(key,{a,b,opposite:[]});edges.get(key).opposite.push(c);}
  }
  const boundary=geo.map(()=>[]);for(const edge of edges.values())if(edge.opposite.length===1){boundary[edge.a].push(edge.b);boundary[edge.b].push(edge.a);}
  const smooth=geo.map((v,i)=>{if(boundary[i].length===2)return v.clone().multiplyScalar(.75).addScaledVector(geo[boundary[i][0]],.125).addScaledVector(geo[boundary[i][1]],.125);const n=neighbors[i].size;if(!n)return v.clone();const beta=n===3?3/16:3/(8*n),out=v.clone().multiplyScalar(1-n*beta);for(const j of neighbors[i])out.addScaledVector(geo[j],beta);return out;});
  const positions=[],texcoords=[],indices=[],midpoints=new Map();
  for(let i=0;i<p.count;i++){positions.push(...smooth[ids[i]].toArray());texcoords.push(uv.getX(i),uv.getY(i));}
  function midpoint(a,b){const key=edgeKey(a,b);if(midpoints.has(key))return midpoints.get(key);const edge=edges.get(edgeKey(ids[a],ids[b]));let v=geo[ids[a]].clone().add(geo[ids[b]]).multiplyScalar(.5);
   if(edge?.opposite.length===2)v=geo[ids[a]].clone().add(geo[ids[b]]).multiplyScalar(.375).addScaledVector(geo[edge.opposite[0]],.125).addScaledVector(geo[edge.opposite[1]],.125);
   const index=positions.length/3;positions.push(...v.toArray());texcoords.push((uv.getX(a)+uv.getX(b))/2,(uv.getY(a)+uv.getY(b))/2);midpoints.set(key,index);return index;
  }
  for(let i=0;i<idx.length;i+=3){const a=idx[i],b=idx[i+1],c=idx[i+2],ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a);indices.push(a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca);}
  const next=new THREE.BufferGeometry();next.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));next.setAttribute('uv',new THREE.Float32BufferAttribute(texcoords,2));next.setIndex(indices);geometry.dispose();geometry=next;
 }
 geometry.computeVertexNormals();geometry.computeBoundingBox();return geometry;
}
