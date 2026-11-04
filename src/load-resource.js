export async function loadResource(loader,url){
 let error;
 for(let attempt=0;attempt<3;attempt++){
  try{return await loader.loadAsync(attempt?url+(url.includes('?')?'&':'?')+'retry='+attempt:url);}
  catch(e){error=e;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,700*(attempt+1)));}
 }
 throw error;
}
