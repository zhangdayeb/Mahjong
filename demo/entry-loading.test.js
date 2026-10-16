import test from 'node:test';
import assert from 'node:assert/strict';
import {preloadEntryResources} from './entry-loading.js';

test('loading progress measures successful resources and a failure prevents hall readiness',async()=>{
 const updates=[],result=await preloadEntryResources([{src:'one'},{src:'missing'},{src:'two'}],{load:async resource=>{if(resource.src==='missing')throw Error('404');},onProgress:value=>updates.push(value.percent)});
 assert.equal(result.ready,false);assert.deepEqual(result.failed,['missing']);assert.equal(result.loaded,2);assert.equal(result.percent,2/3*100);assert.equal(updates.at(-1),2/3*100);
});
test('a retry can become ready without reusing a failed attempt count',async()=>{
 const resources=[{src:'a'},{src:'b'}];const failed=await preloadEntryResources(resources,{load:async()=>{throw Error('offline');}});assert.equal(failed.percent,0);
 const updates=[],retried=await preloadEntryResources(resources,{load:async()=>{},onProgress:value=>updates.push(value.percent)});assert.equal(retried.ready,true);assert.equal(retried.percent,100);assert.deepEqual(updates,[0,50,100]);
});
