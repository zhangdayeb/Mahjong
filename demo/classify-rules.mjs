import fs from 'node:fs';
const dir='demo/rule-study',games=JSON.parse(fs.readFileSync(dir+'/games.json'));
const topics=[['用牌与人数',/用牌|牌张使用|张牌|人数|[二三四两]人/],['开局与换牌',/换三张|换牌|定缺|起手|庄家/],['吃碰杠与赖子',/鸣牌|吃牌|不可以吃|碰|杠|红中|癞子|财神|百搭/],['胡牌与牌局结束',/和牌|胡牌|血流|牌墙|摸完|一炮多响|过手胡/],['计分与终局清算',/封顶|底注|退税|查花猪|查大叫|呼叫转移|赔付|结算/]];
const entries=games.map(g=>({id:g.id,name:g.name,aliases:g.aliases,topics:topics.map(([name,pattern])=>({name,excerpts:['BASERULE','CUSTOMRULE'].flatMap(page=>(g[page]||[]).map((text,index)=>({page,line:index+1,text}))).filter(x=>pattern.test(x.text))})),fanDescriptions:(g.FANRULE||[]).filter(s=>!s.startsWith('<pic>'))}));
fs.writeFileSync(dir+'/规则分类.json',JSON.stringify({note:'按关键词归类的原文摘录；未出现关键词不表示禁止，否定与可选条件请阅读原文。名称来自静态 PluginCfgs，尚未核对服务端大厅标签。',entries},null,2));
const lines=['全部玩法规则分类整理','以下按关键词归类原文，保留来源页与行号；否定词、条件和可选项均不删改。','未出现某项不能推断为不支持；规则编号与线上名称尚需核对。',''];
for(const g of entries){lines.push(`===== ${g.name}（${g.id}） =====`);for(const topic of g.topics){lines.push('【'+topic.name+'】',...topic.excerpts.map(x=>`[${x.page}:${x.line}] ${x.text}`));if(!topic.excerpts.length)lines.push('未匹配到相关文字，请查看完整规则。');}lines.push('【番型原文】',...g.fanDescriptions,'');}
fs.writeFileSync(dir+'/全部玩法分类整理.txt',lines.join('\n'));
const raw=JSON.parse(fs.readFileSync(dir+'/RuleCfg.json'));const screenshot={id:'screenshot-red',name:'血流红中',source:'用户提供截图：4928dacd，番型说明可见部分',partial:true,BASERULE:[],CUSTOMRULE:[],FANRULE:['一、基本番型（不可叠加）：','1、平胡x1：符合基本胡牌型的胡牌。','2、对对胡x2：4组刻子/杠子加1对将的胡牌。','3、清一色x4：胡牌时,所有牌都为同一种花色。']};
fs.writeFileSync(dir+'/screenshot-confirmed.json',JSON.stringify(screenshot,null,2));
fs.copyFileSync('asset-study/readable/modules/PrivateMsgMod.js',dir+'/source/PrivateMsgMod-readable.js');
console.log('Classified all',entries.length,'rule groups with source lines; kept screenshot evidence separate.');
