import test from 'node:test';
import assert from 'node:assert/strict';
import {HALL_GAMES_SOURCE} from './native-hall-games-source.js';
import {hallLabelWidth,hallBitmapTextPatches} from './native-hall-games-text.js';
const price=HALL_GAMES_SOURCE.prefabs[196].find(node=>node.name==='labelDifen'),close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-10,`${actual} != ${expected}`);
test('original fonts63 digits use source content widths and the native minus-one baseline',()=>{
 const cases=[['10',72],['100',114],['1000',156],['10000',198]];for(const [text,width]of cases){const layout=hallBitmapTextPatches({...price,text});assert.equal(hallLabelWidth(text,price.label),width);assert.equal(layout.width,width);assert.equal(layout.height,55);assert.equal(layout.fontScale,1);assert.equal(layout.frameUUID,price.label.font.frame.uuid);assert.equal(layout.fallback.length,0);for(const glyph of layout.glyphs){assert.equal(glyph.target[1],-1);assert.equal(glyph.target[3],60);}}
 const patch=hallBitmapTextPatches({...price,text:'100'});assert.deepEqual(patch.glyphs,[{char:'1',source:[156,181,30,60],target:[-57,-1,30,60]},{char:'0',source:[72,146,42,60],target:[-27,-1,42,60]},{char:'0',source:[72,146,42,60],target:[15,-1,42,60]}]);
 const altered=structuredClone(price);altered.text='100';altered.label.font.config.commonHeight=1000;assert.deepEqual(hallBitmapTextPatches(altered).glyphs,patch.glyphs,'atlas commonHeight may not shift the label baseline');
});
test('source anchors and fixed-rect horizontal/vertical alignment place glyphs in node-local coordinates',()=>{
 assert.equal(hallBitmapTextPatches({...price,text:'100',anchor:[1,.5]}).glyphs[0].target[0],-114);assert.equal(hallBitmapTextPatches({...price,text:'100',anchor:[0,.5]}).glyphs[0].target[0],0);
 for(const [align,x]of [[0,-100],[1,-57],[2,-14]]){const patch=hallBitmapTextPatches({...price,text:'100',size:[200,60],label:{...price.label,overflow:1,align}});assert.equal(patch.glyphs[0].target[0],x);}
 for(const [verticalAlign,y]of [[0,-15],[1,-1],[2,13]]){const patch=hallBitmapTextPatches({...price,text:'100',size:[200,60],label:{...price.label,overflow:1,verticalAlign}});assert.equal(patch.glyphs[0].target[1],y);}
});
test('other original fonts use visible glyph width, font scaling and their own label lineHeight',()=>{
 const province=HALL_GAMES_SOURCE.prefabs[222].find(node=>node.name==='lab_gameType'),patch=hallBitmapTextPatches(province);assert.equal(hallLabelWidth('6四季常春',province.label),239,'final glyph ink is wider than the sum of advances');assert.equal(patch.height,40);assert.deepEqual(patch.glyphs.at(-1).target,[56.5,-16,63,63]);
 const match=HALL_GAMES_SOURCE.prefabs[259].find(node=>node.name==='TipLabelP'),scaled=hallBitmapTextPatches(match);assert.equal(hallLabelWidth('200PK',match.label),95.16,'Cocos rounds auto content width to two decimal places');assert.equal(scaled.width,95.16);close(scaled.textWidth,95.15625);close(scaled.fontScale,21/32);close(scaled.glyphs[0].target[0],-47.578125);close(scaled.glyphs[0].target[1],7.21875);close(scaled.glyphs[0].target[2],25.59375);close(scaled.glyphs[0].target[3],34.125);
 const spaced=hallBitmapTextPatches({...price,text:'10',label:{...price.label,fontSize:64,spacing:4}});assert.equal(spaced.width,148,'spacing is four native pixels, not scaled with the font');
});
test('system NONE widths use the supplied canvas measurement and missing BMF characters are explicit fallback',()=>{
 const system=HALL_GAMES_SOURCE.prefabs[196].find(node=>node.name==='labelEnterCondition').label;let calls=0;assert.equal(hallLabelWidth('10万-4000万',system,(text,label)=>{calls++;assert.equal(text,'10万-4000万');assert.equal(label,system);return {width:143.25};}),143.25);assert.equal(calls,1);assert.equal(hallBitmapTextPatches({label:system,text:'—'}),null);
 const dash=hallBitmapTextPatches({...price,text:'—'});assert.deepEqual(dash.glyphs,[]);assert.deepEqual(dash.fallback,[{char:'—',x:-8,y:0,width:16,fontSize:32}]);const measuredDash=hallBitmapTextPatches({...price,text:'—'},()=>18.5);assert.equal(measuredDash.width,18.5);assert.equal(measuredDash.fallback[0].x,-9.25);
});
test('text helpers preserve source data and reject invalid metrics instead of emitting broken coordinates',()=>{
 const before=JSON.stringify(price);hallBitmapTextPatches({...price,text:'10000'});hallLabelWidth('10',price.label);assert.equal(JSON.stringify(price),before);assert.throws(()=>hallLabelWidth('one\ntwo',price.label),/single line/);assert.throws(()=>hallLabelWidth('x',{},()=>NaN),/finite non-negative/);assert.throws(()=>hallLabelWidth('x',{},()=>-1),/finite non-negative/);
 const invalid=structuredClone(price);invalid.label.font.config.fontSize=0;assert.throws(()=>hallBitmapTextPatches(invalid),/source size/);const badRect=structuredClone(price);badRect.label.font.config.fontDefDictionary[49].rect.width=-1;assert.throws(()=>hallBitmapTextPatches({...badRect,text:'1'}),/glyph rectangle/);
});
