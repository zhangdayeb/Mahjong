import {bountyScreenshotFixture} from './hall-activity-study/bounty-fixture.js';
export {bountyScreenshotFixture} from './hall-activity-study/bounty-fixture.js';
function find(node,name){if(node.name===name)return node;for(const child of node.children||[]){const result=find(child,name);if(result)return result;}}
function label(node,string){node.label._string=String(string);if((node.label['_N$overflow']??0)===0)node.label._nativeAutoWidth=true;}

// PassCheckView.onInit uses awardInfo.id to address a fixed native slot; the
// serialized children are not in numeric ID order or screen order.
export function buildBountyRewards(data,tree,fixture=bountyScreenshotFixture){
 const awardRoot=find(tree,'allAward'),runtime=data.runtime?.bounty;
 if(!awardRoot||!runtime)throw Error('Original bounty reward nodes or icon metadata unavailable');
 for(const reward of fixture.rewards){
  const slot=awardRoot.children.find(node=>node.name==='award'+reward.id),iconData=runtime.rewardIcons[reward.icon];
  if(!slot||!iconData)throw Error('Unknown original bounty reward '+reward.id+'/'+reward.icon);
  const icon=find(slot,'iconSpr');icon.sprite.frame=iconData.frame;icon.size=[...iconData.originalSize];
  // Native PassCheckView overrides table art to .47; emoji and currency keep
  // each prefab slot's .45/.4 scale, RAW SpriteFrame sizing and source offset.
  if(iconData.itemType==='牌桌')icon.trs[7]=icon.trs[8]=.47;
  else if(iconData.itemType==='头像框')icon.trs[7]=icon.trs[8]=.3;
  label(find(slot,'iconName'),reward.name);label(find(slot,'iconNum'),reward.amount);
 }
 label(find(tree,'nowMissile'),fixture.missileCount??'—');
 if(fixture.countdownDisplay!==undefined)label(find(tree,'actTime'),'剩余时间：'+fixture.countdownDisplay);
 if(fixture.showDrawDots===false){const right=find(tree,'rightAward');for(const name of['btn_l','btn_r']){const dot=find(find(right,name),'red');if(dot)dot.active=false;}}
 return tree;
}
