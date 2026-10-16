import fs from 'node:fs';
const uuid='b3d7212d-0025-4b7f-8da7-506580518060';
const url=`https://res.12317wan.com/gameModule/h5/zjscmj/4399H5/package/601907/assets/resources/import/b3/${uuid}.json`;
const response=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error(`原 SpriteFrame import HTTP ${response.status}`);
const body=await response.text();JSON.parse(body);fs.writeFileSync(`demo/tile-result-study/raw/frame-${uuid}.json`,body);console.log(`HTTP ${response.status}; saved original SpriteFrame ${uuid}`);
