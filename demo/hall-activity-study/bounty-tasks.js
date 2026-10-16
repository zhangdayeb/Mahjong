// PassCheckView 2567 has an inline PassCheckTaskItem, not a separate prefab.
// This helper only binds local presentation data into a caller-owned tree.
// It does not read accounts, claim rewards, update balances or mutate metadata.
export const bountyTaskSource=Object.freeze({
 prefab:2567,
 templatePath:'PassCheckView/popBig/leftTask/list/content/item',
 itemSize:Object.freeze([530,100]),
 viewportSize:Object.freeze([540,460]),
 spacingY:-3,
 progressTotalLength:194,
 status:Object.freeze({unfinished:0,finished:1,claimable:2,claimed:3}),
});
const find=(node,name)=>node?.name===name?node:node?.children?.map(child=>find(child,name)).find(Boolean);
const listFor=tree=>find(find(tree,'leftTask'),'list');
const statusPriority=status=>status===2?3:status===0?2:1;

// PassCheckView.onInit: claimable, unfinished, finished; then source task ID.
// Screenshot fixtures have no server IDs, so equally ranked rows stay in order.
export function orderBountyTasks(tasks=[]){return tasks.map((task,index)=>({task,index})).sort((a,b)=>{
 const rank=statusPriority(b.task.status??0)-statusPriority(a.task.status??0);
 if(rank)return rank;
 if(Number.isFinite(a.task.id)&&Number.isFinite(b.task.id))return a.task.id-b.task.id;
 return a.index-b.index;
}).map(entry=>entry.task);}

function setText(node,string){if(!node?.label)return;node.label._string=String(string);
 if((node.label['_N$overflow']??0)===0)node.label._nativeAutoWidth=true;
}
function fillReward(slot,reward,icons){
 slot.active=true;
 const image=find(slot,'iconSpr');
 image.sprite.frame=reward?.frame??icons[reward?.icon];
 // Source item iconSpr uses cc.Sprite.SizeMode.RAW, 204 × 207, scale .34.
 // Native source frames preserve that original canvas; never use trimmed bounds.
 image.active=!!image.sprite.frame;
 setText(find(slot,'iconNum'),reward?.label??'');
}

export function bountyTaskScrollLimit(taskCount,viewportHeight=460){
 const length=Math.max(0,Number(taskCount)||0),height=length?length*100+(length-1)*-3:0;
 return Math.max(0,height-viewportHeight);
}

export function buildBountyTasks(data,tree,{tasks=[],scroll=0}={}){
 const originalList=listFor(data.prefabs?.[2567]?.tree),list=listFor(tree);
 const sourceContent=find(originalList,'content'),content=find(list,'content');
 const template=sourceContent?.children?.find(node=>node.name==='item');
 if(!template||!content)throw Error('Original PassCheckTaskItem template is unavailable');
 const icons=data.runtime?.bounty?.taskIcons||{},ordered=orderBountyTasks(tasks);
 const itemHeight=template.size[1],spacing=sourceContent.layout?.['_N$spacingY']??-3;
 content.size[1]=ordered.length?itemHeight*ordered.length+spacing*(ordered.length-1):0;
 content.trs[1]=Math.max(0,Math.min(Math.max(0,content.size[1]-list.size[1]),Number(scroll)||0));
 content.children=ordered.map((task,index)=>{
  const item=structuredClone(template),counter=Number(task.counter)||0,goal=Number(task.neednum)||0;
  const ratio=goal>0?Math.max(0,Math.min(1,counter/goal)):0,status=task.status??0;
  item.name='BountyTask'+index;
  item.trs[1]=-itemHeight*(1-item.anchor[1])-index*(itemHeight+spacing);
  item.bountyTask={key:task.key??String(task.id??index),status,index};
  setText(find(item,'taskName'),String(task.desc??'').replace('每日悬赏-','').replace('每周悬赏-',''));
  setText(find(item,'ProgressLbl'),counter+'/'+goal);
  const progress=find(item,'ProgressBar'),bar=find(progress,'Bar');
  bar.size[0]=bountyTaskSource.progressTotalLength*ratio;
  bar.active=ratio>0;
  const get=find(item,'btnGet'),unfinished=find(item,'btnUn'),finished=find(item,'btnFinish');
  get.active=status===2;unfinished.active=status===0;finished.active=status===1||status===3;
  // Keep the original component/handler, with a local key for the host callback.
  get.bountyTaskKey=item.bountyTask.key;
  get.button.events=get.button.events.map(event=>({...event,data:item.bountyTask.key}));
  const layout=find(item,'awardLayout'),slots=layout.children;
  const rewards=[...(task.rewards||[])];
  if(task.achieveValue!==undefined)rewards.push({icon:'experience',label:String(task.achieveValue)});
  layout.children=rewards.map((reward,rewardIndex)=>{
   const slot=structuredClone(slots[rewardIndex]||slots[0]);
   slot.trs[0]=(rewardIndex-(rewards.length-1)/2)*(slot.size[0]+(layout.layout?.['_N$spacingX']??14.5));
   fillReward(slot,reward,icons);return slot;
  });
  layout.size[0]=rewards.length?rewards.length*slots[0].size[0]+(rewards.length-1)*(layout.layout?.['_N$spacingX']??14.5):0;
  return item;
 });
 return tree;
}
